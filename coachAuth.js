// Coach logins: admins create a username and code per coach; coaches log in with them and
// can only use the few coach routes (see requireStaff in coachTools.js).
const express = require('express');
const { ageGroupLabel } = require('./ageGroups');
const rateLimit = require('express-rate-limit');
const pool = require('./pool');
const { requireAdmin, requireStaff, makeCoachToken, hashCode, newSalt, generateCode, safeEqual } = require('./auth');

const router = express.Router();
const USERNAME_RE = /^[a-z0-9._-]{3,30}$/;

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false,
  message: { ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' } });

// ---- Coach logs in ----
router.post('/coach/login', loginLimiter, async (req, res) => {
  const username = String((req.body && req.body.username) || '').trim().toLowerCase();
  const code = String((req.body && req.body.code) || '');
  const fail = () => res.status(401).json({ ok: false, error: 'Incorrect username or code.' });
  if (!username || !code) return fail();
  try {
    const r = await pool.query(
      'SELECT l.*, c.name FROM coach_logins l JOIN coaches c ON c.id = l.coach_id WHERE lower(l.username) = $1', [username]);
    const row = r.rows[0];
    if (!row) { hashCode(code, 'x'.repeat(32)); return fail(); } // keep timing similar
    if (!safeEqual(hashCode(code, row.code_salt), row.code_hash)) return fail();
    pool.query('UPDATE coach_logins SET last_login_at = now() WHERE coach_id = $1', [row.coach_id]).catch(() => {});
    res.json({ ok: true, token: makeCoachToken(row.coach_id), coach: { id: row.coach_id, name: row.name } });
  } catch (err) {
    console.error('Coach login error:', err);
    res.status(500).json({ ok: false, error: 'Could not log in. Please try again.' });
  }
});

// Who am I? (the page calls this after a refresh, for coaches)
router.get('/coach/me', requireStaff, (req, res) => {
  if (!req.coach) return res.json({ role: 'admin' });
  res.json({ role: 'coach', id: req.coach.id, name: req.coach.name });
});

// The only player info coaches get: no parent contact details, no money.
router.get('/coach/players', requireStaff, async (req, res) => {
  try {
    const grade = req.query.grade ? String(req.query.grade) : null;
    const r = await pool.query(
      `SELECT id, player_name, grade, dob, session_type, rch, sultans FROM players
        WHERE archived_at IS NULL ${grade ? 'AND grade = $1' : ''} ORDER BY player_name`,
      grade ? [grade] : []);
    res.json(r.rows.map((p) => ({ ...p, age_group: ageGroupLabel(p.dob) })));
  } catch (err) {
    console.error('Coach players error:', err);
    res.json([]);
  }
});

// ---- Admins manage logins ----
router.get('/admin/coach-logins', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT coach_id, username, created_at, last_login_at FROM coach_logins');
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: 'Could not load coach logins.' }); }
});

// Create or change a coach's login. A new code is generated when none is given (and when
// the login is brand new). The code is returned ONCE here; only its hash is stored.
router.put('/admin/coaches/:id/login', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const username = String((req.body && req.body.username) || '').trim().toLowerCase();
  let code = String((req.body && req.body.code) || '').trim();
  const regenerate = !!(req.body && req.body.regenerate);
  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ error: 'Username: 3 to 30 characters, lowercase letters, numbers, dot, dash or underscore.' });
  }
  if (code && code.length < 6) return res.status(400).json({ error: 'The code must be at least 6 characters.' });
  try {
    const coach = (await pool.query('SELECT id, name FROM coaches WHERE id = $1', [id])).rows[0];
    if (!coach) return res.status(404).json({ error: 'Coach not found.' });
    const taken = (await pool.query('SELECT coach_id FROM coach_logins WHERE lower(username) = $1 AND coach_id <> $2', [username, id])).rows[0];
    if (taken) return res.status(409).json({ error: 'That username is already used by another coach.' });
    const existing = (await pool.query('SELECT coach_id FROM coach_logins WHERE coach_id = $1', [id])).rows[0];
    let shownCode = null;
    if (!existing || regenerate || code) {
      if (!code) code = generateCode(8);
      const salt = newSalt();
      await pool.query(
        `INSERT INTO coach_logins (coach_id, username, code_salt, code_hash) VALUES ($1,$2,$3,$4)
         ON CONFLICT (coach_id) DO UPDATE SET username = EXCLUDED.username, code_salt = EXCLUDED.code_salt, code_hash = EXCLUDED.code_hash`,
        [id, username, salt, hashCode(code, salt)]);
      shownCode = code;
    } else {
      await pool.query('UPDATE coach_logins SET username = $1 WHERE coach_id = $2', [username, id]);
    }
    res.json({ ok: true, username, code: shownCode });
  } catch (err) {
    console.error('Set coach login error:', err);
    res.status(500).json({ error: 'Could not save this login.' });
  }
});

router.delete('/admin/coaches/:id/login', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM coach_logins WHERE coach_id = $1', [parseInt(req.params.id, 10)]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Could not remove this login.' }); }
});

module.exports = router;
