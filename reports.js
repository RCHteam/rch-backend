const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { getSetting, setSetting } = require('./settings');
const { effectiveDiscountCents, getMonthlyRates } = require('./discounts');
const { gatherMonthlyReportData, buildMonthlyReportPdf, monthKeyFromDate, monthLabelFromKey } = require('./monthlyReport');
const { sendMonthlyReportEmail } = require('./email');

const router = express.Router();

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

// First-of-month DATE string (YYYY-MM-01) for whatever month `d` falls in.
function monthKey(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

/* ------------------------------------------------------------------------
 * Builds and stores a snapshot of the roster + estimated revenue/charges/net
 * for a given month (an UPSERT — running it twice for the same month just
 * refreshes it, so re-running by hand is always safe). Revenue is estimated
 * from each active player's current monthly rate (the same rates used to
 * actually charge new Stripe payment links) minus their roster discount —
 * it is a projection from the live roster, not a reconciliation against
 * actual settled Stripe transactions (which this app doesn't independently
 * track month to month; Stripe's own dashboard is the source of truth for
 * money that has actually landed).
 * ---------------------------------------------------------------------- */
async function generateSnapshot(monthDate) {
  const month = monthKey(monthDate);

  const [oneCents, twoCents, onlineCents] = await Promise.all([
    getSetting('payment_one_session_monthly_cents', '6000'),
    getSetting('payment_two_session_monthly_cents', '10000'),
    getSetting('payment_online_course_monthly_cents', '3120'),
  ]);
  const rates = { one: parseInt(oneCents, 10), two: parseInt(twoCents, 10), online: parseInt(onlineCents, 10) };

  const playersRes = await pool.query('SELECT * FROM players WHERE archived_at IS NULL ORDER BY grade, player_name');
  const roster = playersRes.rows.map((p) => ({ ...p, discount_cents: effectiveDiscountCents(p, rates) }));

  let totalRevenueCents = 0;
  for (const p of roster) {
    const rate = rates[p.session_type] ?? rates.one;
    totalRevenueCents += Math.max(0, rate - (p.discount_cents || 0));
  }

  const chargesRes = await pool.query(
    `SELECT * FROM charges WHERE kind = 'recurring' OR charge_month = $1::date`,
    [month]
  );
  const totalChargesCents = chargesRes.rows.reduce((sum, c) => sum + c.amount_cents, 0);

  const netCents = totalRevenueCents - totalChargesCents;

  const result = await pool.query(
    `INSERT INTO monthly_snapshots (month, roster_json, total_revenue_cents, total_charges_cents, net_cents)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (month) DO UPDATE SET
       roster_json = EXCLUDED.roster_json,
       total_revenue_cents = EXCLUDED.total_revenue_cents,
       total_charges_cents = EXCLUDED.total_charges_cents,
       net_cents = EXCLUDED.net_cents
     RETURNING *`,
    [month, JSON.stringify(roster), totalRevenueCents, totalChargesCents, netCents]
  );
  return result.rows[0];
}

// Called once a day from server.js — generates a snapshot for the month that
// JUST ENDED, the first time it notices the calendar has rolled into a new
// month (i.e. it's the 1st). Safe to call more than once on the 1st, or to
// miss a day (e.g. a redeploy) — it'll catch up the next time it runs, since
// it always targets "last month" relative to whenever it happens to run,
// and generateSnapshot() is itself an upsert.
async function runMonthEndCheckIfDue() {
  const now = new Date();
  if (now.getUTCDate() !== 1) return null;
  const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

  let snapshot = null;
  try {
    snapshot = await generateSnapshot(lastMonth);
    console.log(`Month-end snapshot generated for ${snapshot.month}.`);
  } catch (err) {
    console.error('Month-end snapshot error:', err);
  }

  try {
    await sendMonthlyReportIfNotAlreadySent(monthKeyFromDate(lastMonth));
  } catch (err) {
    console.error('Month-end report email error:', err);
  }

  return snapshot;
}

// Guarded by a settings flag so a redeploy (which re-runs this check) or a
// second daily tick on the 1st doesn't email the same month's report twice.
async function sendMonthlyReportIfNotAlreadySent(monthKey) {
  const alreadySentFor = await getSetting('monthly_report_sent_for', '');
  if (alreadySentFor === monthKey) return { skipped: true, reason: 'already sent' };
  const data = await gatherMonthlyReportData(monthKey);
  const pdfBuffer = await buildMonthlyReportPdf(data);
  const filename = `RCH-Monthly-Report-${monthKey.slice(0, 7)}.pdf`;
  const result = await sendMonthlyReportEmail({ monthLabel: data.monthLabel, pdfBuffer, filename });
  if (result.ok !== false) {
    await setSetting('monthly_report_sent_for', monthKey);
  }
  return result;
}

// Admin: list all snapshots (the "Data" section's monthly history), newest first.
router.get('/admin/monthly-snapshots', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, month, total_revenue_cents, total_charges_cents, net_cents, created_at
       FROM monthly_snapshots ORDER BY month DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List monthly snapshots error:', err);
    res.status(500).json({ error: 'Could not load monthly snapshots.' });
  }
});

// Admin: generate (or refresh) the CURRENT month's snapshot on demand — lets
// you check where things stand mid-month, and is also what a "Generate this
// month's snapshot now" button in the Data section calls.
router.post('/admin/monthly-snapshots/generate', requireAdmin, async (req, res) => {
  try {
    const { month } = req.body || {};
    const target = month && /^\d{4}-\d{2}-\d{2}$/.test(month)
      ? new Date(`${month}T00:00:00Z`)
      : new Date();
    const snapshot = await generateSnapshot(target);
    res.json({ ok: true, entry: snapshot });
  } catch (err) {
    console.error('Generate snapshot error:', err);
    res.status(500).json({ error: 'Could not generate this snapshot.' });
  }
});

// Admin: download a given month's snapshot as CSV (roster rows, plus a
// trailing summary row with revenue/charges/net).
router.get('/admin/monthly-snapshots/:month/csv', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM monthly_snapshots WHERE month = $1::date', [req.params.month]);
    const snap = result.rows[0];
    if (!snap) return res.status(404).json({ error: 'No snapshot found for that month.' });

    const rows = snap.roster_json.map((p) => ({
      grade: p.grade, player_name: p.player_name, session_type: p.session_type,
      rch: p.rch, sultans: p.sultans, discount_cents: p.discount_cents,
      parent_name: p.parent_name, parent_email: p.parent_email, parent_phone: p.parent_phone,
    }));
    let csv = toCsv(rows);
    csv += `\n\nTotal Revenue,${(snap.total_revenue_cents / 100).toFixed(2)}`;
    csv += `\nTotal Charges,${(snap.total_charges_cents / 100).toFixed(2)}`;
    csv += `\nNet,${(snap.net_cents / 100).toFixed(2)}`;

    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', `attachment; filename="roster-revenue-${snap.month}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Snapshot CSV export error:', err);
    res.status(500).json({ error: 'Could not export this snapshot.' });
  }
});

// Admin: roster CSV export (current, live roster — not a stored snapshot).
// Includes each player's latest payment status (same left-join the roster
// table itself uses) so the CSV doubles as a who's-paid audit, not just a
// contact list.
router.get('/admin/export/roster.csv', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.grade, p.player_name, p.dob, p.parent_name, p.parent_phone, p.parent_email,
              p.session_type, p.rch, p.sultans, p.discount_cents, p.sibling_discount,
              pl.status AS payment_status, pl.last_payment_status, pl.paused_until
       FROM players p
       LEFT JOIN LATERAL (
         SELECT status, last_payment_status, paused_until
         FROM payment_links
         WHERE registration_type = 'player' AND registration_id = p.id
         ORDER BY created_at DESC
         LIMIT 1
       ) pl ON true
       WHERE p.archived_at IS NULL
       ORDER BY p.grade, p.player_name`
    );
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', 'attachment; filename="players-roster.csv"');
    res.send(toCsv(result.rows));
  } catch (err) {
    console.error('Roster CSV export error:', err);
    res.status(500).json({ error: 'Could not export the roster.' });
  }
});

// Admin: download the monthly report PDF, generated live from current data.
// `month` is 'YYYY-MM-01', or the literal string "current" for this month.
// Note: "Potential RCH/Sultans" and "Coaches" are live counts, not a
// historical record, so this is most accurate for the current/just-ended
// month — see monthlyReport.js for details.
router.get('/admin/monthly-report/:month/pdf', requireAdmin, async (req, res) => {
  try {
    const monthKey = req.params.month === 'current' ? monthKeyFromDate(new Date()) : req.params.month;
    if (!/^\d{4}-\d{2}-01$/.test(monthKey)) {
      return res.status(400).json({ error: 'Month must be formatted YYYY-MM-01, or "current".' });
    }
    const data = await gatherMonthlyReportData(monthKey);
    const pdfBuffer = await buildMonthlyReportPdf(data);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="RCH-Monthly-Report-${monthKey.slice(0, 7)}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Monthly report PDF error:', err);
    res.status(500).json({ error: 'Could not generate this report.' });
  }
});

// Admin: manually (re)send the monthly report email right now. Bypasses the
// "already sent" guard the automatic month-end send uses, so this also
// works as a resend button. Defaults to the current month if none given.
router.post('/admin/monthly-report/send', requireAdmin, async (req, res) => {
  try {
    const monthKey = (req.body && req.body.month) || monthKeyFromDate(new Date());
    if (!/^\d{4}-\d{2}-01$/.test(monthKey)) {
      return res.status(400).json({ error: 'Month must be formatted YYYY-MM-01.' });
    }
    const data = await gatherMonthlyReportData(monthKey);
    const pdfBuffer = await buildMonthlyReportPdf(data);
    const filename = `RCH-Monthly-Report-${monthKey.slice(0, 7)}.pdf`;
    const result = await sendMonthlyReportEmail({ monthLabel: data.monthLabel, pdfBuffer, filename });
    if (result.skipped) {
      return res.status(500).json({ error: 'Email not sent — CLUB_NOTIFY_EMAIL is not configured on the server.' });
    }
    if (result.ok === false) {
      return res.status(500).json({ error: 'Could not send the report email. Please try again.' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Monthly report send error:', err);
    res.status(500).json({ error: 'Could not generate or send this report.' });
  }
});

module.exports = { router, runMonthEndCheckIfDue, generateSnapshot };
