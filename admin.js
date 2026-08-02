const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');

const router = express.Router();

router.post('/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: 'Incorrect password.' });
});

router.get('/admin/skills-registrations', requireAdmin, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM skills_registrations ORDER BY submitted_at DESC'
  );
  res.json(result.rows);
});

router.get('/admin/join-registrations', requireAdmin, async (req, res) => {
  const { ageGroup } = req.query;
  const result = ageGroup
    ? await pool.query(
        'SELECT * FROM join_registrations WHERE age_group = $1 ORDER BY submitted_at DESC',
        [ageGroup]
      )
    : await pool.query('SELECT * FROM join_registrations ORDER BY submitted_at DESC');
  res.json(result.rows);
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
