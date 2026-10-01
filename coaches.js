const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get('/admin/coaches', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coaches ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('List coaches error:', err);
    res.status(500).json({ error: 'Could not load coaches.' });
  }
});

router.post('/admin/coaches', requireAdmin, async (req, res) => {
  const { name, email, phone, grades, rch, sultans, notes } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Please enter the coach's name." });
  }
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email, or leave it blank.' });
  }
  try {
    const insertRes = await pool.query(
      `INSERT INTO coaches (name, email, phone, grades, rch, sultans, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name.trim(), email || '', phone || '', Array.isArray(grades) ? grades : [], !!rch, !!sultans, notes || '']
    );
    res.status(201).json({ ok: true, entry: insertRes.rows[0] });
  } catch (err) {
    console.error('Add coach error:', err);
    res.status(500).json({ error: 'Could not add this coach.' });
  }
});

router.put('/admin/coaches/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const existingRes = await pool.query('SELECT * FROM coaches WHERE id = $1', [id]);
    const existing = existingRes.rows[0];
    if (!existing) return res.status(404).json({ error: 'Coach not found.' });

    const { name, email, phone, grades, rch, sultans, notes } = req.body || {};
    if (email !== undefined && email && !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email, or leave it blank.' });
    }
    const merged = {
      name: name !== undefined ? String(name).trim() : existing.name,
      email: email !== undefined ? email : existing.email,
      phone: phone !== undefined ? phone : existing.phone,
      grades: grades !== undefined ? (Array.isArray(grades) ? grades : []) : existing.grades,
      rch: rch !== undefined ? !!rch : existing.rch,
      sultans: sultans !== undefined ? !!sultans : existing.sultans,
      notes: notes !== undefined ? notes : existing.notes,
    };
    if (!merged.name) return res.status(400).json({ error: "Coach name can't be empty." });

    const updateRes = await pool.query(
      `UPDATE coaches SET name = $1, email = $2, phone = $3, grades = $4, rch = $5, sultans = $6, notes = $7
       WHERE id = $8 RETURNING *`,
      [merged.name, merged.email, merged.phone, merged.grades, merged.rch, merged.sultans, merged.notes, id]
    );
    res.json({ ok: true, entry: updateRes.rows[0] });
  } catch (err) {
    console.error('Edit coach error:', err);
    res.status(500).json({ error: 'Could not save changes to this coach.' });
  }
});

router.delete('/admin/coaches/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM coaches WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Coach not found.' });
    res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('Delete coach error:', err);
    res.status(500).json({ error: 'Could not delete this coach.' });
  }
});

module.exports = router;
