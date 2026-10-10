// Uniform sizes (adapted from a reference size chart) and the
// Tuesday/Thursday day choice for one-session players.
const SIZE_GROUPS = [
  { label: 'Toddler', sizes: [['2T', '2T (age 1-2)'], ['3T', '3T (age 2-3)'], ['4T', '4T (age 3-4)']] },
  { label: 'Youth', sizes: [['YXS', 'Youth XS (6/7)'], ['YS', 'Youth S (7/8)'], ['YM', 'Youth M (10/12)'], ['YL', 'Youth L (14/16)'], ['YXL', 'Youth XL (18/20)']] },
  { label: 'Adult', sizes: [['S', 'S'], ['M', 'M'], ['L', 'L'], ['XL', 'XL'], ['2XL', '2XL'], ['3XL', '3XL'], ['4XL', '4XL']] },
];
const VALID_SIZES = new Set(SIZE_GROUPS.flatMap((g) => g.sizes.map((s) => s[0])));
const VALID_DAYS = new Set(['tuesday', 'thursday']);

function normalizeSize(v) {
  const s = String(v || '').trim().toUpperCase();
  return VALID_SIZES.has(s) ? s : null;
}
function normalizeDay(v, sessionType) {
  if (sessionType !== 'one') return null;
  const d = String(v || '').trim().toLowerCase();
  return VALID_DAYS.has(d) ? d : null;
}

module.exports = { SIZE_GROUPS, VALID_SIZES, VALID_DAYS, normalizeSize, normalizeDay };
