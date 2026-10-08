const { getSetting } = require('./settings');

// The monthly rates families are actually charged (the "Payment Link Amounts"
// box on the Finances tab).
async function getMonthlyRates() {
  const [one, two, online] = await Promise.all([
    getSetting('payment_one_session_monthly_cents', '6000'),
    getSetting('payment_two_session_monthly_cents', '10000'),
    getSetting('payment_online_course_monthly_cents', '3120'),
  ]);
  return { one: parseInt(one, 10) || 0, two: parseInt(two, 10) || 0, online: parseInt(online, 10) || 0 };
}

// The discount that really applies to a player: a manual dollar discount
// (discount_cents > 0) always wins; otherwise the sibling percentage is taken
// off the player's current monthly rate for their session type.
function effectiveDiscountCents(player, rates) {
  const manual = Number(player.discount_cents) || 0;
  if (manual > 0) return manual;
  const pct = Number(player.sibling_discount) || 0;
  if (!pct) return 0;
  const rate = rates[player.session_type] ?? rates.one;
  return Math.round((rate * pct) / 100);
}

// Same rule as SQL, for the grouped totals. Rates are integers parsed above,
// so interpolating them is safe.
function effectiveDiscountSql(rates, alias = '') {
  const a = alias ? alias + '.' : '';
  const r = (n) => Math.round(Number(n) || 0);
  return `(CASE WHEN COALESCE(${a}discount_cents, 0) > 0 THEN ${a}discount_cents
    ELSE ROUND((CASE ${a}session_type WHEN 'two' THEN ${r(rates.two)} WHEN 'online' THEN ${r(rates.online)} ELSE ${r(rates.one)} END)
      * COALESCE(${a}sibling_discount, 0) / 100.0)::int END)`;
}

module.exports = { getMonthlyRates, effectiveDiscountCents, effectiveDiscountSql };
