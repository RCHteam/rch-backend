const crypto = require('crypto');
const pool = require('./pool');

function getToken(req) {
  const header = req.headers.authorization || '';
  const headerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  return headerToken || req.query.token || null;
}

// The master admin password. Coach tokens are never accepted here, so every route that
// uses requireAdmin is invisible and closed to coaches.
function requireAdmin(req, res, next) {
  const token = getToken(req);
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server misconfigured: ADMIN_PASSWORD not set.' });
  }
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid or missing admin credentials.' });
  }
  next();
}

// ---- Coach tokens: signed, expiring, no session table ----
const COACH_TOKEN_HOURS = 12;
function secret() {
  return crypto.createHash('sha256').update('rch-coach-token:' + (process.env.ADMIN_PASSWORD || '')).digest();
}
function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}
function makeCoachToken(coachId) {
  const exp = Date.now() + COACH_TOKEN_HOURS * 3600 * 1000;
  const payload = 'c1.' + coachId + '.' + exp;
  return payload + '.' + sign(payload);
}
function safeEqual(a, b) {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
// Returns { id, name } for a valid, unexpired token of a coach who still has a login, else null.
async function coachFromToken(token) {
  if (!token || typeof token !== 'string' || !token.startsWith('c1.')) return null;
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const payload = parts.slice(0, 3).join('.');
  if (!safeEqual(parts[3], sign(payload))) return null;
  if (!(Number(parts[2]) > Date.now())) return null;
  const id = parseInt(parts[1], 10);
  if (!Number.isInteger(id)) return null;
  try {
    const r = await pool.query(
      'SELECT c.id, c.name FROM coaches c JOIN coach_logins l ON l.coach_id = c.id WHERE c.id = $1', [id]);
    return r.rows[0] || null;
  } catch (e) { return null; }
}

// Admin OR a logged-in coach. Use ONLY on the few routes coaches are allowed to use.
// Sets req.coach when it is a coach (req.coach stays undefined for admins).
async function requireStaff(req, res, next) {
  const token = getToken(req);
  if (process.env.ADMIN_PASSWORD && token && token === process.env.ADMIN_PASSWORD) return next();
  const coach = await coachFromToken(token);
  if (!coach) return res.status(401).json({ error: 'Invalid or missing credentials.' });
  req.coach = coach;
  next();
}

// ---- Coach codes: salted scrypt ----
function hashCode(code, salt) {
  return crypto.scryptSync(String(code), salt, 32).toString('hex');
}
function newSalt() { return crypto.randomBytes(16).toString('hex'); }
// Easy to read out loud: no 0/O/1/l/I.
function generateCode(len = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[crypto.randomInt(chars.length)];
  return out;
}

module.exports = { requireAdmin, requireStaff, makeCoachToken, coachFromToken, hashCode, newSalt, generateCode, safeEqual };
