function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const headerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  const queryToken = req.query.token || null;
  const token = headerToken || queryToken;

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server misconfigured: ADMIN_PASSWORD not set.' });
  }
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid or missing admin credentials.' });
  }
  next();
}

module.exports = { requireAdmin };
