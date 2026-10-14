// Formats a US phone number as "+1 XXX-XXX-XXXX". Anything that is not a
// clear 10-digit (or 11-digit starting with 1) number is returned unchanged.
function formatPhone(raw) {
  if (raw == null) return raw;
  const s = String(raw).trim();
  if (!s) return s;
  let d = s.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') d = d.slice(1);
  if (d.length !== 10) return s;
  return '+1 ' + d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
}

// Rewrites every existing player's phone into the standard format.
// Safe to run on every start-up: already-formatted numbers are skipped.
async function migratePlayerPhones(pool) {
  const r = await pool.query("SELECT id, parent_phone FROM players WHERE parent_phone IS NOT NULL AND parent_phone <> ''");
  let n = 0;
  for (const row of r.rows) {
    const f = formatPhone(row.parent_phone);
    if (f !== row.parent_phone) {
      await pool.query('UPDATE players SET parent_phone = $1 WHERE id = $2', [f, row.id]);
      n++;
    }
  }
  return n;
}

module.exports = { formatPhone, migratePlayerPhones };
