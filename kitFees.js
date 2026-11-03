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

async function upsertFrom(source, sourceId, name, cents, chargedAt, paidAt, totalCents, kitType) {
  kitType = kitType === 'sultans' ? 'sultans' : 'practice';
  const found = await pool.query('SELECT id FROM kit_fees WHERE source = $1 AND source_id = $2 AND kit_type = $3', [source, sourceId, kitType]);
  if (found.rows[0]) {
    // A kit marked paid by hand (Zelle, cash) keeps its paid date; the sync never wipes it.
    await pool.query(`UPDATE kit_fees SET player_name=$2, amount_cents=$3, charged_at=$4,
        paid_at = CASE WHEN paid_method IS NOT NULL THEN paid_at ELSE $5 END,
        total_cents = CASE WHEN paid_method IS NOT NULL THEN total_cents ELSE $6 END WHERE id=$1`,
      [found.rows[0].id, name, cents, chargedAt, paidAt, totalCents]);
    return;
  }
  // A hand-added row for the same child is adopted instead of duplicated.
  const manual = await pool.query(
    `SELECT id FROM kit_fees WHERE source = 'manual' AND source_id IS NULL AND kit_type = $2 AND lower(player_name) = lower($1) ORDER BY id LIMIT 1`, [name, kitType]);
  if (manual.rows[0]) {
    await pool.query('UPDATE kit_fees SET source=$2, source_id=$3, amount_cents=$4, charged_at=$5, paid_at=$6, total_cents=$7 WHERE id=$1',
      [manual.rows[0].id, source, sourceId, cents, chargedAt, paidAt, totalCents]);
    return;
  }
  await pool.query(
    'INSERT INTO kit_fees (player_name, amount_cents, charged_at, paid_at, source, source_id, total_cents, kit_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [name, cents, chargedAt, paidAt, source, sourceId, totalCents, kitType]);
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
    `SELECT id, child_name, one_time_amount_cents, sultans_kit_cents, prorated_amount_cents, created_at, completed_at FROM payment_links WHERE one_time_amount_cents > 0`);
  for (const r of links.rows) {
    const total = r.completed_at ? r.one_time_amount_cents + (r.prorated_amount_cents || 0) : null;
    const sk = Math.min(r.sultans_kit_cents || 0, r.one_time_amount_cents);
    const practice = r.one_time_amount_cents - sk;
    if (practice > 0) await upsertFrom('link', r.id, r.child_name, practice, r.created_at, r.completed_at, total, 'practice');
    if (sk > 0) await upsertFrom('link', r.id, r.child_name, sk, r.created_at, r.completed_at, total, 'sultans');
  }
  const otp = await pool.query(
    `SELECT id, title, COALESCE(NULLIF(recipient_name,''), '(unnamed link)') AS name, amount_cents, created_at, completed_at, status
       FROM one_time_payments WHERE title ILIKE '%kit%'`);
  for (const r of otp.rows) {
    await upsertFrom('one_time', r.id, r.name, r.amount_cents, r.created_at, r.status === 'completed' ? (r.completed_at || r.created_at) : null, r.status === 'completed' ? r.amount_cents : null, /sultans/i.test(r.title) ? 'sultans' : 'practice');
  }
  await cleanTestsOnce();
}

router.get('/admin/kit-fees', requireAdmin, async (req, res) => {
  try {
    await syncKitFees();
    const r = await pool.query(
      `SELECT id, player_name, amount_cents, total_cents, charged_at, paid_at, ordered, ordered_at, source, source_id, kit_type, created_at, paid_method
         FROM kit_fees WHERE NOT hidden ORDER BY COALESCE(charged_at, created_at) DESC, id DESC`);
    // One line per child: a Practice kit slot and a Sultans kit slot (two payments for the same child share a line).
    const lines = [];
    const byName = new Map();
    for (const k of r.rows) {
      const slot = { id: k.id, amount_cents: k.amount_cents, paid_at: k.paid_at, ordered: k.ordered, ordered_at: k.ordered_at, source: k.source, paid_method: k.paid_method };
      const key = String(k.player_name).trim().toLowerCase();
      let line = (byName.get(key) || []).find((l) => !l[k.kit_type]);
      if (!line) {
        line = { player_name: k.player_name, charged_at: k.charged_at, practice: null, sultans: null, _totals: new Map(), source: k.source };
        lines.push(line);
        byName.set(key, (byName.get(key) || []).concat([line]));
      }
      line[k.kit_type] = slot;
      if (k.charged_at && (!line.charged_at || new Date(k.charged_at) < new Date(line.charged_at))) line.charged_at = k.charged_at;
      if (k.total_cents != null) line._totals.set(k.source + ':' + (k.source_id == null ? 'm' + k.id : k.source_id), k.total_cents);
    }
    // Sizes come from the main roster (matched by name); count repeated names.
    const roster = (await pool.query(`SELECT lower(trim(player_name)) AS n, shirt_size FROM players WHERE archived_at IS NULL ORDER BY id`)).rows;
    const sizeBy = new Map();
    roster.forEach((p) => { if (!sizeBy.has(p.n) || (!sizeBy.get(p.n) && p.shirt_size)) sizeBy.set(p.n, p.shirt_size || ''); });
    const count = new Map();
    lines.forEach((l) => { const k = String(l.player_name).trim().toLowerCase().replace(/\s+/g, ' '); count.set(k, (count.get(k) || 0) + 1); });
    res.json(lines.map((l) => {
      let total = null;
      if (l._totals.size) total = [...l._totals.values()].reduce((a, b) => a + b, 0);
      const key = String(l.player_name).trim().toLowerCase();
      const norm = key.replace(/\s+/g, ' ');
      return { player_name: l.player_name, charged_at: l.charged_at, total_cents: total, practice: l.practice, sultans: l.sultans,
        duplicate: count.get(norm) > 1, on_roster: sizeBy.has(key), size: sizeBy.get(key) || '' };
    }));
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
      `INSERT INTO kit_fees (player_name, amount_cents, paid_at, total_cents, source, kit_type) VALUES ($1,$2,$3,$4,'manual',$5) RETURNING id`,
      [name, cents, paid ? new Date() : null, paid ? cents : null, req.body && req.body.kitType === 'sultans' ? 'sultans' : 'practice']);
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
      // Paid by hand (Zelle / cash): keeps the paid mark even when the payment link later syncs.
      const method = b.paid ? (b.method === 'zelle' ? 'zelle' : (row.source === 'manual' ? null : 'other')) : null;
      if (!b.paid && row.source !== 'manual' && !row.paid_method) return res.status(400).json({ error: 'This one was paid through Stripe, so it cannot be undone here.' });
      await pool.query('UPDATE kit_fees SET paid_at = $2, total_cents = $3, paid_method = $4 WHERE id = $1',
        [row.id, b.paid ? new Date() : null, b.paid ? row.amount_cents : null, method]);
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
