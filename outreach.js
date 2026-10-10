const express = require('express');
const crypto = require('crypto');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { sendOutreachEmail } = require('./email');

const router = express.Router();

const GRADES = ['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'];
const KINDS = new Set(['review', 'feedback']);

function siteUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

// Same audiences as "Send Link" on one-time payments: one player, everyone,
// RCH only, Sultans only, a whole grade (optionally just its RCH/Sultans
// players). Always recomputed here, never trusted from the browser.
async function resolvePlayers({ scope, grade, playerId }) {
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
    if (!GRADES.includes(grade)) throw new Error('Please choose a valid grade.');
    params.push(grade);
    conditions.push(`grade = $${params.length}`);
    if (scope === 'rch_grade') conditions.push('rch = true');
    if (scope === 'sultans_grade') conditions.push('sultans = true');
  } else {
    throw new Error('Please choose who to send this to.');
  }
  const r = await pool.query(`SELECT * FROM players WHERE ${conditions.join(' AND ')} ORDER BY grade, player_name`, params);
  return r.rows;
}

// One email per family: siblings share a parent email, so they are grouped
// and thanked together instead of getting several near-identical emails.
function groupByFamily(players) {
  const families = new Map();
  const noEmail = [];
  for (const p of players) {
    const email = String(p.parent_email || '').trim().toLowerCase();
    if (!email) { noEmail.push(p.player_name); continue; }
    if (!families.has(email)) {
      families.set(email, { email: p.parent_email.trim(), parentName: p.parent_name || '', grade: p.grade, playerId: p.id, children: [] });
    }
    families.get(email).children.push(p.player_name);
  }
  return { families: [...families.values()], noEmail };
}

router.get('/admin/outreach/recipients', requireAdmin, async (req, res) => {
  try {
    const players = await resolvePlayers(req.query);
    const { families, noEmail } = groupByFamily(players);
    res.json({
      families: families.map((f) => ({ email: f.email, parentName: f.parentName, children: f.children, grade: f.grade })),
      sendableCount: families.length,
      skipped: noEmail,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not resolve recipients.' });
  }
});

router.post('/admin/outreach/send', requireAdmin, async (req, res) => {
  const { kind, scope, grade, playerId } = req.body || {};
  if (!KINDS.has(kind)) return res.status(400).json({ error: 'kind must be "review" or "feedback".' });
  let players;
  try {
    players = await resolvePlayers({ scope, grade, playerId });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Could not resolve recipients.' });
  }
  const { families, noEmail } = groupByFamily(players);
  if (!families.length) {
    return res.status(400).json({ error: 'No matching player has a parent email on file.', skipped: noEmail });
  }
  const audience = scope + (grade ? ':' + grade : '');
  const sent = [];
  const failed = [];
  for (const f of families) {
    try {
      const token = crypto.randomBytes(20).toString('hex');
      await pool.query(
        `INSERT INTO outreach_requests (kind, token, player_id, child_names, parent_name, email, grade, audience)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [kind, token, f.playerId, f.children.join(', '), f.parentName, f.email, f.grade, audience]
      );
      const result = await sendOutreachEmail({
        to: f.email, parentName: f.parentName, childNames: f.children, kind, link: `${siteUrl(req)}/feedback/${token}`,
      });
      if (result && result.ok === false) throw new Error('email provider rejected');
      sent.push(f.email);
    } catch (err) {
      console.error('Outreach send failed for', f.email, err);
      failed.push(f.email);
    }
  }
  res.json({ ok: true, sentCount: sent.length, skipped: noEmail, failed });
});

router.get('/admin/outreach', requireAdmin, async (req, res) => {
  const kind = KINDS.has(req.query.kind) ? req.query.kind : null;
  try {
    const r = await pool.query(
      `SELECT id, kind, child_names, parent_name, email, grade, audience, sent_at, responded_at, rating, comment
       FROM outreach_requests ${kind ? 'WHERE kind = $1' : ''} ORDER BY COALESCE(responded_at, sent_at) DESC LIMIT 500`,
      kind ? [kind] : []
    );
    const rows = r.rows;
    const rated = rows.filter((x) => x.rating != null);
    res.json({
      rows,
      summary: {
        sent: rows.length,
        responded: rows.filter((x) => x.responded_at).length,
        averageRating: rated.length ? Math.round((rated.reduce((s, x) => s + x.rating, 0) / rated.length) * 10) / 10 : null,
      },
    });
  } catch (err) {
    console.error('List outreach error:', err);
    res.status(500).json({ error: 'Could not load responses.' });
  }
});

router.delete('/admin/outreach/:id', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM outreach_requests WHERE id = $1 RETURNING id', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete outreach error:', err);
    res.status(500).json({ error: 'Could not delete.' });
  }
});

// ---- Public: the family's personal page (the HTML itself is served from
// server.js at /feedback/:token; these two endpoints feed it) ----
router.get('/outreach/:token', async (req, res) => {
  try {
    const r = await pool.query('SELECT kind, child_names, parent_name, responded_at FROM outreach_requests WHERE token = $1', [req.params.token]);
    const row = r.rows[0];
    if (!row) return res.status(404).json({ error: 'This link is not valid.' });
    res.json({ kind: row.kind, childNames: row.child_names, parentName: row.parent_name, done: !!row.responded_at });
  } catch (err) {
    console.error('Outreach lookup error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

router.post('/outreach/:token', async (req, res) => {
  const { rating, comment } = req.body || {};
  const text = String(comment || '').trim().slice(0, 4000);
  try {
    const r = await pool.query('SELECT kind, responded_at FROM outreach_requests WHERE token = $1', [req.params.token]);
    const row = r.rows[0];
    if (!row) return res.status(404).json({ error: 'This link is not valid.' });
    if (row.responded_at) return res.status(409).json({ error: 'Thank you — we already received your answer.' });
    let stars = null;
    if (row.kind === 'review') {
      stars = Math.round(Number(rating));
      if (!(stars >= 1 && stars <= 5)) return res.status(400).json({ error: 'Please choose 1 to 5 stars.' });
    } else if (!text) {
      return res.status(400).json({ error: 'Please tell us what we could change.' });
    }
    await pool.query(
      'UPDATE outreach_requests SET responded_at = now(), rating = $1, comment = $2 WHERE token = $3 AND responded_at IS NULL',
      [stars, text, req.params.token]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Outreach answer error:', err);
    res.status(500).json({ error: 'Could not save your answer. Please try again.' });
  }
});

module.exports = router;
