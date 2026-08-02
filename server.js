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
app.use(express.json());

const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/register', formLimiter);
app.use('/api/join', formLimiter);

app.use('/api', registerRoutes);
app.use('/api', joinRoutes);
app.use('/api', adminRoutes);

// Admin dashboard — served directly from a JS string, no static folder needed
app.get('/admin', (req, res) => {
  res.type('html').send(adminPageHtml);
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
  })
  .catch((err) => {
    console.error('❌ Failed to set up the database schema:', err);
    process.exit(1);
  });
