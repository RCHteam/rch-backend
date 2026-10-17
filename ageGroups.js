// US Youth Soccer school-year age groups: a season runs Aug 1 - Jul 31.
// A player's U-age = season start year - the year of the Aug-1 school year they were born in.
// U4 and U5 (and anything younger) are treated as one group.
const AGE_KEYS = ['u5-', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12', 'u13', 'u14+', 'nodob'];

function seasonStartYear(now) {
  const d = now || new Date();
  return d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
}

// dob can be 'YYYY-MM-DD', an ISO string, or a Date.
function ageNumber(dob, now) {
  let y, m;
  if (dob instanceof Date) {
    if (isNaN(dob)) return null;
    y = dob.getFullYear(); m = dob.getMonth() + 1;
  } else {
    const p = String(dob || '').slice(0, 10).split('-');
    if (p.length !== 3 || !Number(p[0])) return null;
    y = Number(p[0]); m = Number(p[1]);
  }
  return seasonStartYear(now) - (m >= 8 ? y : y - 1);
}

function ageGroupKey(dob, now) {
  const n = ageNumber(dob, now);
  if (n == null) return 'nodob';
  if (n <= 5) return 'u5-';
  if (n >= 14) return 'u14+';
  return 'u' + n;
}

function ageGroupLabel(dob, now) {
  const n = ageNumber(dob, now);
  if (n == null) return '';
  if (n <= 5) return 'U4/U5';
  return 'U' + n;
}

function keyLabel(key) {
  if (key === 'u5-') return 'U4 & U5';
  if (key === 'u14+') return 'U14 & older';
  if (key === 'nodob') return 'No birth date';
  return key.toUpperCase();
}

module.exports = { AGE_KEYS, seasonStartYear, ageNumber, ageGroupKey, ageGroupLabel, keyLabel };
