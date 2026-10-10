const pool = require('./pool');
const { getSetting } = require('./settings');
const { getMonthlyRates, effectiveDiscountSql } = require('./discounts');
const { getProrationAdjustments } = require('./proration');
const PDFDocument = require('pdfkit');

const GRADES = ['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'];
const GRADE_LABELS = {
  'pre-k': 'Pre-K', 'kindergarten': 'Kindergarten', '1st-grade': '1st Grade', '2nd-grade': '2nd Grade',
  '3rd-grade': '3rd Grade', '4th-grade': '4th Grade', '5th-grade': '5th Grade', '6th-grade': '6th Grade',
};
const COACH_ROLES = ['general_manager', 'head_coach', 'coach', 'volunteer'];
const COACH_ROLE_LABELS = {
  general_manager: 'General Manager', head_coach: 'Head Coaches', coach: 'Coaches', volunteer: 'Volunteer',
};

// Same confirmed Stripe rates used in the live Pricing & Revenue table
// (adminPage.js) — kept in sync manually since one lives in the browser
// script and this one runs server-side for the PDF.
const STRIPE_PCT = 0.029;
const STRIPE_BILLING_PCT = 0.007;
const STRIPE_FIXED_CENTS = 30;

function monthKeyFromDate(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function monthLabelFromKey(monthKey) {
  const d = new Date(`${monthKey}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' });
}

function money(cents) {
  return '$' + ((cents || 0) / 100).toFixed(2);
}

// Gathers everything the report needs. `monthKey` is a 'YYYY-MM-01' string —
// note that "Potential RCH/Sultans" and "Coaches" are current, LIVE counts
// (there's no historical tracking for those), so this report is most
// accurate when generated for the CURRENT or just-ended month rather than
// a month long past.
async function gatherMonthlyReportData(monthKey) {
  const monthShort = monthKey.slice(0, 7); // 'YYYY-MM'
  const discountRates = await getMonthlyRates();
  const proration = await getProrationAdjustments(monthKey);

  const [
    potentialRch,
    potentialSultans,
    rosterRch,
    rosterSultansByGrade,
    overviewRows,
    pricingOne,
    pricingTwo,
    pricingOnline,
    chargesRows,
    oneTimePayments,
    coaches,
  ] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS n FROM skills_registrations WHERE moved_at IS NULL`),
    pool.query(`SELECT COUNT(*)::int AS n FROM join_registrations WHERE moved_at IS NULL`),
    pool.query(`SELECT COUNT(*)::int AS n FROM players WHERE rch AND archived_at IS NULL`),
    pool.query(`SELECT grade AS age_group, COUNT(*)::int AS n FROM players WHERE sultans AND archived_at IS NULL GROUP BY grade`),
    pool.query(`
      SELECT grade,
        COUNT(*)::int AS total_players,
        COUNT(*) FILTER (WHERE session_type = 'one')::int AS total_one,
        COUNT(*) FILTER (WHERE session_type = 'two')::int AS total_two,
        COUNT(*) FILTER (WHERE session_type = 'online')::int AS total_online,
        COALESCE(SUM(${effectiveDiscountSql(discountRates)}), 0)::int AS total_discount_cents
      FROM players WHERE archived_at IS NULL GROUP BY grade
    `),
    getSetting('payment_one_session_monthly_cents', '6000'),
    getSetting('payment_two_session_monthly_cents', '10000'),
    getSetting('payment_online_course_monthly_cents', '3120'),
    pool.query(`SELECT * FROM charges WHERE kind = 'recurring' OR charge_month = $1::date ORDER BY kind, description`, [monthKey]),
    pool.query(
      `SELECT * FROM one_time_payments
       WHERE status = 'completed' AND to_char(completed_at, 'YYYY-MM') = $1
       ORDER BY completed_at`,
      [monthShort]
    ),
    pool.query('SELECT * FROM coaches ORDER BY name'),
  ]);

  const joinCountsByGrade = Object.fromEntries(GRADES.map((g) => [g, 0]));
  rosterSultansByGrade.rows.forEach((r) => { joinCountsByGrade[r.age_group] = r.n; });

  const priceOneCents = parseInt(pricingOne, 10);
  const priceTwoCents = parseInt(pricingTwo, 10);
  const priceOnlineCents = parseInt(pricingOnline, 10);

  const overviewByGrade = Object.fromEntries(GRADES.map((g) => [g, { totalPlayers: 0, totalOne: 0, totalTwo: 0, totalOnline: 0, totalDiscountCents: 0, prorationReductionCents: 0, lateJoiners: 0 }]));
  overviewRows.rows.forEach((r) => {
    overviewByGrade[r.grade] = {
      totalPlayers: r.total_players, totalOne: r.total_one, totalTwo: r.total_two, totalOnline: r.total_online,
      totalDiscountCents: r.total_discount_cents,
      prorationReductionCents: 0, lateJoiners: 0,
    };
  });
  GRADES.forEach((g) => {
    const adj = proration.byGrade[g];
    if (adj) { overviewByGrade[g].prorationReductionCents = adj.reductionCents; overviewByGrade[g].lateJoiners = adj.lateJoiners; }
  });

  // Revenue + Stripe fee estimate, grade by grade — mirrors renderRevenueTable
  // in adminPage.js (gross roster revenue minus discounts, minus estimated
  // Stripe fees at 2.9% + $0.30 + 0.7% billing per player charge).
  const revenueByGrade = GRADES.map((g) => {
    const o = overviewByGrade[g];
    const revOne = o.totalOne * priceOneCents;
    const revTwo = o.totalTwo * priceTwoCents;
    const revOnline = o.totalOnline * priceOnlineCents;
    const disc = o.totalDiscountCents || 0;
    const prorationCents = o.prorationReductionCents || 0;
    const total = revOne + revTwo + revOnline - disc - prorationCents;
    const fee = Math.round(total * (STRIPE_PCT + STRIPE_BILLING_PCT)) + ((o.totalOne + o.totalTwo + o.totalOnline) * STRIPE_FIXED_CENTS);
    const net = total - fee;
    return { grade: g, label: GRADE_LABELS[g], totalOne: o.totalOne, totalTwo: o.totalTwo, totalOnline: o.totalOnline, revOne, revTwo, revOnline, disc, prorationCents, lateJoiners: o.lateJoiners || 0, total, fee, net };
  });
  const revenueTotals = revenueByGrade.reduce((acc, r) => ({
    totalOne: acc.totalOne + r.totalOne, totalTwo: acc.totalTwo + r.totalTwo, totalOnline: acc.totalOnline + r.totalOnline,
    revOne: acc.revOne + r.revOne, revTwo: acc.revTwo + r.revTwo, revOnline: acc.revOnline + r.revOnline, disc: acc.disc + r.disc, prorationCents: acc.prorationCents + r.prorationCents, lateJoiners: acc.lateJoiners + r.lateJoiners,
    total: acc.total + r.total, fee: acc.fee + r.fee, net: acc.net + r.net,
  }), { totalOne: 0, totalTwo: 0, totalOnline: 0, revOne: 0, revTwo: 0, revOnline: 0, disc: 0, prorationCents: 0, lateJoiners: 0, total: 0, fee: 0, net: 0 });

  const businessChargesCents = chargesRows.rows.reduce((sum, c) => sum + c.amount_cents, 0);
  const finalNetRevenueCents = revenueTotals.net - businessChargesCents;

  return {
    monthKey,
    monthLabel: monthLabelFromKey(monthKey),
    potentialRchCount: potentialRch.rows[0].n,
    potentialSultansCount: potentialSultans.rows[0].n,
    skillsTrainingCount: rosterRch.rows[0].n,
    joinCountsByGrade,
    overviewByGrade,
    revenueByGrade,
    revenueTotals,
    businessCharges: chargesRows.rows,
    businessChargesCents,
    finalNetRevenueCents,
    oneTimePayments: oneTimePayments.rows,
    coaches: coaches.rows,
  };
}

function drawSectionHeading(doc, text) {
  if (doc.y > 680) doc.addPage();
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#0c2a1c').text(text);
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(10).fillColor('#000000');
}

function drawRow(doc, label, value) {
  if (doc.y > 740) doc.addPage();
  doc.text(label + ':  ' + value);
}

function buildMonthlyReportPdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.font('Helvetica-Bold').fontSize(20).fillColor('#0c2a1c').text('RCH Elite Training', { align: 'center' });
      doc.font('Helvetica').fontSize(14).fillColor('#444444').text(`Monthly Report — ${data.monthLabel}`, { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(9).fillColor('#888888')
        .text('Potential RCH/Sultans and Coaches reflect a live snapshot at the time this report was generated, not a historical record for this specific month.', { align: 'center' });
      doc.fillColor('#000000');

      // --- Dashboard Summary ---
      drawSectionHeading(doc, 'Dashboard Summary');
      drawRow(doc, 'Potential RCH', data.potentialRchCount);
      drawRow(doc, 'Potential Sultans', data.potentialSultansCount);
      drawRow(doc, 'Skills Training (RCH players on roster)', data.skillsTrainingCount);
      GRADES.forEach((g) => {
        drawRow(doc, `Join FC ${GRADE_LABELS[g]}`, data.joinCountsByGrade[g]);
      });

      // --- Season Overview ---
      drawSectionHeading(doc, 'Season Overview — All Grades');
      GRADES.forEach((g) => {
        const o = data.overviewByGrade[g];
        drawRow(doc, GRADE_LABELS[g], `${o.totalPlayers} players (One: ${o.totalOne}, Two: ${o.totalTwo}, Online: ${o.totalOnline})`);
      });
      const totalPlayers = GRADES.reduce((s, g) => s + data.overviewByGrade[g].totalPlayers, 0);
      doc.font('Helvetica-Bold');
      drawRow(doc, 'TOTAL', `${totalPlayers} players`);
      doc.font('Helvetica');

      // --- Final Net Revenue ---
      drawSectionHeading(doc, 'Final Net Revenue');
      GRADES.forEach((g) => {
        const r = data.revenueByGrade.find((x) => x.grade === g);
        if (r.total === 0 && r.totalOne === 0 && r.totalTwo === 0 && r.totalOnline === 0) return;
        drawRow(doc, r.label, `${money(r.total)} gross, -${money(r.fee)} Stripe fees, ${money(r.net)} net`);
      });
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold');
      if (data.revenueTotals.prorationCents > 0) drawRow(doc, `Late-joiner proration (${data.revenueTotals.lateJoiners} players, partial first month)`, '-' + money(data.revenueTotals.prorationCents));
      drawRow(doc, 'Total Revenue (gross)', money(data.revenueTotals.total));
      drawRow(doc, 'Est. Stripe Fees', '-' + money(data.revenueTotals.fee));
      drawRow(doc, 'Business Charges This Month', '-' + money(data.businessChargesCents));
      drawRow(doc, 'FINAL NET REVENUE', money(data.finalNetRevenueCents));
      doc.font('Helvetica');

      // --- One-Time Payments ---
      drawSectionHeading(doc, `One-Time Payments Completed in ${data.monthLabel}`);
      if (!data.oneTimePayments.length) {
        doc.text('None this month.');
      } else {
        data.oneTimePayments.forEach((p) => {
          const who = p.recipient_name ? `${p.recipient_name}${p.email ? ' (' + p.email + ')' : ''}` : 'Ad hoc link';
          drawRow(doc, p.title, `${money(p.amount_cents)} — ${who}`);
        });
        const oneTimeTotal = data.oneTimePayments.reduce((s, p) => s + p.amount_cents, 0);
        doc.font('Helvetica-Bold');
        drawRow(doc, 'Total One-Time Payments', money(oneTimeTotal));
        doc.font('Helvetica');
      }

      // --- Business Charges (Recurring & One-Time) ---
      drawSectionHeading(doc, 'Business Charges — Recurring & One-Time');
      const recurring = data.businessCharges.filter((c) => c.kind === 'recurring');
      const oneTime = data.businessCharges.filter((c) => c.kind === 'one_time');
      doc.font('Helvetica-Bold').text('Recurring:');
      doc.font('Helvetica');
      if (!recurring.length) { doc.text('None logged.'); }
      recurring.forEach((c) => drawRow(doc, c.description, money(c.amount_cents)));
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').text('One-Time (this month):');
      doc.font('Helvetica');
      if (!oneTime.length) { doc.text('None logged for this month.'); }
      oneTime.forEach((c) => drawRow(doc, c.description, money(c.amount_cents)));

      // --- Coaches --- (category + name only, per request — no contact
      // info, qualifications, certificates, degree, etc. in the report)
      drawSectionHeading(doc, 'Current Coaches');
      if (!data.coaches.length) {
        doc.text('None on file.');
      } else {
        COACH_ROLES.forEach((role) => {
          const inRole = data.coaches.filter((c) => (c.role || 'coach') === role);
          if (!inRole.length) return;
          doc.font('Helvetica-Bold').text(COACH_ROLE_LABELS[role] + ':');
          doc.font('Helvetica');
          inRole.forEach((c) => doc.text(c.name));
          doc.moveDown(0.3);
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { gatherMonthlyReportData, buildMonthlyReportPdf, monthKeyFromDate, monthLabelFromKey };
