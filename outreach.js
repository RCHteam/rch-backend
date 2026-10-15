const express = require('express');
const crypto = require('crypto');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { sendOutreachEmail } = require('./email');
const { SIZE_GROUPS, VALID_SIZES } = require('./sizes');

const router = express.Router();

const GRADES = ['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'];
const KINDS = new Set(['review', 'feedback', 'size']);

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
      families.set(email, { email: p.parent_email.trim(), parentName: p.parent_name || '', grade: p.grade, playerId: p.id, children: [], kids: [] });
    }
    families.get(email).children.push(p.player_name);
    families.get(email).kids.push({ id: p.id, name: p.player_name });
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
  if (!KINDS.has(kind)) return res.status(400).json({ error: 'kind must be "review", "feedback" or "size".' });
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
        `INSERT INTO outreach_requests (kind, token, player_id, child_names, parent_name, email, grade, audience, children)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [kind, token, f.playerId, f.children.join(', '), f.parentName, f.email, f.grade, audience, kind === 'size' ? JSON.stringify(f.kids) : null]
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
      `SELECT id, kind, child_names, parent_name, email, grade, audience, sent_at, responded_at, rating, comment, anonymous, children, sizes
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
    const r = await pool.query('SELECT kind, child_names, parent_name, responded_at, children FROM outreach_requests WHERE token = $1', [req.params.token]);
    const row = r.rows[0];
    if (!row) return res.status(404).json({ error: 'This link is not valid.' });
    res.json({
      kind: row.kind, childNames: row.child_names, parentName: row.parent_name, done: !!row.responded_at,
      children: row.kind === 'size' ? await currentChildInfo(row.children || []) : undefined,
      sizeGroups: row.kind === 'size' ? SIZE_GROUPS : undefined,
      grades: row.kind === 'size' ? GRADES : undefined,
    });
  } catch (err) {
    console.error('Outreach lookup error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// Current values from the roster, so the form comes pre-filled to reconfirm.
async function currentChildInfo(kids) {
  const out = [];
  for (const k of kids) {
    const r = await pool.query("SELECT to_char(dob, 'YYYY-MM-DD') AS dob, grade, shirt_size FROM players WHERE id = $1", [k.id]);
    const p = r.rows[0] || {};
    out.push({ id: k.id, name: k.name, dob: p.dob || '', grade: p.grade || '', size: p.shirt_size || '' });
  }
  return out;
}

// Parents reconfirm each child's date of birth, school grade and jersey size.
// Saved on the request and copied onto each child's player record.
async function answerSizes(req, res) {
  try {
    const r = await pool.query('SELECT kind, responded_at, children FROM outreach_requests WHERE token = $1', [req.params.token]);
    const row = r.rows[0];
    if (!row || row.kind !== 'size') return res.status(404).json({ error: 'This link is not valid.' });
    if (row.responded_at) return res.status(409).json({ error: 'Thank you — we already received your answer.' });
    const kids = row.children || [];
    const chosen = {};
    const answers = req.body.sizes || {};
    for (const k of kids) {
      const a = answers[k.id] || {};
      const size = String(a.size || '').trim().toUpperCase();
      const grade = String(a.grade || '').trim();
      const dob = String(a.dob || '').trim();
      const d = /^\d{4}-\d{2}-\d{2}$/.test(dob) ? new Date(dob + 'T12:00:00Z') : null;
      const age = d && !isNaN(d) ? (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000) : -1;
      if (!(age >= 1 && age <= 25)) return res.status(400).json({ error: 'Please enter a valid date of birth for ' + k.name + '.' });
      if (!GRADES.includes(grade)) return res.status(400).json({ error: 'Please choose the current school grade for ' + k.name + '.' });
      if (!VALID_SIZES.has(size)) return res.status(400).json({ error: 'Please choose a jersey size for ' + k.name + '.' });
      chosen[k.id] = { dob, grade, size };
    }
    await pool.query('UPDATE outreach_requests SET responded_at = now(), sizes = $1 WHERE token = $2 AND responded_at IS NULL', [JSON.stringify(chosen), req.params.token]);
    for (const k of kids) {
      const c = chosen[k.id];
      await pool.query('UPDATE players SET dob = $1, grade = $2, shirt_size = $3 WHERE id = $4', [c.dob, c.grade, c.size, k.id]);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Size answer error:', err);
    res.status(500).json({ error: 'Could not save your answer. Please try again.' });
  }
}

router.post('/outreach/:token', async (req, res) => {
  const { rating, comment, anonymous, sizes } = req.body || {};
  if (req.body && sizes !== undefined) return answerSizes(req, res);
  if (typeof anonymous !== 'boolean') return res.status(400).json({ error: 'Please choose whether to share your name or stay anonymous.' });
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
    if (anonymous) {
      // Respect the parent's choice: erase everything that could identify them.
      await pool.query(
        `UPDATE outreach_requests SET responded_at = now(), rating = $1, comment = $2, anonymous = true,
           player_id = NULL, child_names = '', parent_name = '', email = 'anonymous', grade = NULL, audience = NULL
         WHERE token = $3 AND responded_at IS NULL`,
        [stars, text, req.params.token]
      );
    } else {
      await pool.query(
        'UPDATE outreach_requests SET responded_at = now(), rating = $1, comment = $2, anonymous = false WHERE token = $3 AND responded_at IS NULL',
        [stars, text, req.params.token]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Outreach answer error:', err);
    res.status(500).json({ error: 'Could not save your answer. Please try again.' });
  }
});

module.exports = router;
