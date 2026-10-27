// Website pictures: the owner adds photos to the public site in "photo mode"
// (open the website with ?photos). Each picture belongs to a named "slot".
const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');

const router = express.Router();
const SLOT_RE = /^[a-z0-9-]{1,60}$/;
const DATA_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const MAX_CHARS = 4000000;

function clampInt(v, lo, hi, dflt) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
}

// Public: which slots have a picture (no image data, just the settings).
router.get('/site-images', async (req, res) => {
  try {
    const r = await pool.query('SELECT slot, dim, fx, fy, (extract(epoch from updated_at) * 1000)::bigint AS v FROM site_images');
    const out = {};
    r.rows.forEach((x) => { out[x.slot] = { v: Number(x.v), dim: x.dim, fx: x.fx, fy: x.fy }; });
    res.set('Cache-Control', 'no-cache').json(out);
  } catch (err) {
    console.error('List site images error:', err);
    res.json({});
  }
});

// Public: the picture itself.
router.get('/site-images/:slot', async (req, res) => {
  try {
    if (!SLOT_RE.test(req.params.slot)) return res.status(404).end();
    const r = await pool.query('SELECT data FROM site_images WHERE slot = $1', [req.params.slot]);
    if (!r.rows[0]) return res.status(404).end();
    const m = DATA_RE.exec(r.rows[0].data);
    if (!m) return res.status(404).end();
    res.set({ 'Content-Type': m[1], 'Cache-Control': 'public, max-age=31536000, immutable' });
    res.send(Buffer.from(m[2], 'base64'));
  } catch (err) {
    console.error('Site image error:', err);
    res.status(500).end();
  }
});

// Admin: add/replace a picture and/or change its darkness and position.
router.put('/admin/site-images/:slot', requireAdmin, async (req, res) => {
  const slot = req.params.slot;
  if (!SLOT_RE.test(slot)) return res.status(400).json({ error: 'Unknown picture spot.' });
  const b = req.body || {};
  const dim = clampInt(b.dim, 0, 80, 25);
  const fx = clampInt(b.fx, 0, 100, 50);
  const fy = clampInt(b.fy, 0, 100, 50);
  try {
    let r;
    if (b.image) {
      if (typeof b.image !== 'string' || b.image.length > MAX_CHARS || !DATA_RE.test(b.image)) {
        return res.status(400).json({ error: 'That picture is not a supported image (use JPG, PNG or WebP).' });
      }
      r = await pool.query(
        `INSERT INTO site_images (slot, data, dim, fx, fy, updated_at) VALUES ($1,$2,$3,$4,$5, now())
         ON CONFLICT (slot) DO UPDATE SET data = $2, dim = $3, fx = $4, fy = $5, updated_at = now()
         RETURNING (extract(epoch from updated_at) * 1000)::bigint AS v`,
        [slot, b.image, dim, fx, fy]);
    } else {
      r = await pool.query(
        `UPDATE site_images SET dim = $2, fx = $3, fy = $4, updated_at = now() WHERE slot = $1
         RETURNING (extract(epoch from updated_at) * 1000)::bigint AS v`,
        [slot, dim, fx, fy]);
      if (!r.rows[0]) return res.status(400).json({ error: 'Choose a picture first.' });
    }
    res.json({ ok: true, v: Number(r.rows[0].v) });
  } catch (err) {
    console.error('Save site image error:', err);
    res.status(500).json({ error: 'Could not save the picture.' });
  }
});

router.delete('/admin/site-images/:slot', requireAdmin, async (req, res) => {
  try {
    if (!SLOT_RE.test(req.params.slot)) return res.status(400).json({ error: 'Unknown picture spot.' });
    await pool.query('DELETE FROM site_images WHERE slot = $1', [req.params.slot]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete site image error:', err);
    res.status(500).json({ error: 'Could not remove the picture.' });
  }
});

module.exports = router;
