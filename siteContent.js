const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { getSetting, setSetting } = require('./settings');

const router = express.Router();

const MAX_IMAGES = 4;
const MAX_IMAGE_CHARS = 2000000; // a resized JPEG as a data URL is ~100-300 KB; this is a generous ceiling
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SEASONS = new Set(['summer', 'winter', 'spring', 'fall', 'other']);

// Images arrive as an array of data: URLs (or https URLs). Anything else is dropped.
function cleanImages(v) {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === 'string' && x.length <= MAX_IMAGE_CHARS && (/^data:image\/(png|jpe?g|webp|gif);base64,/.test(x) || /^https:\/\//.test(x)))
    .slice(0, MAX_IMAGES);
}
function parseImages(s) {
  try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}
function cents(v) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
function str(v, max) { return String(v == null ? '' : v).trim().slice(0, max); }

const shopOut = (r) => ({
  id: r.id, name: r.name, category: r.category, description: r.description, priceCents: r.price_cents,
  sizes: r.sizes, images: parseImages(r.images), inStock: r.in_stock, visible: r.visible,
});
const campOut = (r) => ({
  id: r.id, title: r.title, season: r.season, startDate: r.start_date, endDate: r.end_date, schedule: r.schedule,
  location: r.location, ages: r.ages, priceCents: r.price_cents, spots: r.spots, description: r.description,
  images: parseImages(r.images), visible: r.visible,
});

/* -------------------------------- Shop -------------------------------- */

router.get('/admin/shop', requireAdmin, async (req, res) => {
  try {
    const [open, rows] = await Promise.all([
      getSetting('shop_open', 'false'),
      pool.query('SELECT * FROM shop_products ORDER BY position, id'),
    ]);
    res.json({ open: open === 'true', products: rows.rows.map(shopOut) });
  } catch (err) {
    console.error('Admin shop error:', err);
    res.status(500).json({ error: 'Could not load the shop.' });
  }
});

router.post('/admin/shop/availability', requireAdmin, async (req, res) => {
  const { open } = req.body || {};
  if (typeof open !== 'boolean') return res.status(400).json({ error: '"open" must be true or false.' });
  try {
    await setSetting('shop_open', open ? 'true' : 'false');
    res.json({ ok: true, open });
  } catch (err) {
    console.error('Shop availability error:', err);
    res.status(500).json({ error: 'Could not update the shop.' });
  }
});

function shopFields(body) {
  const name = str(body.name, 160);
  if (!name) return { error: 'Please enter a product name.' };
  return {
    values: [name, str(body.category, 80), str(body.description, 4000), cents(body.priceCents), str(body.sizes, 200),
      JSON.stringify(cleanImages(body.images)), body.inStock !== false, body.visible !== false],
  };
}

router.post('/admin/shop/products', requireAdmin, async (req, res) => {
  const f = shopFields(req.body || {});
  if (f.error) return res.status(400).json({ error: f.error });
  try {
    const r = await pool.query(
      `INSERT INTO shop_products (name, category, description, price_cents, sizes, images, in_stock, visible, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, COALESCE((SELECT MAX(position) FROM shop_products), 0) + 1) RETURNING *`,
      f.values
    );
    res.status(201).json({ ok: true, product: shopOut(r.rows[0]) });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Could not add this product.' });
  }
});

router.put('/admin/shop/products/:id', requireAdmin, async (req, res) => {
  const f = shopFields(req.body || {});
  if (f.error) return res.status(400).json({ error: f.error });
  try {
    const r = await pool.query(
      `UPDATE shop_products SET name=$1, category=$2, description=$3, price_cents=$4, sizes=$5, images=$6, in_stock=$7, visible=$8
       WHERE id = $9 RETURNING *`,
      [...f.values, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Product not found.' });
    res.json({ ok: true, product: shopOut(r.rows[0]) });
  } catch (err) {
    console.error('Edit product error:', err);
    res.status(500).json({ error: 'Could not save this product.' });
  }
});

router.delete('/admin/shop/products/:id', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM shop_products WHERE id = $1 RETURNING id', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Product not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Could not delete this product.' });
  }
});

// Public: what the website's Shop page shows. While closed, no products leave the server.
router.get('/shop', async (req, res) => {
  try {
    const open = (await getSetting('shop_open', 'false')) === 'true';
    if (!open) return res.json({ open: false, products: [] });
    const r = await pool.query('SELECT * FROM shop_products WHERE visible = true ORDER BY position, id');
    res.json({ open: true, products: r.rows.map(shopOut) });
  } catch (err) {
    console.error('Public shop error:', err);
    res.status(500).json({ error: 'Could not load the shop.' });
  }
});

/* -------------------------------- Camps -------------------------------- */

router.get('/admin/camp', requireAdmin, async (req, res) => {
  try {
    const [open, rows] = await Promise.all([
      getSetting('camp_open', 'false'),
      pool.query('SELECT * FROM camps ORDER BY position, id'),
    ]);
    res.json({ open: open === 'true', camps: rows.rows.map(campOut) });
  } catch (err) {
    console.error('Admin camp error:', err);
    res.status(500).json({ error: 'Could not load the camps.' });
  }
});

router.post('/admin/camp/availability', requireAdmin, async (req, res) => {
  const { open } = req.body || {};
  if (typeof open !== 'boolean') return res.status(400).json({ error: '"open" must be true or false.' });
  try {
    await setSetting('camp_open', open ? 'true' : 'false');
    res.json({ ok: true, open });
  } catch (err) {
    console.error('Camp availability error:', err);
    res.status(500).json({ error: 'Could not update the camps.' });
  }
});

function campFields(body) {
  const title = str(body.title, 160);
  if (!title) return { error: 'Please enter a camp title.' };
  const start = body.startDate ? String(body.startDate) : '';
  const end = body.endDate ? String(body.endDate) : '';
  if ((start && !ISO_DATE.test(start)) || (end && !ISO_DATE.test(end))) return { error: 'Dates must be real dates (MM/DD/YYYY).' };
  if (start && end && end < start) return { error: 'The end date is before the start date.' };
  const season = SEASONS.has(body.season) ? body.season : 'summer';
  const spots = body.spots === '' || body.spots == null ? null : Math.max(0, Math.round(Number(body.spots)) || 0);
  return {
    values: [title, season, start || null, end || null, str(body.schedule, 200), str(body.location, 200), str(body.ages, 80),
      cents(body.priceCents), spots, str(body.description, 4000), JSON.stringify(cleanImages(body.images)), body.visible !== false],
  };
}

router.post('/admin/camp/camps', requireAdmin, async (req, res) => {
  const f = campFields(req.body || {});
  if (f.error) return res.status(400).json({ error: f.error });
  try {
    const r = await pool.query(
      `INSERT INTO camps (title, season, start_date, end_date, schedule, location, ages, price_cents, spots, description, images, visible, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, COALESCE((SELECT MAX(position) FROM camps), 0) + 1) RETURNING *`,
      f.values
    );
    res.status(201).json({ ok: true, camp: campOut(r.rows[0]) });
  } catch (err) {
    console.error('Add camp error:', err);
    res.status(500).json({ error: 'Could not add this camp.' });
  }
});

router.put('/admin/camp/camps/:id', requireAdmin, async (req, res) => {
  const f = campFields(req.body || {});
  if (f.error) return res.status(400).json({ error: f.error });
  try {
    const r = await pool.query(
      `UPDATE camps SET title=$1, season=$2, start_date=$3, end_date=$4, schedule=$5, location=$6, ages=$7, price_cents=$8,
         spots=$9, description=$10, images=$11, visible=$12 WHERE id = $13 RETURNING *`,
      [...f.values, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Camp not found.' });
    res.json({ ok: true, camp: campOut(r.rows[0]) });
  } catch (err) {
    console.error('Edit camp error:', err);
    res.status(500).json({ error: 'Could not save this camp.' });
  }
});

router.delete('/admin/camp/camps/:id', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM camps WHERE id = $1 RETURNING id', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Camp not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete camp error:', err);
    res.status(500).json({ error: 'Could not delete this camp.' });
  }
});

router.get('/camps', async (req, res) => {
  try {
    const open = (await getSetting('camp_open', 'false')) === 'true';
    if (!open) return res.json({ open: false, camps: [] });
    const r = await pool.query('SELECT * FROM camps WHERE visible = true ORDER BY position, id');
    res.json({ open: true, camps: r.rows.map(campOut) });
  } catch (err) {
    console.error('Public camps error:', err);
    res.status(500).json({ error: 'Could not load the camps.' });
  }
});

module.exports = router;
