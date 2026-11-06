const pool = require('./pool');
const { getSetting } = require('./settings');
const { getMonthlyRates, getRevenueRateRaw, effectiveDiscountSql } = require('./discounts');
const { getProrationAdjustments } = require('./proration');
const PDFDocument = require('pdfkit');

const GRADES = ['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'];
const GRADE_LABELS = {
  'pre-k': 'Pre-K', 'kindergarten': 'Kindergarten', '1st-grade': '1st Grade', '2nd-grade': '2nd Grade',
  '3rd-grade': '3rd Grade', '4th-grade': '4th Grade', '5th-grade': '5th Grade', '6th-grade': '6th Grade',
};
const COACH_ROLES = ['president', 'general_manager', 'head_coach', 'coach', 'volunteer'];
const COACH_ROLE_LABELS = {
  president: 'President', general_manager: 'General Manager', head_coach: 'Head Coaches', coach: 'Coaches', volunteer: 'Volunteer',
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
    linkPayments,
  ] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS n FROM skills_registrations WHERE moved_at IS NULL`),
    pool.query(`SELECT COUNT(*)::int AS n FROM join_registrations WHERE moved_at IS NULL`),
    pool.query(`SELECT COUNT(*)::int AS n FROM players WHERE rch AND archived_at IS NULL AND paused_at IS NULL`),
    pool.query(`SELECT grade AS age_group, COUNT(*)::int AS n FROM players WHERE sultans AND archived_at IS NULL AND paused_at IS NULL GROUP BY grade`),
    pool.query(`
      SELECT grade,
        COUNT(*)::int AS total_players,
        COUNT(*) FILTER (WHERE session_type = 'one')::int AS total_one,
        COUNT(*) FILTER (WHERE session_type = 'two')::int AS total_two,
        COUNT(*) FILTER (WHERE session_type = 'online')::int AS total_online,
        COALESCE(SUM(${effectiveDiscountSql(discountRates)}), 0)::int AS total_discount_cents
      FROM players WHERE archived_at IS NULL AND paused_at IS NULL GROUP BY grade
    `),
    getRevenueRateRaw('one'),
    getRevenueRateRaw('two'),
    getRevenueRateRaw('online'),
    pool.query(`SELECT * FROM charges WHERE kind = 'recurring' OR charge_month = $1::date ORDER BY kind, description`, [monthKey]),
    pool.query(
      `SELECT * FROM one_time_payments
       WHERE status = 'completed' AND to_char(completed_at, 'YYYY-MM') = $1
       ORDER BY completed_at`,
      [monthShort]
    ),
    pool.query('SELECT * FROM coaches ORDER BY name'),
    pool.query(
      `SELECT child_name, program_label, one_time_amount_cents, sultans_kit_cents, prorated_amount_cents, completed_at
         FROM payment_links
        WHERE status IN ('completed', 'canceled') AND completed_at IS NOT NULL AND to_char(completed_at AT TIME ZONE 'America/Chicago', 'YYYY-MM') = $1
        ORDER BY completed_at`,
      [monthShort]
    ),
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
    // What families actually paid at checkout this month (kit fee(s) + prorated first month).
    linkPayments: linkPayments.rows,
    lateJoiners: (proration.details || []).filter((d) => d.reduction > 0),
  };
}

// ---- PDF design: green like the website, with the RCH logo ----
const path = require('path');
const LOGO_PATH = path.join(__dirname, 'assets', 'rch-logo.png');
const C = { dark: '#0c2a1c', green: '#164a30', mid: '#17803f', light: '#e6f2ea', zebra: '#f4f9f5', ink: '#1b2a22', muted: '#6b7a70', line: '#d5e3da' };
const PAGE_W = 612, PAGE_H = 792, MX = 40, CW = 532, BOTTOM = 56;

function ensure(doc, h) {
  if (doc.y + h > PAGE_H - BOTTOM) doc.addPage();
}

function drawBand(doc, data, first) {
  if (first) {
    doc.rect(0, 0, PAGE_W, 112).fill(C.green);
    doc.rect(0, 112, PAGE_W, 5).fill(C.mid);
    try { doc.image(LOGO_PATH, MX, 18, { height: 76 }); } catch (e) { /* logo is optional */ }
    doc.fillColor('#b9e4c8').font('Helvetica-Bold').fontSize(10)
      .text('MONTHLY REPORT', MX, 34, { width: CW, align: 'right', characterSpacing: 2, lineBreak: false });
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(26)
      .text(data.monthLabel, MX, 50, { width: CW, align: 'right', lineBreak: false });
    doc.y = 132;
  } else {
    doc.rect(0, 0, PAGE_W, 30).fill(C.green);
    doc.rect(0, 30, PAGE_W, 3).fill(C.mid);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
      .text('RCH ELITE TRAINING', MX, 11, { lineBreak: false, characterSpacing: 1 });
    doc.fillColor('#b9e4c8').font('Helvetica').fontSize(9)
      .text('Monthly Report - ' + data.monthLabel, MX, 11, { width: CW, align: 'right', lineBreak: false });
    doc.y = 48;
  }
  doc.fillColor(C.ink).font('Helvetica').fontSize(10);
}

function section(doc, title) {
  ensure(doc, 70);
  const y = doc.y + 8;
  doc.roundedRect(MX, y, CW, 22, 4).fill(C.green);
  doc.rect(MX, y, 5, 22).fill(C.mid);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(title, MX + 14, y + 6, { width: CW - 24, lineBreak: false });
  doc.y = y + 30;
  doc.fillColor(C.ink).font('Helvetica').fontSize(10);
}

// rows: [{ label, value, bold }]
function kvRows(doc, rows) {
  rows.forEach((r, i) => {
    ensure(doc, 20);
    const y = doc.y;
    if (i % 2 === 0) doc.rect(MX, y, CW, 19).fill(C.zebra);
    doc.fillColor(C.ink).font(r.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10)
      .text(String(r.label), MX + 8, y + 5, { width: CW * 0.62, lineBreak: false });
    doc.text(String(r.value), MX + CW * 0.55, y + 5, { width: CW * 0.45 - 8, align: 'right', lineBreak: false });
    doc.y = y + 19;
  });
  doc.font('Helvetica').fillColor(C.ink);
}

// cols: [{ label, w, align }], rows: arrays of strings
function dataTable(doc, cols, rows, boldLast) {
  const drawHead = () => {
    const y = doc.y;
    doc.rect(MX, y, CW, 20).fill(C.light);
    let x = MX;
    cols.forEach((c) => {
      doc.fillColor(C.dark).font('Helvetica-Bold').fontSize(9).text(c.label, x + 6, y + 6, { width: c.w - 12, align: c.align || 'left', lineBreak: false });
      x += c.w;
    });
    doc.y = y + 20;
  };
  ensure(doc, 44);
  drawHead();
  rows.forEach((r, i) => {
    if (doc.y + 20 > PAGE_H - BOTTOM) { doc.addPage(); drawHead(); }
    const y = doc.y;
    const last = boldLast && i === rows.length - 1;
    if (last) doc.rect(MX, y, CW, 20).fill(C.light); else if (i % 2 === 1) doc.rect(MX, y, CW, 20).fill(C.zebra);
    let x = MX;
    cols.forEach((c, k) => {
      doc.fillColor(C.ink).font(last ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).text(String(r[k]), x + 6, y + 6, { width: c.w - 12, align: c.align || 'left', lineBreak: false });
      x += c.w;
    });
    doc.y = y + 20;
  });
  doc.font('Helvetica').fillColor(C.ink);
}

function statCards(doc, cards) {
  ensure(doc, 80);
  const gap = 12, w = (CW - gap * (cards.length - 1)) / cards.length, y = doc.y;
  cards.forEach((c, i) => {
    const x = MX + i * (w + gap);
    doc.roundedRect(x, y, w, 62, 6).fill(c.hero ? C.green : C.light);
    doc.fillColor(c.hero ? '#b9e4c8' : C.muted).font('Helvetica-Bold').fontSize(8)
      .text(c.label.toUpperCase(), x + 12, y + 12, { width: w - 24, lineBreak: false, characterSpacing: 0.8 });
    doc.fillColor(c.hero ? '#ffffff' : C.dark).font('Helvetica-Bold').fontSize(20)
      .text(c.value, x + 12, y + 30, { width: w - 24, lineBreak: false });
  });
  doc.y = y + 74;
  doc.font('Helvetica').fillColor(C.ink).fontSize(10);
}

function buildMonthlyReportPdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'LETTER', bufferPages: true });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.on('pageAdded', () => drawBand(doc, data, false));

      drawBand(doc, data, true);

      const totalPlayers = GRADES.reduce((s, g) => s + data.overviewByGrade[g].totalPlayers, 0);
      statCards(doc, [
        { label: 'Players', value: String(totalPlayers) },
        { label: 'Gross revenue', value: money(data.revenueTotals.total) },
        { label: 'Final net revenue', value: money(data.finalNetRevenueCents), hero: true },
      ]);
      doc.fillColor(C.muted).font('Helvetica-Oblique').fontSize(8)
        .text('Potential RCH/Sultans and Coaches are a live snapshot from when this report was made, not a record of this exact month.', MX, doc.y, { width: CW });
      doc.fillColor(C.ink).font('Helvetica').fontSize(10);
      doc.moveDown(0.4);

      // --- Dashboard Summary ---
      section(doc, 'Dashboard Summary');
      const dash = [
        { label: 'Potential RCH', value: data.potentialRchCount },
        { label: 'Potential Sultans', value: data.potentialSultansCount },
        { label: 'Skills Training (RCH players on roster)', value: data.skillsTrainingCount },
      ];
      GRADES.forEach((g) => dash.push({ label: 'Join FC ' + GRADE_LABELS[g], value: data.joinCountsByGrade[g] }));
      kvRows(doc, dash);

      // --- Season Overview ---
      section(doc, 'Season Overview - All Grades');
      const ov = GRADES.map((g) => {
        const o = data.overviewByGrade[g];
        return [GRADE_LABELS[g], String(o.totalPlayers), String(o.totalOne), String(o.totalTwo), String(o.totalOnline)];
      });
      ov.push(['TOTAL', String(totalPlayers),
        String(GRADES.reduce((s, g) => s + data.overviewByGrade[g].totalOne, 0)),
        String(GRADES.reduce((s, g) => s + data.overviewByGrade[g].totalTwo, 0)),
        String(GRADES.reduce((s, g) => s + data.overviewByGrade[g].totalOnline, 0))]);
      dataTable(doc, [
        { label: 'Grade', w: 172 }, { label: 'Players', w: 90, align: 'right' }, { label: 'One / week', w: 90, align: 'right' },
        { label: 'Two / week', w: 90, align: 'right' }, { label: 'Online', w: 90, align: 'right' },
      ], ov, true);

      // --- Final Net Revenue ---
      section(doc, 'Final Net Revenue');
      const used = GRADES.map((g) => data.revenueByGrade.find((x) => x.grade === g)).filter((r) => r && (r.total !== 0 || r.revOne || r.revTwo || r.revOnline || r.disc || r.prorationCents));
      const T = data.revenueTotals;
      const planTotal = T.revOne + T.revTwo + T.revOnline;
      if (used.length) {
        doc.fillColor(C.green).font('Helvetica-Bold').fontSize(9).text('Revenue by plan, minus discounts, minus late-joiner proration (partial first month)', MX + 8, doc.y, { width: CW - 16 });
        doc.moveDown(0.2);
        const a = used.map((r) => [r.label, money(r.revOne), money(r.revTwo), money(r.revOnline), '-' + money(r.disc), '-' + money(r.prorationCents), money(r.total)]);
        a.push(['Total', money(T.revOne), money(T.revTwo), money(T.revOnline), '-' + money(T.disc), '-' + money(T.prorationCents), money(T.total)]);
        dataTable(doc, [
          { label: 'Grade', w: 100 }, { label: 'One', w: 72, align: 'right' }, { label: 'Two', w: 76, align: 'right' }, { label: 'Online', w: 66, align: 'right' },
          { label: 'Discounts', w: 74, align: 'right' }, { label: 'Late joiners', w: 74, align: 'right' }, { label: 'Gross', w: 70, align: 'right' },
        ], a, true);
        doc.moveDown(0.6);
        doc.fillColor(C.green).font('Helvetica-Bold').fontSize(9).text('Stripe fees and net, by grade', MX + 8, doc.y, { width: CW - 16 });
        doc.moveDown(0.2);
        const b = used.map((r) => [r.label, money(r.total), '-' + money(r.fee), money(r.net)]);
        b.push(['Total', money(T.total), '-' + money(T.fee), money(T.net)]);
        dataTable(doc, [
          { label: 'Grade', w: 172 }, { label: 'Gross', w: 120, align: 'right' }, { label: 'Stripe fees', w: 120, align: 'right' }, { label: 'Net', w: 120, align: 'right' },
        ], b, true);
      }
      doc.moveDown(0.5);
      kvRows(doc, [
        { label: 'Plans (everyone on the roster at full price)', value: money(planTotal) },
        { label: 'Discounts', value: '-' + money(T.disc) },
        { label: 'Late-joiner proration (' + (T.lateJoiners || 0) + ' players, partial first month)', value: '-' + money(T.prorationCents) },
        { label: 'Gross revenue', value: money(T.total), bold: true },
        { label: 'Est. Stripe fees', value: '-' + money(T.fee) },
        { label: 'Business charges this month', value: '-' + money(data.businessChargesCents) },
        { label: 'FINAL NET REVENUE', value: money(data.finalNetRevenueCents), bold: true },
      ]);

      // --- First-month payments (prorated) ---
      section(doc, 'New Families - Prorated First Month & Kit Fees');
      const lp = data.linkPayments || [];
      if (!lp.length) {
        doc.fillColor(C.muted).text('No first payments this month.', MX + 8, doc.y, { width: CW - 16 });
        doc.fillColor(C.ink).moveDown(0.3);
      } else {
        const rows = lp.map((p) => {
          const kit = p.one_time_amount_cents || 0;
          const pr = p.prorated_amount_cents || 0;
          const d = new Date(p.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Chicago' });
          return [p.child_name, d, money(kit), money(pr), money(kit + pr)];
        });
        const kitTotal = lp.reduce((a, p) => a + (p.one_time_amount_cents || 0), 0);
        const prTotal = lp.reduce((a, p) => a + (p.prorated_amount_cents || 0), 0);
        rows.push(['Total', '', money(kitTotal), money(prTotal), money(kitTotal + prTotal)]);
        dataTable(doc, [
          { label: 'Child', w: 172 }, { label: 'Paid on', w: 80 }, { label: 'Kit fee(s)', w: 90, align: 'right' },
          { label: 'Prorated month', w: 100, align: 'right' }, { label: 'Total', w: 90, align: 'right' },
        ], rows, true);
      }
      if ((data.lateJoiners || []).length) {
        doc.moveDown(0.4);
        doc.fillColor(C.green).font('Helvetica-Bold').text('Late joiners counted at a partial month in the revenue above', MX + 8, doc.y, { width: CW - 16 });
        doc.moveDown(0.2);
        kvRows(doc, data.lateJoiners.map((d) => ({ label: d.name + ' (link sent on the ' + d.linkDay + ')', value: money(d.prorated) + ' of ' + money(d.full) })));
      }

      // --- One-Time Payments ---
      section(doc, 'One-Time Payments Completed in ' + data.monthLabel);
      if (!data.oneTimePayments.length) {
        doc.fillColor(C.muted).text('None this month.', MX + 8, doc.y, { width: CW - 16 });
        doc.fillColor(C.ink).moveDown(0.3);
      } else {
        const rows = data.oneTimePayments.map((p) => [
          p.title, p.recipient_name ? p.recipient_name : 'Ad hoc link', money(p.amount_cents)]);
        const oneTimeTotal = data.oneTimePayments.reduce((s, p) => s + p.amount_cents, 0);
        rows.push(['Total', '', money(oneTimeTotal)]);
        dataTable(doc, [{ label: 'Payment', w: 232 }, { label: 'From', w: 190 }, { label: 'Amount', w: 110, align: 'right' }], rows, true);
      }

      // --- Business Charges ---
      section(doc, 'Business Charges - Recurring & One-Time');
      const recurring = data.businessCharges.filter((c) => c.kind === 'recurring');
      const oneTime = data.businessCharges.filter((c) => c.kind === 'one_time');
      doc.fillColor(C.green).font('Helvetica-Bold').text('Recurring', MX + 8, doc.y, { width: CW - 16 });
      doc.moveDown(0.2);
      if (!recurring.length) { doc.fillColor(C.muted).font('Helvetica').text('None logged.', MX + 8, doc.y, { width: CW - 16 }); doc.moveDown(0.3); }
      else kvRows(doc, recurring.map((c) => ({ label: c.description, value: money(c.amount_cents) })));
      doc.moveDown(0.4);
      doc.fillColor(C.green).font('Helvetica-Bold').text('One-time (this month)', MX + 8, doc.y, { width: CW - 16 });
      doc.moveDown(0.2);
      if (!oneTime.length) { doc.fillColor(C.muted).font('Helvetica').text('None logged for this month.', MX + 8, doc.y, { width: CW - 16 }); doc.moveDown(0.3); }
      else kvRows(doc, oneTime.map((c) => ({ label: c.description, value: money(c.amount_cents) })));
      doc.fillColor(C.ink).font('Helvetica');

      // --- Coaches --- (category + name only, no contact info)
      section(doc, 'Current Coaches');
      if (!data.coaches.length) {
        doc.fillColor(C.muted).text('None on file.', MX + 8, doc.y, { width: CW - 16 });
      } else {
        const rows = [];
        COACH_ROLES.forEach((role) => {
          const inRole = data.coaches.filter((c) => (c.role || 'coach') === role);
          inRole.forEach((c) => rows.push([COACH_ROLE_LABELS[role], c.name]));
        });
        dataTable(doc, [{ label: 'Role', w: 200 }, { label: 'Name', w: 332 }], rows, false);
      }

      // Footer on every page.
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        doc.page.margins.bottom = 0;
        doc.rect(0, PAGE_H - 34, PAGE_W, 34).fill(C.green);
        doc.fillColor('#b9e4c8').font('Helvetica').fontSize(8)
          .text('RCH Elite Training  |  Allen, TX', MX, PAGE_H - 21, { lineBreak: false });
        doc.text('Page ' + (i + 1) + ' of ' + range.count, MX, PAGE_H - 21, { width: CW, align: 'right', lineBreak: false });
      }
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { gatherMonthlyReportData, buildMonthlyReportPdf, monthKeyFromDate, monthLabelFromKey };
