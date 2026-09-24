const express = require('express');
const crypto = require('crypto');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { sendPaymentLinkEmail } = require('./email');

const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const Stripe = require('stripe');
  // Pinned explicitly (rather than relying on the account's dashboard-configured
  // default) because billing_cycle_anchor_config below requires 2026-06-24.dahlia
  // or later.
  return new Stripe(key, { apiVersion: '2026-08-26.dahlia' });
}

function siteUrl(req) {
  // Build the payment link from the request itself, so no extra env var is
  // needed — it just points back at whatever domain this backend is running on.
  return `${req.protocol}://${req.get('host')}`;
}

// Admin: after you've approved a family, generate their unique payment link
// and email it to them immediately.
router.post('/admin/payment-links', requireAdmin, async (req, res) => {
  const { registrationType, registrationId, seasonEndDate, tierLabel } = req.body || {};
  const oneTimeAmount = Number(req.body?.oneTimeAmount) || 5000; // cents — $50 kit fee default
  const monthlyAmount = Number(req.body?.monthlyAmount) || 6210; // cents — $62.10/mo (1x/week) default

  if (!['skills', 'join'].includes(registrationType)) {
    return res.status(400).json({ error: 'registrationType must be "skills" or "join".' });
  }
  if (!registrationId) return res.status(400).json({ error: 'registrationId is required.' });
  if (!seasonEndDate || !/^\d{4}-\d{2}-\d{2}$/.test(seasonEndDate)) {
    return res.status(400).json({ error: 'seasonEndDate is required, format YYYY-MM-DD.' });
  }

  try {
    let childName, parentName, email, programLabel;

    if (registrationType === 'skills') {
      const r = await pool.query('SELECT * FROM skills_registrations WHERE id = $1', [registrationId]);
      if (!r.rows[0]) return res.status(404).json({ error: 'Registration not found.' });
      childName = r.rows[0].full_name;
      parentName = r.rows[0].full_name;
      email = r.rows[0].email;
      programLabel = 'Skills Training';
    } else {
      const r = await pool.query('SELECT * FROM join_registrations WHERE id = $1', [registrationId]);
      if (!r.rows[0]) return res.status(404).json({ error: 'Registration not found.' });
      childName = r.rows[0].child_name;
      parentName = r.rows[0].parent_name;
      email = r.rows[0].email;
      programLabel = `Sultans FC — ${r.rows[0].age_group}`;
    }

    if (tierLabel) programLabel = `${programLabel} (${tierLabel})`;

    const token = crypto.randomBytes(24).toString('hex');

    const insertRes = await pool.query(
      `INSERT INTO payment_links
        (token, registration_type, registration_id, child_name, parent_name, email, program_label,
         one_time_amount_cents, monthly_amount_cents, season_end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [token, registrationType, registrationId, childName, parentName, email, programLabel,
       oneTimeAmount, monthlyAmount, seasonEndDate]
    );

    const link = `${siteUrl(req)}/pay/${token}`;

    await sendPaymentLinkEmail({
      to: email, parentName, childName, programLabel, link,
      oneTime: oneTimeAmount, monthly: monthlyAmount, seasonEndDate,
    });

    res.json({ ok: true, token, link, entry: insertRes.rows[0] });
  } catch (err) {
    console.error('Create payment link error:', err);
    res.status(500).json({ error: 'Could not create payment link.' });
  }
});

// Public: the /pay/:token page calls this to display the right family + amounts.
router.get('/pay/:token', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM payment_links WHERE token = $1', [req.params.token]);
    const entry = r.rows[0];
    if (!entry) return res.status(404).json({ error: 'This payment link is invalid.' });
    res.json({
      childName: entry.child_name,
      parentName: entry.parent_name,
      programLabel: entry.program_label,
      oneTimeAmount: entry.one_time_amount_cents,
      monthlyAmount: entry.monthly_amount_cents,
      seasonEndDate: entry.season_end_date,
      status: entry.status,
    });
  } catch (err) {
    console.error('Lookup payment link error:', err);
    res.status(500).json({ error: 'Could not load this payment link.' });
  }
});

// Public: starts a Stripe Checkout session — one-time kit/registration fee
// plus a recurring monthly fee that auto-stops at season end.
router.post('/pay/:token/checkout', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ error: 'Payments are not configured yet. Please contact RCH Elite Training.' });

  try {
    const r = await pool.query('SELECT * FROM payment_links WHERE token = $1', [req.params.token]);
    const entry = r.rows[0];
    if (!entry) return res.status(404).json({ error: 'This payment link is invalid.' });
    if (entry.status !== 'pending') {
      return res.status(409).json({ error: 'This payment link has already been used.' });
    }

    const base = siteUrl(req);

    // NOTE: Stripe's Checkout Session API does not accept subscription_data.cancel_at
    // at session-creation time (it's a Subscription-only field, not a Checkout Session
    // field) — setting it here fails with a "parameter_unknown" error. Instead, the
    // subscription's cancel_at is set right after checkout completes, in the
    // checkout.session.completed webhook handler below.
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: entry.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${entry.program_label} — Registration & Kit Fee` },
            unit_amount: entry.one_time_amount_cents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${entry.program_label} — Monthly Season Fee` },
            unit_amount: entry.monthly_amount_cents,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        // All families are billed on the same day of the month regardless of
        // when they actually check out — Stripe prorates the first invoice
        // for the partial period up to that date, then bills in full from
        // then on.
        billing_cycle_anchor_config: { day_of_month: 3 },
      },
      success_url: `${base}/pay/${entry.token}/success`,
      cancel_url: `${base}/pay/${entry.token}`,
      metadata: { payment_link_token: entry.token },
    });

    await pool.query('UPDATE payment_links SET stripe_checkout_session_id = $1 WHERE token = $2', [session.id, entry.token]);

    res.json({ url: session.url });
  } catch (err) {
    console.error('Create checkout session error:', err);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

// Stripe webhook — mounted in server.js BEFORE express.json(), since Stripe
// requires the raw request body to verify the signature.
async function handleStripeWebhook(req, res) {
  const stripe = getStripe();
  if (!stripe) return res.status(500).send('Stripe not configured.');

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const token = session.metadata && session.metadata.payment_link_token;
      if (token) {
        await pool.query(
          `UPDATE payment_links
           SET status = 'completed', completed_at = now(),
               stripe_customer_id = $1, stripe_subscription_id = $2
           WHERE token = $3`,
          [session.customer, session.subscription, token]
        );

        // Now that the subscription actually exists, set it to auto-cancel at
        // the season end date (this can't be done at Checkout Session creation
        // time — see the note in the /pay/:token/checkout route above).
        if (session.subscription) {
          const r = await pool.query('SELECT season_end_date FROM payment_links WHERE token = $1', [token]);
          const seasonEndDate = r.rows[0] && r.rows[0].season_end_date;
          if (seasonEndDate) {
            const cancelAt = Math.floor(new Date(seasonEndDate).getTime() / 1000 + 23 * 3600 + 59 * 60 + 59);
            try {
              await stripe.subscriptions.update(session.subscription, { cancel_at: cancelAt });
            } catch (cancelErr) {
              console.error('Failed to set subscription cancel_at:', cancelErr.message);
            }
          }
        }
      }
    }
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      await pool.query(
        `UPDATE payment_links SET status = 'canceled' WHERE stripe_subscription_id = $1`,
        [sub.id]
      );
    }

    // Tracks the health of each MONTHLY charge after the initial checkout —
    // lets /admin flag a family whose card got declined on a later month,
    // instead of showing "Paid" forever after the very first successful charge.
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await pool.query(
          `UPDATE payment_links SET last_payment_status = 'failed', last_payment_at = now()
           WHERE stripe_subscription_id = $1`,
          [invoice.subscription]
        );
      }
    }
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await pool.query(
          `UPDATE payment_links SET last_payment_status = 'succeeded', last_payment_at = now()
           WHERE stripe_subscription_id = $1`,
          [invoice.subscription]
        );
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handling error:', err);
    res.status(500).send('Webhook handler error.');
  }
}

module.exports = { router, handleStripeWebhook };
