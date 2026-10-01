const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');

const router = express.Router();

// Admin: list all charges (both recurring and one-time), newest first —
// feeds the "Charges" section under Finances.
router.get('/admin/charges', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM charges ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('List charges error:', err);
    res.status(500).json({ error: 'Could not load charges.' });
  }
});

router.post('/admin/charges', requireAdmin, async (req, res) => {
  const { description, amountCents, kind, chargeMonth } = req.body || {};
  if (!description || !String(description).trim()) {
    return res.status(400).json({ error: 'Please enter a description.' });
  }
  if (!Number.isFinite(Number(amountCents)) || Number(amountCents) < 0) {
    return res.status(400).json({ error: 'Amount must be a non-negative number.' });
  }
  if (!['recurring', 'one_time'].includes(kind)) {
    return res.status(400).json({ error: 'kind must be "recurring" or "one_time".' });
  }
  if (kind === 'one_time' && (!chargeMonth || !/^\d{4}-\d{2}-\d{2}$/.test(chargeMonth))) {
    return res.status(400).json({ error: 'A one-time charge needs a month, format YYYY-MM-DD.' });
  }

  try {
    const insertRes = await pool.query(
      `INSERT INTO charges (description, amount_cents, kind, charge_month)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [description.trim(), Math.round(Number(amountCents)), kind, kind === 'one_time' ? chargeMonth : null]
    );
    res.status(201).json({ ok: true, entry: insertRes.rows[0] });
  } catch (err) {
    console.error('Add charge error:', err);
    res.status(500).json({ error: 'Could not add this charge.' });
  }
});

router.put('/admin/charges/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const existingRes = await pool.query('SELECT * FROM charges WHERE id = $1', [id]);
    const existing = existingRes.rows[0];
    if (!existing) return res.status(404).json({ error: 'Charge not found.' });

    const { description, amountCents, kind, chargeMonth } = req.body || {};
    const merged = {
      description: description !== undefined ? String(description).trim() : existing.description,
      amountCents: amountCents !== undefined ? Math.round(Number(amountCents)) : existing.amount_cents,
      kind: kind !== undefined ? kind : existing.kind,
      chargeMonth: chargeMonth !== undefined ? chargeMonth : existing.charge_month,
    };
    if (!['recurring', 'one_time'].includes(merged.kind)) {
      return res.status(400).json({ error: 'kind must be "recurring" or "one_time".' });
    }

    const updateRes = await pool.query(
      `UPDATE charges SET description = $1, amount_cents = $2, kind = $3, charge_month = $4
       WHERE id = $5 RETURNING *`,
      [merged.description, merged.amountCents, merged.kind,
       merged.kind === 'one_time' ? merged.chargeMonth : null, id]
    );
    res.json({ ok: true, entry: updateRes.rows[0] });
  } catch (err) {
    console.error('Edit charge error:', err);
    res.status(500).json({ error: 'Could not save changes to this charge.' });
  }
});

router.delete('/admin/charges/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM charges WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Charge not found.' });
    res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('Delete charge error:', err);
    res.status(500).json({ error: 'Could not delete this charge.' });
  }
});

module.exports = router;
