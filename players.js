const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { getSetting, setSetting } = require('./settings');

const router = express.Router();

const GRADES = ['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'];
const VALID_GRADES = new Set(GRADES);
const VALID_SESSION_TYPES = new Set(['one', 'two', 'online']);
function normalizeSessionType(sessionType, fallback) {
  return VALID_SESSION_TYPES.has(sessionType) ? sessionType : (fallback || 'one');
}

// Admin: list players, optionally filtered to one grade — feeds the roster
// table on the dashboard. Archived (unsubscribed/quit) players are excluded
// by default; pass ?archived=true to see the archive instead (the "Data"
// section), or ?archived=all for both.
router.get('/admin/players', requireAdmin, async (req, res) => {
  const { grade, archived } = req.query;
  try {
    const conditions = [];
    const params = [];
    if (grade) { params.push(grade); conditions.push(`p.grade = $${params.length}`); }
    if (archived === 'true') conditions.push('p.archived_at IS NOT NULL');
    else if (archived !== 'all') conditions.push('p.archived_at IS NULL');
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    // Pulls in each player's most recent payment link (if any) so the roster
    // can show a live Pending/Paid/Declined status without a separate
    // lookup per row — status drives paymentLabel() on the dashboard.
    // Links created before the last "Reset Payment Status" no longer count,
    // so everyone reads "Not sent" until a fresh link goes out.
    const resetAt = await getSetting('payment_status_reset_at', null);
    params.push(resetAt);
    const resetParam = `$${params.length}`;
    const result = await pool.query(
      `SELECT p.*,
              pl.status AS payment_status,
              pl.last_payment_status,
              pl.paused_until
       FROM players p
       LEFT JOIN LATERAL (
         SELECT status, last_payment_status, paused_until
         FROM payment_links
         WHERE registration_type = 'player' AND registration_id = p.id
           AND (${resetParam}::timestamptz IS NULL OR created_at > ${resetParam}::timestamptz)
         ORDER BY created_at DESC
         LIMIT 1
       ) pl ON true
       ${where}
       ORDER BY p.grade, p.player_name`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List players error:', err);
    res.status(500).json({ error: 'Could not load players.' });
  }
});

// Admin: add a player to the roster.
router.post('/admin/players', requireAdmin, async (req, res) => {
  const {
    grade, playerName, dob, parentName, parentPhone, parentEmail,
    sessionType, rch, sultans, discountCents,
  } = req.body || {};

  if (!VALID_GRADES.has(grade)) {
    return res.status(400).json({ error: `grade must be one of: ${GRADES.join(', ')}` });
  }
  if (!playerName || !String(playerName).trim()) {
    return res.status(400).json({ error: "Please enter the player's name." });
  }
  const session = normalizeSessionType(sessionType);

  try {
    const insertRes = await pool.query(
      `INSERT INTO players
        (grade, player_name, dob, parent_name, parent_phone, parent_email, session_type, rch, sultans, discount_cents)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [grade, playerName.trim(), dob || null, parentName || '', parentPhone || '', parentEmail || '',
       session, !!rch, !!sultans, Number(discountCents) || 0]
    );
    res.status(201).json({ ok: true, entry: insertRes.rows[0] });
  } catch (err) {
    console.error('Add player error:', err);
    res.status(500).json({ error: 'Could not add this player.' });
  }
});

// Admin: edit an existing player's roster info. Same fields as adding a
// player; whatever is provided in the body replaces that field, so a partial
// body only touches the fields it names.
router.put('/admin/players/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const existingRes = await pool.query('SELECT * FROM players WHERE id = $1', [id]);
    const existing = existingRes.rows[0];
    if (!existing) return res.status(404).json({ error: 'Player not found.' });

    const {
      grade, playerName, dob, parentName, parentPhone, parentEmail,
      sessionType, rch, sultans, discountCents,
    } = req.body || {};

    if (grade !== undefined && !VALID_GRADES.has(grade)) {
      return res.status(400).json({ error: `grade must be one of: ${GRADES.join(', ')}` });
    }
    if (playerName !== undefined && !String(playerName).trim()) {
      return res.status(400).json({ error: "Player name can't be empty." });
    }

    const merged = {
      grade: grade !== undefined ? grade : existing.grade,
      playerName: playerName !== undefined ? playerName.trim() : existing.player_name,
      dob: dob !== undefined ? (dob || null) : existing.dob,
      parentName: parentName !== undefined ? parentName : existing.parent_name,
      parentPhone: parentPhone !== undefined ? parentPhone : existing.parent_phone,
      parentEmail: parentEmail !== undefined ? parentEmail : existing.parent_email,
      sessionType: sessionType !== undefined ? normalizeSessionType(sessionType) : existing.session_type,
      rch: rch !== undefined ? !!rch : existing.rch,
      sultans: sultans !== undefined ? !!sultans : existing.sultans,
      discountCents: discountCents !== undefined ? (Number(discountCents) || 0) : existing.discount_cents,
    };

    const updateRes = await pool.query(
      `UPDATE players SET
         grade = $1, player_name = $2, dob = $3, parent_name = $4, parent_phone = $5,
         parent_email = $6, session_type = $7, rch = $8, sultans = $9, discount_cents = $10
       WHERE id = $11
       RETURNING *`,
      [merged.grade, merged.playerName, merged.dob, merged.parentName, merged.parentPhone,
       merged.parentEmail, merged.sessionType, merged.rch, merged.sultans, merged.discountCents, id]
    );
    res.json({ ok: true, entry: updateRes.rows[0] });
  } catch (err) {
    console.error('Edit player error:', err);
    res.status(500).json({ error: 'Could not save changes to this player.' });
  }
});

// Admin: remove a player from the roster.
router.delete('/admin/players/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM players WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Player not found.' });
    res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('Delete player error:', err);
    res.status(500).json({ error: 'Could not delete this player.' });
  }
});

// Admin: unsubscribe a player who quit — archives them (moves them to the
// "Data" section) rather than deleting, so their history stays around. This
// is intentionally separate from Cancel Billing: cancel their Stripe
// subscription first (if they have one), then archive them here as a second,
// explicit step, so a player is never silently dropped from billing records
// without you having made the call to actually end their enrollment.
router.put('/admin/players/:id/archive', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE players SET archived_at = now() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Player not found.' });
    res.json({ ok: true, entry: result.rows[0] });
  } catch (err) {
    console.error('Archive player error:', err);
    res.status(500).json({ error: 'Could not unsubscribe this player.' });
  }
});

// Admin: mark a player as having paid this month by some other means
// (cash, Zelle, check...). Pass { paid: false } to undo it.
router.put('/admin/players/:id/paid-otherwise', requireAdmin, async (req, res) => {
  const paid = !(req.body && req.body.paid === false);
  try {
    const result = await pool.query(
      `UPDATE players SET paid_otherwise_at = ${paid ? 'now()' : 'NULL'} WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Player not found.' });
    res.json({ ok: true, entry: result.rows[0] });
  } catch (err) {
    console.error('Paid otherwise error:', err);
    res.status(500).json({ error: 'Could not update this player.' });
  }
});

// Admin: when the last "Reset Payment Status" happened (for the Finances tab).
router.get('/admin/reset-payment-status', requireAdmin, async (req, res) => {
  try {
    res.json({ lastResetAt: await getSetting('payment_status_reset_at', null) });
  } catch (err) {
    console.error('Get reset info error:', err);
    res.status(500).json({ error: 'Could not load reset info.' });
  }
});

// Admin: start-of-month reset. Everyone's payment status goes back to
// "Not sent": links created before now stop counting on the dashboard, any
// still-unpaid (pending) links are cancelled so the old-price links can no
// longer be used, and every "Paid otherwise" mark is cleared. Stripe
// subscriptions themselves are not touched. Requires { confirm: 'RESET' }
// and refuses a second reset in the same calendar month (Central time) so a
// stray click can't wipe the new month's links right after they're sent.
router.post('/admin/reset-payment-status', requireAdmin, async (req, res) => {
  if (!req.body || req.body.confirm !== 'RESET') {
    return res.status(400).json({ error: 'Confirmation word missing.' });
  }
  try {
    const monthOf = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }).slice(0, 7);
    const last = await getSetting('payment_status_reset_at', null);
    if (last && monthOf(last) === monthOf(new Date())) {
      return res.status(409).json({ error: 'Payment status was already reset this month (' + new Date(last).toLocaleString('en-US', { timeZone: 'America/Chicago' }) + ').' });
    }
    const cancelled = await pool.query(`UPDATE payment_links SET status = 'canceled' WHERE status = 'pending'`);
    const cleared = await pool.query(`UPDATE players SET paid_otherwise_at = NULL WHERE paid_otherwise_at IS NOT NULL`);
    const now = new Date().toISOString();
    await setSetting('payment_status_reset_at', now);
    res.json({ ok: true, resetAt: now, cancelledLinks: cancelled.rowCount, clearedPaidOtherwise: cleared.rowCount });
  } catch (err) {
    console.error('Reset payment status error:', err);
    res.status(500).json({ error: 'Could not reset payment status.' });
  }
});

// Admin: undo an archive (bring a player back onto the active roster).
router.put('/admin/players/:id/unarchive', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE players SET archived_at = NULL WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Player not found.' });
    res.json({ ok: true, entry: result.rows[0] });
  } catch (err) {
    console.error('Unarchive player error:', err);
    res.status(500).json({ error: 'Could not restore this player.' });
  }
});

// Admin: "Move to Roster" — promotes an approved Skills Training or Join
// Sultans FC applicant onto the actual Players Roster. Pulls whatever it can
// from the original registration (name, email, phone, and for Join Sultans
// FC also grade + parent name) and takes the rest (grade if not already
// known, session type, RCH/Sultans flags, and any missing contact fields)
// from the admin via this request. Registering for Sultans FC always implies
// RCH too, enforced here regardless of what was submitted.
router.post('/admin/move-to-roster', requireAdmin, async (req, res) => {
  const {
    sourceType, sourceId, grade, sessionType,
    rch, sultans, parentName, parentPhone, parentEmail, discountCents,
  } = req.body || {};

  if (!['skills', 'join'].includes(sourceType)) {
    return res.status(400).json({ error: 'sourceType must be "skills" or "join".' });
  }
  if (!sourceId) return res.status(400).json({ error: 'sourceId is required.' });
  if (!VALID_GRADES.has(grade)) {
    return res.status(400).json({ error: `grade must be one of: ${GRADES.join(', ')}` });
  }

  // Skills Training applicants default to RCH-only, but the admin can still
  // opt one into Sultans too at move time (e.g. a Skills Training player who
  // decides to also join the Sultans FC squad) — so sultans is whatever was
  // submitted, for either source type.
  const isSultans = !!sultans;
  const isRch = isSultans ? true : !!rch; // Sultans always implies RCH

  try {
    let sourceTable, playerName, dob;
    if (sourceType === 'skills') {
      const r = await pool.query('SELECT * FROM skills_registrations WHERE id = $1', [sourceId]);
      if (!r.rows[0]) return res.status(404).json({ error: 'Registration not found.' });
      if (r.rows[0].moved_at) return res.status(409).json({ error: 'This registration has already been moved to the roster.' });
      sourceTable = 'skills_registrations';
      playerName = r.rows[0].full_name;
      dob = r.rows[0].dob;
    } else {
      const r = await pool.query('SELECT * FROM join_registrations WHERE id = $1', [sourceId]);
      if (!r.rows[0]) return res.status(404).json({ error: 'Registration not found.' });
      if (r.rows[0].moved_at) return res.status(409).json({ error: 'This registration has already been moved to the roster.' });
      sourceTable = 'join_registrations';
      playerName = r.rows[0].child_name;
      dob = r.rows[0].dob;
    }

    const insertRes = await pool.query(
      `INSERT INTO players
        (grade, player_name, dob, parent_name, parent_phone, parent_email, session_type, rch, sultans, discount_cents)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [grade, playerName, dob || null, parentName || '', parentPhone || '', parentEmail || '',
       normalizeSessionType(sessionType), isRch, isSultans, Number(discountCents) || 0]
    );

    await pool.query(`UPDATE ${sourceTable} SET moved_at = now() WHERE id = $1`, [sourceId]);

    res.status(201).json({ ok: true, entry: insertRes.rows[0] });
  } catch (err) {
    console.error('Move to roster error:', err);
    res.status(500).json({ error: 'Could not move this registration to the roster.' });
  }
});

// Admin: per-grade totals for the Overview section — combined with pricing
// on the frontend to also build the Revenue table. Always returns all 8
// grades (zero-filled) so the Overview table matches the spreadsheet layout
// even for grades with no players yet.
router.get('/admin/players-overview', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT grade,
        COUNT(*)::int AS total_players,
        COUNT(*) FILTER (WHERE rch)::int AS total_rch,
        COUNT(*) FILTER (WHERE sultans)::int AS total_sultans,
        COUNT(*) FILTER (WHERE rch AND sultans)::int AS total_both,
        COUNT(*) FILTER (WHERE session_type = 'one')::int AS total_one,
        COUNT(*) FILTER (WHERE session_type = 'two')::int AS total_two,
        COALESCE(SUM(discount_cents), 0)::int AS total_discount_cents
      FROM players
      WHERE archived_at IS NULL
      GROUP BY grade
    `);
    const byGrade = {};
    result.rows.forEach((r) => {
      byGrade[r.grade] = {
        totalPlayers: r.total_players,
        totalRch: r.total_rch,
        totalSultans: r.total_sultans,
        totalBoth: r.total_both,
        totalOne: r.total_one,
        totalTwo: r.total_two,
        totalDiscountCents: r.total_discount_cents,
      };
    });
    GRADES.forEach((g) => {
      if (!byGrade[g]) {
        byGrade[g] = { totalPlayers: 0, totalRch: 0, totalSultans: 0, totalBoth: 0, totalOne: 0, totalTwo: 0, totalDiscountCents: 0 };
      }
    });
    res.json(byGrade);
  } catch (err) {
    console.error('Players overview error:', err);
    res.status(500).json({ error: 'Could not load overview.' });
  }
});

// Admin: read/update the per-session prices used for the Revenue table.
router.get('/admin/pricing', requireAdmin, async (req, res) => {
  try {
    const priceOneCents = parseInt(await getSetting('price_one_session_cents', '15000'), 10);
    const priceTwoCents = parseInt(await getSetting('price_two_session_cents', '25000'), 10);
    res.json({ priceOneCents, priceTwoCents });
  } catch (err) {
    console.error('Get pricing error:', err);
    res.status(500).json({ error: 'Could not load pricing.' });
  }
});

router.post('/admin/pricing', requireAdmin, async (req, res) => {
  const { priceOneCents, priceTwoCents } = req.body || {};
  if (!Number.isFinite(Number(priceOneCents)) || !Number.isFinite(Number(priceTwoCents))) {
    return res.status(400).json({ error: 'Both prices must be numbers.' });
  }
  try {
    const one = Math.round(Number(priceOneCents));
    const two = Math.round(Number(priceTwoCents));
    await setSetting('price_one_session_cents', String(one));
    await setSetting('price_two_session_cents', String(two));
    res.json({ priceOneCents: one, priceTwoCents: two });
  } catch (err) {
    console.error('Save pricing error:', err);
    res.status(500).json({ error: 'Could not save pricing.' });
  }
});

module.exports = router;
