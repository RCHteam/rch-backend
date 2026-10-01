const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { getSetting } = require('./settings');

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
  const roster = playersRes.rows;

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
  try {
    const snapshot = await generateSnapshot(lastMonth);
    console.log(`Month-end snapshot generated for ${snapshot.month}.`);
    return snapshot;
  } catch (err) {
    console.error('Month-end snapshot error:', err);
    return null;
  }
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
              p.session_type, p.rch, p.sultans, p.discount_cents,
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

module.exports = { router, runMonthEndCheckIfDue, generateSnapshot };
