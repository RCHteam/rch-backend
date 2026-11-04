// Uniform sizes (adapted from a reference size chart) and the
// Tuesday/Thursday day choice for one-session players.
const SIZE_GROUPS = [
  { label: 'Toddler', sizes: [['2T', '2T (age 1-2)'], ['3T', '3T (age 2-3)'], ['4T', '4T (age 3-4)']] },
  { label: 'Youth', sizes: [['YXS', 'Youth XS (6/7)'], ['YS', 'Youth S (7/8)'], ['YM', 'Youth M (10/12)'], ['YL', 'Youth L (14/16)'], ['YXL', 'Youth XL (18/20)']] },
  { label: 'Adult', sizes: [['S', 'S'], ['M', 'M'], ['L', 'L'], ['XL', 'XL'], ['2XL', '2XL'], ['3XL', '3XL'], ['4XL', '4XL']] },
];
// Extra sizes only the owner can pick when editing a player (parents keep the short list above).
const ADMIN_EXTRA_GROUPS = [
  { label: 'Women', sizes: [['WXS', 'Women XS'], ['WS', 'Women S'], ['WM', 'Women M'], ['WL', 'Women L'], ['WXL', 'Women XL'], ['W2XL', 'Women 2XL'], ['W3XL', 'Women 3XL']] },
  { label: 'Goalie - Men', sizes: [['GS', 'Goalie S'], ['GM', 'Goalie M'], ['GL', 'Goalie L'], ['GXL', 'Goalie XL'], ['G2XL', 'Goalie 2XL'], ['G3XL', 'Goalie 3XL'], ['G4XL', 'Goalie 4XL']] },
  { label: 'Goalie - Women', sizes: [['GWXS', 'Goalie Women XS'], ['GWS', 'Goalie Women S'], ['GWM', 'Goalie Women M'], ['GWL', 'Goalie Women L'], ['GWXL', 'Goalie Women XL'], ['GW2XL', 'Goalie Women 2XL'], ['GW3XL', 'Goalie Women 3XL']] },
  { label: 'Goalie - Youth', sizes: [['GYXS', 'Goalie Youth XS'], ['GYS', 'Goalie Youth S'], ['GYM', 'Goalie Youth M'], ['GYL', 'Goalie Youth L'], ['GYXL', 'Goalie Youth XL']] },
];
const VALID_SIZES = new Set(SIZE_GROUPS.concat(ADMIN_EXTRA_GROUPS).flatMap((g) => g.sizes.map((s) => s[0])));
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
