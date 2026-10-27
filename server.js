require('dotenv').config();
const express = require('express');
const { seedCurricula } = require('./curriculumSeed');
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
const sultansRoutes = require('./sultans');
const siteImagesRoutes = require('./siteImages');
const chargesRoutes = require('./charges');
const coachesRoutes = require('./coaches');
const coachAuthRoutes = require('./coachAuth');
const { router: agreementsRoutes, assetPath } = require('./agreements');
const signPageHtml = fs.readFileSync(path.join(__dirname, 'signPage.html'), 'utf8');
const { router: reportsRoutes, runMonthEndCheckIfDue } = require('./reports');
const outreachRoutes = require('./outreach');
const reviewPageHtml = require('./reviewPage');
const coachToolsRoutes = require('./coachTools');
const siteContentRoutes = require('./siteContent');

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

// Shop/Camp images are uploaded as (resized) data URLs, so allow a larger body.
app.use(express.json({ limit: '6mb' }));

// coach.<domain> is for coaches only, admin.<domain> for admins only. Each address refuses the
// other kind of login on the server too, not just on the page.
function loginHostMode(req) {
  const host = String(req.hostname || '').toLowerCase();
  if (host.startsWith('coach.')) return 'coach';
  if (host.startsWith('admin.')) return 'admin';
  return null;
}
app.use((req, res, next) => {
  const mode = loginHostMode(req);
  if (mode === 'coach' && req.path === '/api/admin/login') {
    return res.status(403).json({ ok: false, error: 'Admin login is not available on this address.' });
  }
  if (mode === 'admin' && req.path === '/api/coach/login') {
    return res.status(403).json({ ok: false, error: 'Coach login is not available on this address.' });
  }
  next();
});

const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/register', formLimiter);
app.use('/api/join', formLimiter);
app.use('/api/outreach', formLimiter);

app.use('/api', registerRoutes);
app.use('/api', joinRoutes);
app.use('/api', adminRoutes);
app.use('/api', paymentRoutes);
app.use('/api', playersRoutes);
app.use('/api', sultansRoutes);
app.use('/api', siteImagesRoutes);
app.use('/api', chargesRoutes);
app.use('/api', coachesRoutes);
app.use('/api', coachAuthRoutes);
app.use('/api', reportsRoutes);
app.use('/api', agreementsRoutes);
app.use('/api', outreachRoutes);
app.use('/api', coachToolsRoutes);
app.use('/api', siteContentRoutes);

// Branded addresses: coach.<domain> opens the coach login, admin.<domain> opens the admin login.
// (Only the bare address "/" is handled here, so the API and every other page stay as they are.)
app.get('/', (req, res, next) => {
  const host = String(req.hostname || '').toLowerCase();
  if (host.startsWith('coach.')) return res.redirect('/admin#coach');
  if (host.startsWith('admin.')) return res.redirect('/admin');
  next();
});

// Short address for coaches: opens the dashboard login on the Coach tab.
app.get('/coach', (req, res) => res.redirect('/admin#coach'));

// Admin dashboard — served directly from a JS string, no static folder needed
app.get('/admin', (req, res) => {
  const mode = loginHostMode(req);
  let html = adminPageHtml;
  if (mode) {
    // Each address gets its own tab title and icon: the logo with ADMIN (green) or COACHES (yellow).
    const label = mode === 'coach' ? 'RCH Coaches' : 'RCH Admin';
    const icon = mode === 'coach' ? 'coaches' : 'admin';
    html = html
      .replace(/<title>[^<]*<\/title>/, '<title>' + label + '</title>')
      .replace('<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">', '<link rel="apple-touch-icon" href="/assets/touch-' + icon + '.png">')
      .replace('content="RCH Admin">', 'content="' + label + '">')
      .replace('</head>', '<link rel="icon" type="image/png" href="/assets/icon-' + icon + '.png"><script>window.RCH_LOGIN_ONLY=' + JSON.stringify(mode) + ';</script></head>');
  }
  res.type('html').set('Cache-Control', 'no-store').send(html);
});

// Installable-app (PWA) files for the admin dashboard: manifest, icons and a
// minimal service worker. The worker deliberately caches nothing — the admin
// always loads live data and the newest uploaded code.
app.get('/manifest.webmanifest', (req, res) => {
  const hostMode = loginHostMode(req);
  const coachHost = hostMode === 'coach';
  res.type('application/manifest+json').set('Cache-Control', 'public, max-age=3600').json({
    name: coachHost ? 'RCH Coaches' : 'RCH Admin',
    short_name: coachHost ? 'RCH Coaches' : 'RCH Admin',
    description: 'RCH Elite Training admin dashboard',
    start_url: coachHost ? '/' : '/admin',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#0c2a1c',
    theme_color: '#0c2a1c',
    icons: hostMode
      ? [
        { src: '/assets/icon-' + (coachHost ? 'coaches' : 'admin') + '.png', sizes: '256x256', type: 'image/png' },
        { src: '/assets/icon512-' + (coachHost ? 'coaches' : 'admin') + '.png', sizes: '512x512', type: 'image/png' },
      ]
      : [
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
['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'coach-uniform.jpg',
  'icon-admin.png', 'sultans-logo.png', 'icon-coaches.png', 'touch-admin.png', 'touch-coaches.png', 'icon512-admin.png', 'icon512-coaches.png'].forEach((f) => {
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

// Review / "what can we change" page a family lands on from the emailed link
app.get('/feedback/:token', (req, res) => {
  res.type('html').send(reviewPageHtml);
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

const { migratePlayerPhones } = require('./phone');

async function ensureSchema() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('✅ Database schema is ready.');
  try { const n = await migratePlayerPhones(pool); console.log('✅ Player phone numbers formatted (' + n + ' updated).'); } catch (e) { console.error('Phone format migration failed:', e); }
  try { await seedCurricula(pool); console.log('✅ Curriculum chapters synced.'); } catch (e) { console.error('Curriculum sync failed:', e); }
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
