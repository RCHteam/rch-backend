const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { getSetting, setSetting } = require('./settings');
const { CAPACITY, VALID_GROUPS } = require('./join');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const VALID_GRADES = new Set(['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade']);
const VALID_SESSION_TYPES = new Set(['one', 'two', 'online']);

router.post('/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: 'Incorrect password.' });
});

function joinOpenKey(ageGroup) {
  return `join_open_${ageGroup}`;
}

// Admin: read current site toggles — Skills Training open/closed, plus Join
// Sultans FC open/closed PER GRADE (e.g. Pre-K can be closed once its squad
// is set while 3rd Grade stays open).
router.get('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const groups = [...VALID_GROUPS];
    const [skillsValue, joinValues] = await Promise.all([
      getSetting('skills_training_open', 'true'),
      Promise.all(groups.map((g) => getSetting(joinOpenKey(g), 'true'))),
    ]);
    const joinRegistrationOpenByGrade = {};
    groups.forEach((g, i) => { joinRegistrationOpenByGrade[g] = joinValues[i] === 'true'; });
    res.json({
      skillsTrainingOpen: skillsValue === 'true',
      joinRegistrationOpenByGrade,
    });
  } catch (err) {
    console.error('Admin settings read error:', err);
    res.status(500).json({ error: 'Could not load settings.' });
  }
});

// Admin: flip Skills Training registration on/off.
router.post('/admin/settings/skills-training', requireAdmin, async (req, res) => {
  const { open } = req.body || {};
  if (typeof open !== 'boolean') {
    return res.status(400).json({ error: '"open" must be true or false.' });
  }
  try {
    await setSetting('skills_training_open', open ? 'true' : 'false');
    res.json({ ok: true, skillsTrainingOpen: open });
  } catch (err) {
    console.error('Admin settings toggle error:', err);
    res.status(500).json({ error: 'Could not update settings.' });
  }
});

// Admin: flip Join Sultans FC registration on/off for ONE grade at a time —
// pass which grade in the body.
router.post('/admin/settings/join-registration', requireAdmin, async (req, res) => {
  const { open, ageGroup } = req.body || {};
  if (typeof open !== 'boolean') {
    return res.status(400).json({ error: '"open" must be true or false.' });
  }
  if (!VALID_GROUPS.has(ageGroup)) {
    return res.status(400).json({ error: `ageGroup must be one of: ${[...VALID_GROUPS].join(', ')}` });
  }
  try {
    await setSetting(joinOpenKey(ageGroup), open ? 'true' : 'false');
    res.json({ ok: true, ageGroup, open });
  } catch (err) {
    console.error('Admin settings toggle error:', err);
    res.status(500).json({ error: 'Could not update settings.' });
  }
});

// Only the still-pending applicants (not yet moved to the Players Roster) —
// once moved, moved_at is set and they drop off this list, since the roster
// is now their record. Pass ?includeMoved=true to see everyone regardless.
router.get('/admin/skills-registrations', requireAdmin, async (req, res) => {
  const includeMoved = req.query.includeMoved === 'true';
  const resetAt = await getSetting('payment_status_reset_at', null);
  const result = await pool.query(
    `SELECT s.*, pl.status AS payment_status, pl.last_payment_status, pl.paused_until
     FROM skills_registrations s
     LEFT JOIN LATERAL (
       SELECT status, last_payment_status, paused_until FROM payment_links
       WHERE registration_type = 'skills' AND registration_id = s.id
         AND ($1::timestamptz IS NULL OR created_at > $1::timestamptz)
       ORDER BY created_at DESC LIMIT 1
     ) pl ON true
     ${includeMoved ? '' : 'WHERE s.moved_at IS NULL'}
     ORDER BY s.submitted_at DESC`,
    [resetAt]
  );
  res.json(result.rows);
});

router.get('/admin/join-registrations', requireAdmin, async (req, res) => {
  const { ageGroup } = req.query;
  const includeMoved = req.query.includeMoved === 'true';
  const resetAt = await getSetting('payment_status_reset_at', null);
  const base = `
    SELECT j.*, pl.status AS payment_status, pl.last_payment_status, pl.paused_until
    FROM join_registrations j
    LEFT JOIN LATERAL (
      SELECT status, last_payment_status, paused_until FROM payment_links
      WHERE registration_type = 'join' AND registration_id = j.id
        AND ($1::timestamptz IS NULL OR created_at > $1::timestamptz)
      ORDER BY created_at DESC LIMIT 1
    ) pl ON true`;
  const conditions = [];
  const params = [resetAt];
  if (ageGroup) { params.push(ageGroup); conditions.push(`j.age_group = $${params.length}`); }
  if (!includeMoved) conditions.push('j.moved_at IS NULL');
  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(`${base}${where} ORDER BY j.submitted_at DESC`, params);
  res.json(result.rows);
});

// Deleting a registration frees up its slot automatically — the "Full"
// status on the site is computed live from the row count, so as soon as a
// row is removed here the grade reopens as "Available" on its own.
router.delete('/admin/join-registrations/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM join_registrations WHERE id = $1 RETURNING *',
      [id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Registration not found.' });
    }
    res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('Delete join registration error:', err);
    res.status(500).json({ error: 'Could not delete registration.' });
  }
});

router.delete('/admin/skills-registrations/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM skills_registrations WHERE id = $1 RETURNING *',
      [id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Registration not found.' });
    }
    res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('Delete skills registration error:', err);
    res.status(500).json({ error: 'Could not delete registration.' });
  }
});

// Admin: manually add a Skills Training registration — for a family you know
// personally who didn't go through the public website form.
router.post('/admin/skills-registrations', requireAdmin, async (req, res) => {
  const { fullName, parentName, dob, email, phone, team, experience, notes, grade, sessionType } = req.body || {};

  const errors = {};
  if (!fullName || !String(fullName).trim()) errors.fullName = 'Please enter a name.';
  if (!dob) errors.dob = 'Please enter a date of birth.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email.';
  if (!phone || !PHONE_RE.test(String(phone).trim())) errors.phone = 'Please enter a valid US phone number as +1 followed by 10 digits.';
  if (!team || !String(team).trim()) errors.team = 'Please answer this field.';
  if (grade !== undefined && grade !== null && grade !== '' && !VALID_GRADES.has(grade)) {
    errors.grade = `grade must be one of: ${[...VALID_GRADES].join(', ')}`;
  }
  if (sessionType !== undefined && sessionType !== null && sessionType !== '' && !VALID_SESSION_TYPES.has(sessionType)) {
    errors.sessionType = `sessionType must be one of: ${[...VALID_SESSION_TYPES].join(', ')}`;
  }
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  try {
    const countRes = await pool.query('SELECT COUNT(*)::int AS n FROM skills_registrations');
    const jersey = String(((countRes.rows[0].n || 0) + 1) % 99 || 1).padStart(2, '0');

    const insertRes = await pool.query(
      `INSERT INTO skills_registrations
        (full_name, parent_name, dob, email, phone, team, experience, notes, jersey_number, grade, session_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [fullName.trim(), parentName || '', dob, email.trim(), phone.trim(), team.trim(), experience || '', notes || '', jersey, grade || null, sessionType || null]
    );
    res.status(201).json({ ok: true, entry: insertRes.rows[0] });
  } catch (err) {
    console.error('Manual skills registration error:', err);
    res.status(500).json({ error: 'Could not add registration.' });
  }
});

// Admin: manually add a Join Sultans FC registration — still respects each
// grade's capacity limit, same as the public form.
router.post('/admin/join-registrations', requireAdmin, async (req, res) => {
  const {
    ageGroup, childName, dob, motivation, experience, availability,
    parentName, email, phone, emName, emPhone, medical, sessionType,
  } = req.body || {};

  if (!VALID_GROUPS.has(ageGroup)) {
    return res.status(400).json({ error: `ageGroup must be one of: ${[...VALID_GROUPS].join(', ')}` });
  }

  const errors = {};
  if (!childName || !String(childName).trim()) errors.childName = "Please enter the player's name.";
  if (!dob) errors.dob = 'Please enter a date of birth.';
  if (!parentName || !String(parentName).trim()) errors.parentName = 'Please enter a name.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email.';
  if (!phone || !PHONE_RE.test(String(phone).trim())) errors.phone = 'Please enter a valid US phone number as +1 followed by 10 digits.';
  if (sessionType !== undefined && sessionType !== null && sessionType !== '' && !VALID_SESSION_TYPES.has(sessionType)) {
    errors.sessionType = `sessionType must be one of: ${[...VALID_SESSION_TYPES].join(', ')}`;
  }
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  try {
    const capacity = CAPACITY[ageGroup];
    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS n FROM join_registrations WHERE age_group = $1', [ageGroup]
    );
    const currentCount = countRes.rows[0].n || 0;
    const jersey = String((currentCount + 1) % 99 || 1).padStart(2, '0');

    const insertRes = await pool.query(
      `INSERT INTO join_registrations
        (age_group, child_name, dob, motivation, experience, availability,
         parent_name, email, phone, emergency_name, emergency_phone, medical, jersey_number, session_type)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
       WHERE (SELECT COUNT(*)::int FROM join_registrations WHERE age_group = $1) < $15
       RETURNING *`,
      [ageGroup, childName.trim(), dob, motivation || '', experience || '', availability || '',
       parentName.trim(), email.trim(), phone.trim(), emName || '', emPhone || '', medical || '', jersey,
       sessionType || null, capacity]
    );
    if (!insertRes.rows[0]) {
      return res.status(409).json({ error: `This grade is full (${capacity}/${capacity} spots filled).`, full: true });
    }
    res.status(201).json({ ok: true, entry: insertRes.rows[0] });
  } catch (err) {
    console.error('Manual join registration error:', err);
    res.status(500).json({ error: 'Could not add registration.' });
  }
});

// "Potential RCH" / "Potential Sultans" count applicants not yet moved to the
// roster (registering for Sultans FC implies RCH too, so every Join Sultans
// FC signup counts as a potential Sultans player). Once an admin moves them,
// they stop being "potential" and instead count in the roster-based
// breakdown below (Skills Training = total RCH players on the roster, across
// all grades; Join FC <grade> = Sultans players on the roster, per grade).
router.get('/admin/summary', requireAdmin, async (req, res) => {
  const potentialRch = await pool.query(
    `SELECT COUNT(*)::int AS n FROM skills_registrations WHERE moved_at IS NULL`
  );
  const potentialSultans = await pool.query(
    `SELECT COUNT(*)::int AS n FROM join_registrations WHERE moved_at IS NULL`
  );
  const rosterRch = await pool.query(
    `SELECT COUNT(*)::int AS n FROM players WHERE rch AND archived_at IS NULL`
  );
  const rosterSultansByGrade = await pool.query(
    `SELECT grade AS age_group, COUNT(*)::int AS n FROM players
     WHERE sultans AND archived_at IS NULL GROUP BY grade`
  );
  res.json({
    potentialRchCount: potentialRch.rows[0].n,
    potentialSultansCount: potentialSultans.rows[0].n,
    skillsTrainingCount: rosterRch.rows[0].n,
    joinCountsByAgeGroup: rosterSultansByGrade.rows,
  });
});

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

router.get('/admin/export/skills.csv', requireAdmin, async (req, res) => {
  const result = await pool.query('SELECT * FROM skills_registrations ORDER BY submitted_at DESC');
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="skills-registrations.csv"');
  res.send(toCsv(result.rows));
});

router.get('/admin/export/join.csv', requireAdmin, async (req, res) => {
  const result = await pool.query('SELECT * FROM join_registrations ORDER BY submitted_at DESC');
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="join-registrations.csv"');
  res.send(toCsv(result.rows));
});

module.exports = router;
