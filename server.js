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
const { router: agreementsRoutes, assetPath } = require('./agreements');
const signPageHtml = fs.readFileSync(path.join(__dirname, 'signPage.html'), 'utf8');
const { router: reportsRoutes, runMonthEndCheckIfDue } = require('./reports');

const app = express();

// Render sits behind a proxy; trusting it lets the rate limiter see each
// visitor's real IP (and removes the X-Forwarded-For warning in the logs).
app.set('trust proxy', 1);

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
app.use('/api', agreementsRoutes);

// Admin dashboard — served directly from a JS string, no static folder needed
app.get('/admin', (req, res) => {
  res.type('html').send(adminPageHtml);
});

// Installable-app (PWA) files for the admin dashboard: manifest, icons and a
// minimal service worker. The worker deliberately caches nothing — the admin
// always loads live data and the newest uploaded code.
app.get('/manifest.webmanifest', (req, res) => {
  res.type('application/manifest+json').set('Cache-Control', 'public, max-age=3600').json({
    name: 'RCH Admin',
    short_name: 'RCH Admin',
    description: 'RCH Elite Training admin dashboard',
    start_url: '/admin',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#0c2a1c',
    theme_color: '#0c2a1c',
    icons: [
      { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/assets/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  });
});
app.get('/sw.js', (req, res) => {
  res.type('application/javascript').set('Cache-Control', 'no-cache').send(
    "self.addEventListener('install',function(){self.skipWaiting();});" +
    "self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});" +
    "self.addEventListener('fetch',function(){});"
  );
});
['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'].forEach((f) => {
  app.get('/assets/' + f, (req, res) => {
    res.set('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(__dirname, 'assets', f));
  });
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
  res.set('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'assets', 'logo.png'));
});

// E-sign page a family lands on from the emailed agreement link
app.get('/sign/:token', (req, res) => {
  res.type('html').send(signPageHtml);
});
app.get('/assets/agreement-rch.png', (req, res) => {
  res.set('Cache-Control', 'public, max-age=86400');
  res.sendFile(assetPath('agreement-rch.png'));
});
app.get('/assets/agreement-sultans.png', (req, res) => {
  res.set('Cache-Control', 'public, max-age=86400');
  res.sendFile(assetPath('agreement-sultans.png'));
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
