const express = require('express');
const crypto = require('crypto');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { sendPaymentLinkEmail } = require('./email');
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

    const insertRes = await pool.query(
      `INSERT INTO payment_links
        (token, registration_type, registration_id, child_name, parent_name, email, program_label,
         one_time_amount_cents, monthly_amount_cents, season_end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [token, registrationType, registrationId, childName, parentName, email, programLabel,
       oneTimeAmount, monthlyAmount, seasonEndDate]
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
    const [oneCents, twoCents, kitCents] = await Promise.all([
      getSetting('payment_one_session_monthly_cents', '6000'),
      getSetting('payment_two_session_monthly_cents', '10000'),
      getSetting('kit_fee_cents', '5000'),
    ]);
    res.json({
      oneSessionMonthlyCents: parseInt(oneCents, 10),
      twoSessionMonthlyCents: parseInt(twoCents, 10),
      kitFeeCents: parseInt(kitCents, 10),
    });
  } catch (err) {
    console.error('Get payment pricing error:', err);
    res.status(500).json({ error: 'Could not load payment pricing.' });
  }
});

router.post('/admin/payment-pricing', requireAdmin, async (req, res) => {
  const { oneSessionMonthlyCents, twoSessionMonthlyCents, kitFeeCents } = req.body || {};
  const vals = [oneSessionMonthlyCents, twoSessionMonthlyCents, kitFeeCents];
  if (vals.some((v) => !Number.isFinite(Number(v)) || Number(v) < 0)) {
    return res.status(400).json({ error: 'All three amounts must be non-negative numbers.' });
  }
  try {
    const one = Math.round(Number(oneSessionMonthlyCents));
    const two = Math.round(Number(twoSessionMonthlyCents));
    const kit = Math.round(Number(kitFeeCents));
    await Promise.all([
      setSetting('payment_one_session_monthly_cents', String(one)),
      setSetting('payment_two_session_monthly_cents', String(two)),
      setSetting('kit_fee_cents', String(kit)),
    ]);
    res.json({ oneSessionMonthlyCents: one, twoSessionMonthlyCents: two, kitFeeCents: kit });
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
    const proration = proratedMonthlyAmount(entry.monthly_amount_cents);
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
    const proration = proratedMonthlyAmount(entry.monthly_amount_cents);
    const anchorTs = nextAnchorTimestamp();

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
