const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { getSetting, setSetting } = require('./settings');
const { CAPACITY, VALID_GROUPS } = require('./join');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

router.post('/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: 'Incorrect password.' });
});

// Admin: read current site toggles (currently just Skills Training open/closed).
router.get('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const value = await getSetting('skills_training_open', 'true');
    res.json({ skillsTrainingOpen: value === 'true' });
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

router.get('/admin/skills-registrations', requireAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT s.*, pl.status AS payment_status, pl.last_payment_status, pl.paused_until
     FROM skills_registrations s
     LEFT JOIN LATERAL (
       SELECT status, last_payment_status, paused_until FROM payment_links
       WHERE registration_type = 'skills' AND registration_id = s.id
       ORDER BY created_at DESC LIMIT 1
     ) pl ON true
     ORDER BY s.submitted_at DESC`
  );
  res.json(result.rows);
});

router.get('/admin/join-registrations', requireAdmin, async (req, res) => {
  const { ageGroup } = req.query;
  const base = `
    SELECT j.*, pl.status AS payment_status, pl.last_payment_status, pl.paused_until
    FROM join_registrations j
    LEFT JOIN LATERAL (
      SELECT status, last_payment_status, paused_until FROM payment_links
      WHERE registration_type = 'join' AND registration_id = j.id
      ORDER BY created_at DESC LIMIT 1
    ) pl ON true`;
  const result = ageGroup
    ? await pool.query(`${base} WHERE j.age_group = $1 ORDER BY j.submitted_at DESC`, [ageGroup])
    : await pool.query(`${base} ORDER BY j.submitted_at DESC`);
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
  const { fullName, dob, email, phone, team, experience, notes } = req.body || {};

  const errors = {};
  if (!fullName || !String(fullName).trim()) errors.fullName = 'Please enter a name.';
  if (!dob) errors.dob = 'Please enter a date of birth.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email.';
  if (!phone || !PHONE_RE.test(String(phone).trim())) errors.phone = 'Please enter a valid US phone number as +1 followed by 10 digits.';
  if (!team || !String(team).trim()) errors.team = 'Please answer this field.';
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  try {
    const countRes = await pool.query('SELECT COUNT(*)::int AS n FROM skills_registrations');
    const jersey = String(((countRes.rows[0].n || 0) + 1) % 99 || 1).padStart(2, '0');

    const insertRes = await pool.query(
      `INSERT INTO skills_registrations
        (full_name, dob, email, phone, team, experience, notes, jersey_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [fullName.trim(), dob, email.trim(), phone.trim(), team.trim(), experience || '', notes || '', jersey]
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
    parentName, email, phone, emName, emPhone, medical,
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
         parent_name, email, phone, emergency_name, emergency_phone, medical, jersey_number)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
       WHERE (SELECT COUNT(*)::int FROM join_registrations WHERE age_group = $1) < $14
       RETURNING *`,
      [ageGroup, childName.trim(), dob, motivation || '', experience || '', availability || '',
       parentName.trim(), email.trim(), phone.trim(), emName || '', emPhone || '', medical || '', jersey,
       capacity]
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

router.get('/admin/summary', requireAdmin, async (req, res) => {
  const skills = await pool.query('SELECT COUNT(*)::int AS n FROM skills_registrations');
  const join = await pool.query(
    'SELECT age_group, COUNT(*)::int AS n FROM join_registrations GROUP BY age_group'
  );
  res.json({
    skillsTrainingCount: skills.rows[0].n,
    joinCountsByAgeGroup: join.rows,
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
