const pool = require('./pool');

async function getSetting(key, fallback) {
  const res = await pool.query('SELECT value FROM site_settings WHERE key = $1', [key]);
  if (!res.rows[0]) return fallback;
  return res.rows[0].value;
}

async function setSetting(key, value) {
  await pool.query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
}

module.exports = { getSetting, setSetting };
