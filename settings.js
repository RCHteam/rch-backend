const pool = require('./pool');

// Tiny in-memory cache: settings are read many times per request (prices,
// reset date, open/closed flags) but change rarely. Writes through setSetting
// update the cache immediately; the short TTL is just a safety net.
const TTL_MS = 30 * 1000;
const cache = new Map();

async function getSetting(key, fallback) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.exists ? hit.value : fallback;
  const res = await pool.query('SELECT value FROM site_settings WHERE key = $1', [key]);
  const exists = !!res.rows[0];
  cache.set(key, { exists, value: exists ? res.rows[0].value : null, expires: Date.now() + TTL_MS });
  return exists ? res.rows[0].value : fallback;
}

async function setSetting(key, value) {
  await pool.query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
  cache.set(key, { exists: true, value, expires: Date.now() + TTL_MS });
}

module.exports = { getSetting, setSetting };
