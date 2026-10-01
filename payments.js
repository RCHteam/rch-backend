const express = require('express');
const crypto = require('crypto');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { sendPaymentLinkEmail, sendOneTimePaymentEmail } = require('./email');
const { getSetting, setSetting } = require('./settings');

const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const Stripe = require('stripe');
  // Pinned explicitly (rather than relying on the account's dashboard-configured
  // default) because billing_cycle_anchor_config below requires 2026-06-24.dahlia
  // or later.
  return new Stripe(key, { apiVersion: '2026-08-26.dahlia' });
}

function siteUrl(req) {
  // Build the payment link from the request itself, so no extra env var is
  // needed — it just points back at whatever domain this backend is running on.
  return `${req.protocol}://${req.get('host')}`;
}

/* ------------------------------------------------------------------------
 * Session-based proration
 *
 * Practices run Tuesdays and Thursdays. When a family signs up partway
 * through a month, they should only be charged for the practices remaining
 * this month — not for a fraction of the calendar days remaining (a family
 * signing up on the 30th with 3 practices still ahead of them shouldn't be
 * charged as if almost the whole month has already passed).
 *
 * The club runs on Central time, so "today" is always computed there —
 * Render's server clock is UTC, and a naive `new Date()` comparison could
 * put "today" on the wrong side of midnight for a game near the day boundary.
 * ---------------------------------------------------------------------- */

function centralToday() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date()).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

function daysInMonth(year, month) { // month is 1-12
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// Counts this month's Tuesday/Thursday practice days in total, and how many
// remain from (and including) `fromDay` through the end of the month.
function countPracticeDays(year, month, fromDay) {
  const total = daysInMonth(year, month);
  let totalCount = 0;
  let remaining = 0;
  for (let d = 1; d <= total; d++) {
    const weekday = new Date(Date.UTC(year, month - 1, d)).getUTCDay(); // 0=Sun .. 6=Sat
    if (weekday === 2 || weekday === 4) { // Tuesday or Thursday
      totalCount++;
      if (d >= fromDay) remaining++;
    }
  }
  return { totalCount, remaining };
}

// Prorates a monthly amount by the fraction of this month's practices still
// ahead of the family, based on today's date in Central time.
function proratedMonthlyAmount(monthlyAmountCents) {
  const { year, month, day } = centralToday();
  const { totalCount, remaining } = countPracticeDays(year, month, day);
  const fraction = totalCount > 0 ? Math.min(1, remaining / totalCount) : 1;
  return { amountCents: Math.round(monthlyAmountCents * fraction), remaining, totalCount, fraction };
}

// The 3rd of the month AFTER the one being prorated — full, un-prorated
// monthly billing starts here. Returned as a Unix timestamp (midnight UTC),
// which is also how it's read back after being round-tripped through the
// next_billing_anchor DATE column.
function nextAnchorTimestamp() {
  const { year, month } = centralToday();
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return Math.floor(Date.UTC(nextYear, nextMonth - 1, 3) / 1000);
}

// Proration lock mode ("Option B" vs "Option A" — see schema.sql). 'locked'
// means the amount a family owes was fixed the moment the admin generated
// their payment link, so a late payer still owes what was shown to them.
// 'live' (the original behavior) recalculates at the moment they actually
// pay, so a late payer owes less (fewer practices left).
async function getProrationMode() {
  return await getSetting('proration_lock_mode', 'locked');
}

// Resolves what a given payment_links row should actually charge/display
// right now: the value locked in at link creation (if lock mode is on and
// this link has one), or a fresh live calculation otherwise.
async function resolveProration(entry) {
  const mode = await getProrationMode();
  if (mode === 'locked' && entry.locked_amount_cents != null) {
    return {
      amountCents: entry.locked_amount_cents,
      remaining: entry.locked_practices_remaining,
      totalCount: entry.locked_practices_total,
      anchorTs: entry.locked_anchor_date
        ? Math.floor(new Date(entry.locked_anchor_date).getTime() / 1000)
        : nextAnchorTimestamp(),
      locked: true,
    };
  }
  const live = proratedMonthlyAmount(entry.monthly_amount_cents);
  return { ...live, anchorTs: nextAnchorTimestamp(), locked: false };
}

router.get('/admin/proration-mode', requireAdmin, async (req, res) => {
  try {
    res.json({ mode: await getProrationMode() });
  } catch (err) {
    console.error('Get proration mode error:', err);
    res.status(500).json({ error: 'Could not load proration mode.' });
  }
});

router.post('/admin/proration-mode', requireAdmin, async (req, res) => {
  const { mode } = req.body || {};
  if (!['locked', 'live'].includes(mode)) {
    return res.status(400).json({ error: 'mode must be "locked" or "live".' });
  }
  try {
    await setSetting('proration_lock_mode', mode);
    res.json({ mode });
  } catch (err) {
    console.error('Save proration mode error:', err);
    res.status(500).json({ error: 'Could not save proration mode.' });
  }
});

// Admin: after you've approved a family, generate their unique payment link
// and email it to them immediately.
router.post('/admin/payment-links', requireAdmin, async (req, res) => {
  const { registrationType, registrationId, seasonEndDate, tierLabel } = req.body || {};
  // NOTE: these use `!= null` rather than `||` so that an explicit 0 (e.g. no
  // kit fee this month) is respected instead of silently falling back to the
  // default — `Number(0) || 5000` would otherwise incorrectly yield 5000.
  const oneTimeAmount = req.body?.oneTimeAmount != null ? Number(req.body.oneTimeAmount) : 5000;
  const monthlyAmount = req.body?.monthlyAmount != null ? Number(req.body.monthlyAmount) : 6000;

  if (!['skills', 'join', 'player'].includes(registrationType)) {
    return res.status(400).json({ error: 'registrationType must be "skills", "join", or "player".' });
  }
  if (!registrationId) return res.status(400).json({ error: 'registrationId is required.' });
  if (!seasonEndDate || !/^\d{4}-\d{2}-\d{2}$/.test(seasonEndDate)) {
    return res.status(400).json({ error: 'seasonEndDate is required, format YYYY-MM-DD.' });
  }

  try {
    let childName, parentName, email, programLabel;

    if (registrationType === 'skills') {
      const r = await pool.query('SELECT * FROM skills_registrations WHERE id = $1', [registrationId]);
      if (!r.rows[0]) return res.status(404).json({ error: 'Registration not found.' });
      childName = r.rows[0].full_name;
      parentName = r.rows[0].full_name;
      email = r.rows[0].email;
      programLabel = 'Skills Training';
    } else if (registrationType === 'join') {
      const r = await pool.query('SELECT * FROM join_registrations WHERE id = $1', [registrationId]);
      if (!r.rows[0]) return res.status(404).json({ error: 'Registration not found.' });
      childName = r.rows[0].child_name;
      parentName = r.rows[0].parent_name;
      email = r.rows[0].email;
      programLabel = `Sultans FC — ${r.rows[0].age_group}`;
    } else {
      // registrationType === 'player' — a roster entry managed directly from
      // the Players Roster table, rather than one of the public signup forms.
      const r = await pool.query('SELECT * FROM players WHERE id = $1', [registrationId]);
      if (!r.rows[0]) return res.status(404).json({ error: 'Player not found.' });
      const player = r.rows[0];
      if (!player.parent_email) {
        return res.status(400).json({ error: 'This player has no parent email on file — add one on the roster first.' });
      }
      childName = player.player_name;
      parentName = player.parent_name || player.player_name;
      email = player.parent_email;
      const programs = [player.rch && 'RCH Elite Training', player.sultans && 'Sultans FC'].filter(Boolean);
      programLabel = `${programs.length ? programs.join(' + ') : 'RCH Elite Training'} — ${player.grade}`;
    }

    if (tierLabel) programLabel = `${programLabel} (${tierLabel})`;

    const token = crypto.randomBytes(24).toString('hex');

    // Always compute and store what proration looks like right now, as of
    // link creation — used as the charged/displayed amount when proration
    // lock mode is 'locked' (see resolveProration above). Harmless to store
    // even in 'live' mode; it's simply ignored in that mode.
    const lockedProration = proratedMonthlyAmount(monthlyAmount);
    const lockedAnchorTs = nextAnchorTimestamp();

    const insertRes = await pool.query(
      `INSERT INTO payment_links
        (token, registration_type, registration_id, child_name, parent_name, email, program_label,
         one_time_amount_cents, monthly_amount_cents, season_end_date,
         locked_amount_cents, locked_practices_remaining, locked_practices_total, locked_anchor_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,to_timestamp($14)::date)
       RETURNING *`,
      [token, registrationType, registrationId, childName, parentName, email, programLabel,
       oneTimeAmount, monthlyAmount, seasonEndDate,
       lockedProration.amountCents, lockedProration.remaining, lockedProration.totalCount, lockedAnchorTs]
    );

    const link = `${siteUrl(req)}/pay/${token}`;

    await sendPaymentLinkEmail({
      to: email, parentName, childName, programLabel, link,
      oneTime: oneTimeAmount, monthly: monthlyAmount, seasonEndDate,
    });

    res.json({ ok: true, token, link, entry: insertRes.rows[0] });
  } catch (err) {
    console.error('Create payment link error:', err);
    res.status(500).json({ error: 'Could not create payment link.' });
  }
});

// Admin: read/update the live amounts used when generating a payment link
// (the two monthly tiers + the kit fee) — editable from the dashboard so a
// price change (e.g. a new season's rate) never needs a code deploy.
router.get('/admin/payment-pricing', requireAdmin, async (req, res) => {
  try {
    const [oneCents, twoCents, kitCents, onlineCents] = await Promise.all([
      getSetting('payment_one_session_monthly_cents', '6000'),
      getSetting('payment_two_session_monthly_cents', '10000'),
      getSetting('kit_fee_cents', '5000'),
      getSetting('payment_online_course_monthly_cents', '3120'),
    ]);
    res.json({
      oneSessionMonthlyCents: parseInt(oneCents, 10),
      twoSessionMonthlyCents: parseInt(twoCents, 10),
      kitFeeCents: parseInt(kitCents, 10),
      onlineCourseMonthlyCents: parseInt(onlineCents, 10),
    });
  } catch (err) {
    console.error('Get payment pricing error:', err);
    res.status(500).json({ error: 'Could not load payment pricing.' });
  }
});

router.post('/admin/payment-pricing', requireAdmin, async (req, res) => {
  const { oneSessionMonthlyCents, twoSessionMonthlyCents, kitFeeCents, onlineCourseMonthlyCents } = req.body || {};
  const vals = [oneSessionMonthlyCents, twoSessionMonthlyCents, kitFeeCents, onlineCourseMonthlyCents];
  if (vals.some((v) => !Number.isFinite(Number(v)) || Number(v) < 0)) {
    return res.status(400).json({ error: 'All four amounts must be non-negative numbers.' });
  }
  try {
    const one = Math.round(Number(oneSessionMonthlyCents));
    const two = Math.round(Number(twoSessionMonthlyCents));
    const kit = Math.round(Number(kitFeeCents));
    const online = Math.round(Number(onlineCourseMonthlyCents));
    await Promise.all([
      setSetting('payment_one_session_monthly_cents', String(one)),
      setSetting('payment_two_session_monthly_cents', String(two)),
      setSetting('kit_fee_cents', String(kit)),
      setSetting('payment_online_course_monthly_cents', String(online)),
    ]);
    res.json({ oneSessionMonthlyCents: one, twoSessionMonthlyCents: two, kitFeeCents: kit, onlineCourseMonthlyCents: online });
  } catch (err) {
    console.error('Save payment pricing error:', err);
    res.status(500).json({ error: 'Could not save payment pricing.' });
  }
});

// Public: the /pay/:token page calls this to display the right family + amounts.
router.get('/pay/:token', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM payment_links WHERE token = $1', [req.params.token]);
    const entry = r.rows[0];
    if (!entry) return res.status(404).json({ error: 'This payment link is invalid.' });
    const proration = await resolveProration(entry);
    res.json({
      childName: entry.child_name,
      parentName: entry.parent_name,
      programLabel: entry.program_label,
      oneTimeAmount: entry.one_time_amount_cents,
      monthlyAmount: entry.monthly_amount_cents,
      proratedAmount: proration.amountCents,
      practicesRemaining: proration.remaining,
      practicesTotal: proration.totalCount,
      seasonEndDate: entry.season_end_date,
      status: entry.status,
    });
  } catch (err) {
    console.error('Lookup payment link error:', err);
    res.status(500).json({ error: 'Could not load this payment link.' });
  }
});

// Public: charges the family today for (a) the kit fee, if this link
// includes one, and (b) this month's practices only — prorated by how many
// Tuesday/Thursday practices are left, not by calendar days. The ongoing
// monthly subscription (at the full rate) is started separately, once this
// payment succeeds, so it doesn't charge anything extra today — see the
// checkout.session.completed handler below.
router.post('/pay/:token/checkout', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ error: 'Payments are not configured yet. Please contact RCH Elite Training.' });

  try {
    const r = await pool.query('SELECT * FROM payment_links WHERE token = $1', [req.params.token]);
    const entry = r.rows[0];
    if (!entry) return res.status(404).json({ error: 'This payment link is invalid.' });
    if (entry.status !== 'pending') {
      return res.status(409).json({ error: 'This payment link has already been used.' });
    }

    const base = siteUrl(req);
    const proration = await resolveProration(entry);
    const anchorTs = proration.anchorTs;

    const lineItems = [];
    if (entry.one_time_amount_cents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `${entry.program_label} — Registration & Kit Fee` },
          unit_amount: entry.one_time_amount_cents,
        },
        quantity: 1,
      });
    }
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${entry.program_label} — This month (${proration.remaining} of ${proration.totalCount} practices remaining)`,
        },
        unit_amount: Math.max(proration.amountCents, 0),
      },
      quantity: 1,
    });

    // mode: 'payment' (not 'subscription') — this charge is a one-off for
    // the kit fee + the prorated partial month. setup_future_usage saves the
    // card so the real subscription (created in the webhook once this
    // succeeds) can charge it automatically starting next month.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: entry.email,
      customer_creation: 'always',
      payment_intent_data: { setup_future_usage: 'off_session' },
      line_items: lineItems,
      success_url: `${base}/pay/${entry.token}/success`,
      cancel_url: `${base}/pay/${entry.token}`,
      metadata: { payment_link_token: entry.token },
    });

    await pool.query(
      `UPDATE payment_links
       SET stripe_checkout_session_id = $1, next_billing_anchor = to_timestamp($2)::date, prorated_amount_cents = $3
       WHERE token = $4`,
      [session.id, anchorTs, proration.amountCents, entry.token]
    );

    res.json({ url: session.url });
  } catch (err) {
    console.error('Create checkout session error:', err);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

// Admin: pause a family's monthly billing until a resume date (e.g. winter
// break travel) — Stripe skips charges during the pause and resumes
// automatically on the given date, no manual follow-up needed.
router.post('/admin/payment-links/pause', requireAdmin, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ error: 'Payments are not configured yet.' });

  const { registrationType, registrationId, resumesAt } = req.body || {};
  if (!['skills', 'join', 'player'].includes(registrationType)) {
    return res.status(400).json({ error: 'registrationType must be "skills", "join", or "player".' });
  }
  if (!registrationId) return res.status(400).json({ error: 'registrationId is required.' });
  if (!resumesAt || !/^\d{4}-\d{2}-\d{2}$/.test(resumesAt)) {
    return res.status(400).json({ error: 'resumesAt is required, format YYYY-MM-DD.' });
  }

  try {
    const r = await pool.query(
      `SELECT * FROM payment_links
       WHERE registration_type = $1 AND registration_id = $2 AND status = 'completed'
       ORDER BY created_at DESC LIMIT 1`,
      [registrationType, registrationId]
    );
    const entry = r.rows[0];
    if (!entry || !entry.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active paid subscription found for this family.' });
    }

    const resumeTimestamp = Math.floor(new Date(`${resumesAt}T00:00:00Z`).getTime() / 1000);
    await stripe.subscriptions.update(entry.stripe_subscription_id, {
      pause_collection: { behavior: 'void', resumes_at: resumeTimestamp },
    });
    await pool.query('UPDATE payment_links SET paused_until = $1 WHERE id = $2', [resumesAt, entry.id]);

    res.json({ ok: true, pausedUntil: resumesAt });
  } catch (err) {
    console.error('Pause billing error:', err);
    res.status(500).json({ error: 'Could not pause billing. Please try again.' });
  }
});

// Admin: cancel a family's subscription outright — e.g. to end an October
// enrollment cleanly before November's price change takes effect, instead of
// letting the old (lower) rate auto-charge on its scheduled date. Cancels
// immediately; if the subscription is still in its trial period (as October
// signups are, until their first real charge on next_billing_anchor), this
// cancels it before it ever charges anything.
router.post('/admin/payment-links/cancel', requireAdmin, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ error: 'Payments are not configured yet.' });

  const { registrationType, registrationId } = req.body || {};
  if (!['skills', 'join', 'player'].includes(registrationType)) {
    return res.status(400).json({ error: 'registrationType must be "skills", "join", or "player".' });
  }
  if (!registrationId) return res.status(400).json({ error: 'registrationId is required.' });

  try {
    const r = await pool.query(
      `SELECT * FROM payment_links
       WHERE registration_type = $1 AND registration_id = $2 AND status = 'completed'
       ORDER BY created_at DESC LIMIT 1`,
      [registrationType, registrationId]
    );
    const entry = r.rows[0];
    if (!entry || !entry.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active paid subscription found for this family.' });
    }

    await stripe.subscriptions.cancel(entry.stripe_subscription_id);
    await pool.query(`UPDATE payment_links SET status = 'canceled' WHERE id = $1`, [entry.id]);

    res.json({ ok: true });
  } catch (err) {
    console.error('Cancel billing error:', err);
    res.status(500).json({ error: 'Could not cancel billing. Please try again.' });
  }
});

// Admin: resume billing immediately (undoes a pause early, if needed).
router.post('/admin/payment-links/resume', requireAdmin, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ error: 'Payments are not configured yet.' });

  const { registrationType, registrationId } = req.body || {};
  if (!['skills', 'join', 'player'].includes(registrationType)) {
    return res.status(400).json({ error: 'registrationType must be "skills", "join", or "player".' });
  }
  if (!registrationId) return res.status(400).json({ error: 'registrationId is required.' });

  try {
    const r = await pool.query(
      `SELECT * FROM payment_links
       WHERE registration_type = $1 AND registration_id = $2 AND status = 'completed'
       ORDER BY created_at DESC LIMIT 1`,
      [registrationType, registrationId]
    );
    const entry = r.rows[0];
    if (!entry || !entry.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active paid subscription found for this family.' });
    }

    await stripe.subscriptions.update(entry.stripe_subscription_id, { pause_collection: '' });
    await pool.query('UPDATE payment_links SET paused_until = NULL WHERE id = $1', [entry.id]);

    res.json({ ok: true });
  } catch (err) {
    console.error('Resume billing error:', err);
    res.status(500).json({ error: 'Could not resume billing. Please try again.' });
  }
});

/* ------------------------------------------------------------------------
 * Stand-alone one-time payments (Finances tab)
 *
 * Not tied to a registration, not recurring — just "collect $X from whoever
 * I send this link to", for things like a tournament fee, a replacement
 * kit, or a quick test charge.
 *
 * Two ways to create one:
 *  - "Create Link": a single untargeted link (admin copies/shares it
 *    manually) — player_id/email etc. stay NULL on that row.
 *  - "Send Link": targets a roster audience (all players, all RCH, a grade,
 *    one individual, ...) and gives EACH matching family its own row/token,
 *    emailed directly — a shared link would show "already used" for
 *    everyone else the moment the first family paid.
 * ------------------------------------------------------------------------ */

const AUDIENCE_GRADES = ['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'];

// Resolves a "Send Link" audience (scope + optional grade/playerId) into the
// actual, CURRENT list of matching roster players — always recomputed
// server-side at preview time and again at send time, rather than trusting
// a list the admin's browser already has, so a roster change in between
// (or a stale preview) can't send to the wrong people.
async function resolveOneTimeRecipients({ scope, grade, playerId }) {
  if (scope === 'individual') {
    if (!playerId) throw new Error('Please choose a player.');
    const r = await pool.query('SELECT * FROM players WHERE id = $1 AND archived_at IS NULL', [playerId]);
    if (!r.rows[0]) throw new Error('That player was not found on the active roster.');
    return r.rows;
  }

  const conditions = ['archived_at IS NULL'];
  const params = [];
  if (scope === 'all') {
    // no extra filter
  } else if (scope === 'all_rch') {
    conditions.push('rch = true');
  } else if (scope === 'all_sultans') {
    conditions.push('sultans = true');
  } else if (scope === 'grade' || scope === 'rch_grade' || scope === 'sultans_grade') {
    if (!AUDIENCE_GRADES.includes(grade)) throw new Error('Please choose a valid grade.');
    params.push(grade);
    conditions.push(`grade = $${params.length}`);
    if (scope === 'rch_grade') conditions.push('rch = true');
    if (scope === 'sultans_grade') conditions.push('sultans = true');
  } else {
    throw new Error('Please choose who to send this to.');
  }

  const where = 'WHERE ' + conditions.join(' AND ');
  const result = await pool.query(`SELECT * FROM players ${where} ORDER BY grade, player_name`, params);
  return result.rows;
}

// Admin: preview who a "Send Link" audience would actually reach, before
// anything is created or emailed.
router.get('/admin/one-time-payments/recipients', requireAdmin, async (req, res) => {
  const { scope, grade, playerId } = req.query;
  try {
    const players = await resolveOneTimeRecipients({ scope, grade, playerId });
    const recipients = players.map((p) => ({
      id: p.id,
      playerName: p.player_name,
      grade: p.grade,
      parentName: p.parent_name,
      email: p.parent_email || null,
    }));
    res.json({
      recipients,
      sendableCount: recipients.filter((r) => r.email).length,
      skipped: recipients.filter((r) => !r.email).map((r) => r.playerName),
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not resolve recipients.' });
  }
});

// Admin: "Send Link" — creates one payment link per matching family (with a
// parent email on file) and emails each their own link immediately. Players
// without an email on file are skipped and reported back, not an error.
router.post('/admin/one-time-payments/send', requireAdmin, async (req, res) => {
  const { title, description, amountCents, scope, grade, playerId } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'Please enter a title.' });
  }
  if (!Number.isFinite(Number(amountCents)) || Number(amountCents) <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than $0.' });
  }

  let players;
  try {
    players = await resolveOneTimeRecipients({ scope, grade, playerId });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Could not resolve recipients.' });
  }

  const withEmail = players.filter((p) => p.parent_email);
  const skipped = players.filter((p) => !p.parent_email).map((p) => p.player_name);

  if (!withEmail.length) {
    return res.status(400).json({ error: 'No matching player has a parent email on file.', skipped });
  }

  const trimmedTitle = String(title).trim();
  const trimmedDescription = String(description || '').trim();
  const roundedAmount = Math.round(Number(amountCents));

  const sent = [];
  const failed = [];
  for (const player of withEmail) {
    try {
      const token = crypto.randomBytes(24).toString('hex');
      await pool.query(
        `INSERT INTO one_time_payments
          (token, title, description, amount_cents, player_id, recipient_name, parent_name, email)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [token, trimmedTitle, trimmedDescription, roundedAmount,
         player.id, player.player_name, player.parent_name || '', player.parent_email]
      );
      const link = `${siteUrl(req)}/pay/one-time/${token}`;
      await sendOneTimePaymentEmail({
        to: player.parent_email,
        parentName: player.parent_name,
        childName: player.player_name,
        title: trimmedTitle,
        description: trimmedDescription,
        amountCents: roundedAmount,
        link,
      });
      sent.push({ playerId: player.id, playerName: player.player_name, email: player.parent_email });
    } catch (err) {
      console.error('Send one-time payment to player', player.id, 'failed:', err);
      failed.push(player.player_name);
    }
  }

  res.json({ ok: true, sentCount: sent.length, sent, skipped, failed });
});

// Admin: create a one-time payment link.
router.post('/admin/one-time-payments', requireAdmin, async (req, res) => {
  const { title, description, amountCents } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'Please enter a title.' });
  }
  if (!Number.isFinite(Number(amountCents)) || Number(amountCents) <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than $0.' });
  }

  try {
    const token = crypto.randomBytes(24).toString('hex');
    const insertRes = await pool.query(
      `INSERT INTO one_time_payments (token, title, description, amount_cents)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [token, String(title).trim(), String(description || '').trim(), Math.round(Number(amountCents))]
    );
    const link = `${siteUrl(req)}/pay/one-time/${token}`;
    res.status(201).json({ ok: true, token, link, entry: insertRes.rows[0] });
  } catch (err) {
    console.error('Create one-time payment error:', err);
    res.status(500).json({ error: 'Could not create this payment link.' });
  }
});

// Admin: list all one-time payment links, newest first.
router.get('/admin/one-time-payments', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM one_time_payments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('List one-time payments error:', err);
    res.status(500).json({ error: 'Could not load one-time payments.' });
  }
});

// Admin: delete a one-time payment link (e.g. a test link once you're done with it).
// Only allowed while still pending — a completed one is a real payment record.
router.delete('/admin/one-time-payments/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM one_time_payments WHERE id = $1 AND status = 'pending' RETURNING *`,
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(409).json({ error: 'Only a pending (unpaid) link can be deleted.' });
    }
    res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('Delete one-time payment error:', err);
    res.status(500).json({ error: 'Could not delete this payment link.' });
  }
});

// Public: the /pay/one-time/:token page calls this to display title/description/amount.
router.get('/pay/one-time/:token', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM one_time_payments WHERE token = $1', [req.params.token]);
    const entry = r.rows[0];
    if (!entry) return res.status(404).json({ error: 'This payment link is invalid.' });
    res.json({
      title: entry.title,
      description: entry.description,
      amountCents: entry.amount_cents,
      status: entry.status,
    });
  } catch (err) {
    console.error('Lookup one-time payment error:', err);
    res.status(500).json({ error: 'Could not load this payment link.' });
  }
});

// Public: starts a plain, single Stripe Checkout charge — no subscription,
// no proration, no saved card required afterward.
router.post('/pay/one-time/:token/checkout', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ error: 'Payments are not configured yet. Please contact RCH Elite Training.' });

  try {
    const r = await pool.query('SELECT * FROM one_time_payments WHERE token = $1', [req.params.token]);
    const entry = r.rows[0];
    if (!entry) return res.status(404).json({ error: 'This payment link is invalid.' });
    if (entry.status !== 'pending') {
      return res.status(409).json({ error: 'This payment link has already been used.' });
    }

    const base = siteUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: entry.title,
            ...(entry.description ? { description: entry.description } : {}),
          },
          unit_amount: entry.amount_cents,
        },
        quantity: 1,
      }],
      success_url: `${base}/pay/one-time/${entry.token}/success`,
      cancel_url: `${base}/pay/one-time/${entry.token}`,
      metadata: { one_time_payment_token: entry.token },
    });

    await pool.query(
      `UPDATE one_time_payments SET stripe_checkout_session_id = $1 WHERE token = $2`,
      [session.id, entry.token]
    );

    res.json({ url: session.url });
  } catch (err) {
    console.error('Create one-time checkout session error:', err);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

// Stripe webhook — mounted in server.js BEFORE express.json(), since Stripe
// requires the raw request body to verify the signature.
async function handleStripeWebhook(req, res) {
  const stripe = getStripe();
  if (!stripe) return res.status(500).send('Stripe not configured.');

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const oneTimeToken = session.metadata && session.metadata.one_time_payment_token;
      if (oneTimeToken) {
        await pool.query(
          `UPDATE one_time_payments
           SET status = 'completed', completed_at = now(), stripe_customer_id = $1
           WHERE token = $2`,
          [session.customer, oneTimeToken]
        );
      }

      const token = session.metadata && session.metadata.payment_link_token;
      if (token) {
        const linkRes = await pool.query('SELECT * FROM payment_links WHERE token = $1', [token]);
        const entry = linkRes.rows[0];

        await pool.query(
          `UPDATE payment_links
           SET status = 'completed', completed_at = now(), stripe_customer_id = $1
           WHERE token = $2`,
          [session.customer, token]
        );

        // The checkout the family just completed was a one-off charge (kit
        // fee + this month's prorated amount) — now start the real ongoing
        // subscription at the full monthly rate. trial_end defers its first
        // charge to next_billing_anchor (computed when the checkout session
        // was created), so nothing is charged twice for this month.
        if (entry && session.customer) {
          try {
            let paymentMethodId;
            if (session.payment_intent) {
              const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
              paymentMethodId = pi.payment_method;
            }
            if (paymentMethodId) {
              await stripe.paymentMethods.attach(paymentMethodId, { customer: session.customer });
              await stripe.customers.update(session.customer, {
                invoice_settings: { default_payment_method: paymentMethodId },
              });
            }

            const anchorTs = entry.next_billing_anchor
              ? Math.floor(new Date(entry.next_billing_anchor).getTime() / 1000)
              : nextAnchorTimestamp();
            const cancelAt = Math.floor(new Date(entry.season_end_date).getTime() / 1000 + 23 * 3600 + 59 * 60 + 59);

            const subscription = await stripe.subscriptions.create({
              customer: session.customer,
              items: [{
                price_data: {
                  currency: 'usd',
                  product_data: { name: `${entry.program_label} — Monthly Season Fee` },
                  unit_amount: entry.monthly_amount_cents,
                  recurring: { interval: 'month' },
                },
              }],
              proration_behavior: 'none',
              trial_end: anchorTs,
              cancel_at: cancelAt,
              metadata: { payment_link_token: token },
            });

            await pool.query('UPDATE payment_links SET stripe_subscription_id = $1 WHERE token = $2', [subscription.id, token]);
          } catch (subErr) {
            console.error('Failed to start follow-on subscription:', subErr.message);
          }
        }
      }
    }
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      await pool.query(
        `UPDATE payment_links SET status = 'canceled' WHERE stripe_subscription_id = $1`,
        [sub.id]
      );
    }

    // Tracks the health of each MONTHLY charge after the initial checkout —
    // lets /admin flag a family whose card got declined on a later month,
    // instead of showing "Paid" forever after the very first successful charge.
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await pool.query(
          `UPDATE payment_links SET last_payment_status = 'failed', last_payment_at = now()
           WHERE stripe_subscription_id = $1`,
          [invoice.subscription]
        );
      }
    }
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await pool.query(
          `UPDATE payment_links SET last_payment_status = 'succeeded', last_payment_at = now()
           WHERE stripe_subscription_id = $1`,
          [invoice.subscription]
        );
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handling error:', err);
    res.status(500).send('Webhook handler error.');
  }
}

module.exports = { router, handleStripeWebhook };
