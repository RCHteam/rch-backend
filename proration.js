const pool = require('./pool');
const { getMonthlyRates, effectiveDiscountCents } = require('./discounts');

/* ------------------------------------------------------------------------
 * First-month proration for revenue estimates.
 *
 * A family who joins partway through a month is only charged for the
 * practices (Tuesdays + Thursdays) still ahead of them on the day their
 * payment link was sent — the same rule payments.js uses to actually charge
 * them. Revenue estimates used to count every active player for a full
 * month, so late joiners were overstated. This works out, for a given
 * month, how much LESS than a full month each late joiner pays, per grade.
 * ---------------------------------------------------------------------- */

function centralDateParts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(date)).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

function practiceDates(year, month) { // month 1-12 → [{day, weekday}] Tue/Thu only
  const total = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const out = [];
  for (let d = 1; d <= total; d++) {
    const wd = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    if (wd === 2 || wd === 4) out.push({ day: d, weekday: wd });
  }
  return out;
}

function practicesFrom(year, month, fromDay) {
  const all = practiceDates(year, month);
  return { total: all.length, remaining: all.filter((p) => p.day >= fromDay).length };
}

// Pure math, shared with tests: what a player pays in the month their link
// was sent, versus a full month.
function firstMonthAmounts({ monthlyCents, discountCents, year, month, day }) {
  const full = Math.max(0, (monthlyCents || 0) - (discountCents || 0));
  const { total, remaining } = practicesFrom(year, month, day);
  const fraction = total > 0 ? Math.min(1, remaining / total) : 1;
  const prorated = Math.round(full * fraction);
  return { full, prorated, reduction: full - prorated, remaining, total };
}

// monthKey is 'YYYY-MM-01'. Returns { byGrade: {grade: {reductionCents, lateJoiners}}, details: [...] }
async function getProrationAdjustments(monthKey) {
  const [yy, mm] = monthKey.slice(0, 7).split('-').map(Number);
  const rates = await getMonthlyRates();
  const res = await pool.query(
    `SELECT p.id, p.grade, p.player_name, p.session_type, p.discount_cents, p.sibling_discount,
            (SELECT MIN(pl.created_at) FROM payment_links pl
              WHERE (pl.registration_type = 'player' AND pl.registration_id = p.id)
                 OR (lower(pl.child_name) = lower(p.player_name)
                     AND lower(pl.email) = lower(COALESCE(p.parent_email, '')))) AS first_link_at
     FROM players p
     WHERE p.archived_at IS NULL`
  );
  const byGrade = {};
  const details = [];
  for (const p of res.rows) {
    if (!p.first_link_at) continue;
    const c = centralDateParts(p.first_link_at);
    if (c.year !== yy || c.month !== mm) continue; // only the month the link first went out
    const monthly = rates[p.session_type] ?? rates.one;
    const disc = effectiveDiscountCents(p, rates);
    const a = firstMonthAmounts({ monthlyCents: monthly, discountCents: disc, year: yy, month: mm, day: c.day });
    if (!byGrade[p.grade]) byGrade[p.grade] = { reductionCents: 0, lateJoiners: 0 };
    byGrade[p.grade].reductionCents += a.reduction;
    if (a.reduction > 0) byGrade[p.grade].lateJoiners += 1;
    details.push({ playerId: p.id, name: p.player_name, grade: p.grade, linkDay: c.day, ...a });
  }
  return { byGrade, details };
}

module.exports = { centralDateParts, practiceDates, practicesFrom, firstMonthAmounts, getProrationAdjustments };
