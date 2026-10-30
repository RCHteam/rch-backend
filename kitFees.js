// Finances > Kit Fees: who was charged a kit fee, when, how much, whether the
// parent paid, and whether we have ordered the kit. Rows are pulled from the
// payment links (registration kit fee) and from one-time payments titled "kit",
// and can also be added by hand. The "ordered" box is the owner's own tick.
const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { getSetting, setSetting } = require('./settings');

const router = express.Router();

const SEED_NAMES = ['Malek Kerim', 'Aariz Rashid']; // the two most recent families charged the kit fee

async function seedOnce() {
  if ((await getSetting('kit_seed_v1', '')) === 'done') return;
  const cents = parseInt(await getSetting('kit_fee_cents', '5000'), 10) || 5000;
  for (const name of SEED_NAMES) {
    const ex = await pool.query('SELECT id FROM kit_fees WHERE lower(player_name) = lower($1)', [name]);
    if (!ex.rows[0]) {
      await pool.query(`INSERT INTO kit_fees (player_name, amount_cents, source) VALUES ($1,$2,'manual')`, [name, cents]);
    }
  }
  await setSetting('kit_seed_v1', 'done');
}

async function upsertFrom(source, sourceId, name, cents, chargedAt, paidAt, totalCents) {
  const found = await pool.query('SELECT id FROM kit_fees WHERE source = $1 AND source_id = $2', [source, sourceId]);
  if (found.rows[0]) {
    await pool.query('UPDATE kit_fees SET player_name=$2, amount_cents=$3, charged_at=$4, paid_at=$5, total_cents=$6 WHERE id=$1',
      [found.rows[0].id, name, cents, chargedAt, paidAt, totalCents]);
    return;
  }
  // A hand-added row for the same child is adopted instead of duplicated.
  const manual = await pool.query(
    `SELECT id FROM kit_fees WHERE source = 'manual' AND source_id IS NULL AND lower(player_name) = lower($1) ORDER BY id LIMIT 1`, [name]);
  if (manual.rows[0]) {
    await pool.query('UPDATE kit_fees SET source=$2, source_id=$3, amount_cents=$4, charged_at=$5, paid_at=$6, total_cents=$7 WHERE id=$1',
      [manual.rows[0].id, source, sourceId, cents, chargedAt, paidAt, totalCents]);
    return;
  }
  await pool.query(
    'INSERT INTO kit_fees (player_name, amount_cents, charged_at, paid_at, source, source_id, total_cents) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [name, cents, chargedAt, paidAt, source, sourceId, totalCents]);
}

// One-time clean-up of the early test links (owner said they were all tests).
const TEST_NAMES = ['samy amine', 'taha belarbi', 'test final 1', 'yahya test', 'yahya', 'mohamed ali', 'mouna', 'weld ismail'];
async function cleanTestsOnce() {
  if ((await getSetting('kit_clean_v2', '')) === 'done') return;
  await pool.query(
    `UPDATE kit_fees SET hidden = true
      WHERE source <> 'manual' AND lower(player_name) = ANY($1::text[]) AND charged_at < '2026-10-08'`, [TEST_NAMES]);
  await setSetting('kit_clean_v2', 'done');
}

async function syncKitFees() {
  await seedOnce();
  const links = await pool.query(
    `SELECT id, child_name, one_time_amount_cents, prorated_amount_cents, created_at, completed_at FROM payment_links WHERE one_time_amount_cents > 0`);
  for (const r of links.rows) await upsertFrom('link', r.id, r.child_name, r.one_time_amount_cents, r.created_at, r.completed_at,
    r.completed_at ? r.one_time_amount_cents + (r.prorated_amount_cents || 0) : null);
  const otp = await pool.query(
    `SELECT id, COALESCE(NULLIF(recipient_name,''), '(unnamed link)') AS name, amount_cents, created_at, completed_at, status
       FROM one_time_payments WHERE title ILIKE '%kit%'`);
  for (const r of otp.rows) {
    await upsertFrom('one_time', r.id, r.name, r.amount_cents, r.created_at, r.status === 'completed' ? (r.completed_at || r.created_at) : null, r.status === 'completed' ? r.amount_cents : null);
  }
  await cleanTestsOnce();
}

router.get('/admin/kit-fees', requireAdmin, async (req, res) => {
  try {
    await syncKitFees();
    const r = await pool.query(
      `SELECT id, player_name, amount_cents, total_cents, charged_at, paid_at, ordered, ordered_at, source
         FROM kit_fees WHERE NOT hidden ORDER BY COALESCE(charged_at, created_at) DESC, id DESC`);
    res.json(r.rows);
  } catch (err) {
    console.error('Kit fees error:', err);
    res.status(500).json({ error: 'Could not load the kit fees.' });
  }
});

router.post('/admin/kit-fees', requireAdmin, async (req, res) => {
  const name = String((req.body && req.body.playerName) || '').trim().replace(/\s+/g, ' ').slice(0, 120);
  const cents = Math.round(Number(req.body && req.body.amountCents));
  if (!name) return res.status(400).json({ error: "Please enter the player's name." });
  if (!Number.isFinite(cents) || cents < 0) return res.status(400).json({ error: 'Please enter a valid amount.' });
  try {
    const paid = !!(req.body && req.body.paid);
    const r = await pool.query(
      `INSERT INTO kit_fees (player_name, amount_cents, paid_at, total_cents, source) VALUES ($1,$2,$3,$4,'manual') RETURNING id`,
      [name, cents, paid ? new Date() : null, paid ? cents : null]);
    res.status(201).json({ ok: true, id: r.rows[0].id });
  } catch (err) {
    console.error('Add kit fee error:', err);
    res.status(500).json({ error: 'Could not add this.' });
  }
});

router.put('/admin/kit-fees/:id', requireAdmin, async (req, res) => {
  try {
    const row = (await pool.query('SELECT * FROM kit_fees WHERE id = $1', [req.params.id])).rows[0];
    if (!row) return res.status(404).json({ error: 'Not found.' });
    const b = req.body || {};
    if (typeof b.ordered === 'boolean') {
      await pool.query('UPDATE kit_fees SET ordered = $2, ordered_at = $3 WHERE id = $1', [row.id, b.ordered, b.ordered ? new Date() : null]);
    }
    if (typeof b.paid === 'boolean') {
      if (row.source !== 'manual') return res.status(400).json({ error: 'This one is tracked from Stripe automatically.' });
      await pool.query('UPDATE kit_fees SET paid_at = $2, total_cents = $3 WHERE id = $1', [row.id, b.paid ? new Date() : null, b.paid ? row.amount_cents : null]);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Update kit fee error:', err);
    res.status(500).json({ error: 'Could not save.' });
  }
});

router.delete('/admin/kit-fees/:id', requireAdmin, async (req, res) => {
  try {
    // Hand-added rows are deleted; rows pulled from payment links are hidden (so they do not come back).
    const row = (await pool.query('SELECT source FROM kit_fees WHERE id = $1', [req.params.id])).rows[0];
    if (!row) return res.status(404).json({ error: 'Not found.' });
    if (row.source === 'manual') await pool.query('DELETE FROM kit_fees WHERE id = $1', [req.params.id]);
    else await pool.query('UPDATE kit_fees SET hidden = true WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Could not delete.' }); }
});

module.exports = router;
