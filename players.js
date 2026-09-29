const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { getSetting, setSetting } = require('./settings');

const router = express.Router();

const GRADES = ['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'];
const VALID_GRADES = new Set(GRADES);

// Admin: list players, optionally filtered to one grade — feeds the roster
// table on the dashboard.
router.get('/admin/players', requireAdmin, async (req, res) => {
  const { grade } = req.query;
  try {
    const result = grade
      ? await pool.query('SELECT * FROM players WHERE grade = $1 ORDER BY player_name', [grade])
      : await pool.query('SELECT * FROM players ORDER BY grade, player_name');
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
  const session = sessionType === 'two' ? 'two' : 'one';

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
      sessionType: sessionType !== undefined ? (sessionType === 'two' ? 'two' : 'one') : existing.session_type,
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
