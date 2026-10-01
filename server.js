require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const pool = require('./pool');
const adminPageHtml = require('./adminPage');

const registerRoutes = require('./register');
const joinRoutes = require('./join');
const adminRoutes = require('./admin');
const { router: paymentRoutes, handleStripeWebhook } = require('./payments');
const paymentPageHtml = require('./paymentPage');
const oneTimePaymentPageHtml = require('./oneTimePaymentPage');
const playersRoutes = require('./players');
const chargesRoutes = require('./charges');
const coachesRoutes = require('./coaches');
const { router: reportsRoutes, runMonthEndCheckIfDue } = require('./reports');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS: ' + origin));
  },
}));

// Stripe requires the raw, unparsed request body to verify webhook
// signatures — this MUST be mounted before express.json() below.
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());

const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/register', formLimiter);
app.use('/api/join', formLimiter);

app.use('/api', registerRoutes);
app.use('/api', joinRoutes);
app.use('/api', adminRoutes);
app.use('/api', paymentRoutes);
app.use('/api', playersRoutes);
app.use('/api', chargesRoutes);
app.use('/api', coachesRoutes);
app.use('/api', reportsRoutes);

// Admin dashboard — served directly from a JS string, no static folder needed
app.get('/admin', (req, res) => {
  res.type('html').send(adminPageHtml);
});

// Payment page a family lands on after you send their unique link
app.get('/pay/:token', (req, res) => {
  res.type('html').send(paymentPageHtml);
});
app.get('/pay/:token/success', (req, res) => {
  res.type('html').send(paymentPageHtml);
});

// Stand-alone one-time payment page (Finances tab) — separate from the
// registration/proration flow above, so it's mounted on its own path.
app.get('/pay/one-time/:token', (req, res) => {
  res.type('html').send(oneTimePaymentPageHtml);
});
app.get('/pay/one-time/:token/success', (req, res) => {
  res.type('html').send(oneTimePaymentPageHtml);
});

// Logo, served as a real file (not a data: URI) — email clients like Gmail
// don't reliably render inline base64 images, only hosted image URLs.
app.get('/assets/logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'logo.png'));
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

async function ensureSchema() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('✅ Database schema is ready.');
}

ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`RCH Elite Training API running on port ${PORT}`);
    });
    // Checks once a day whether a month just ended, and if so archives a
    // roster + revenue/charges/net snapshot for it (see reports.js). Also
    // runs once immediately on boot, in case the server happened to be
    // asleep/redeploying right at midnight on the 1st.
    runMonthEndCheckIfDue();
    setInterval(runMonthEndCheckIfDue, 24 * 60 * 60 * 1000);
  })
  .catch((err) => {
    console.error('❌ Failed to set up the database schema:', err);
    process.exit(1);
  });
