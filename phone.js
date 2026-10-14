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
  const targets = [
    ['players', 'parent_phone'],
    ['skills_registrations', 'phone'],
    ['join_registrations', 'phone'],
    ['join_registrations', 'emergency_phone'],
    ['coaches', 'phone'],
  ];
  let n = 0;
  for (const [table, col] of targets) {
    const r = await pool.query(`SELECT id, ${col} AS v FROM ${table} WHERE ${col} IS NOT NULL AND ${col} <> ''`);
    for (const row of r.rows) {
      const f = formatPhone(row.v);
      if (f !== row.v) {
        await pool.query(`UPDATE ${table} SET ${col} = $1 WHERE id = $2`, [f, row.id]);
        n++;
      }
    }
  }
  return n;
}

module.exports = { formatPhone, migratePlayerPhones };
