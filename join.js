const express = require('express');
const pool = require('./pool');
const { sendJoinRegistrationEmails } = require('./email');
const { getSetting } = require('./settings');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const VALID_GROUPS = new Set(['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade']);
const VALID_SESSION_TYPES = new Set(['one', 'two', 'online']);

// Pre-K through 3rd grade cap at 15; 4th–6th grade cap at 20.
const CAPACITY = {
  'pre-k': 15,
  'kindergarten': 15,
  '1st-grade': 15,
  '2nd-grade': 15,
  '3rd-grade': 15,
  '4th-grade': 20,
  '5th-grade': 20,
  '6th-grade': 20,
};

// Registration for Join Sultans FC can be switched on/off per grade (e.g.
// close Pre-K once its squad is set, while 3rd Grade stays open) — each
// grade has its own site_settings key, defaulting to open.
function joinOpenKey(ageGroup) {
  return `join_open_${ageGroup}`;
}

// Public: current registration counts + full/available/open status for every
// grade. The frontend polls this to show "Available"/"Full"/"Closed" on the
// join cards and to hide/disable each grade's form when an admin has
// switched that grade off.
router.get('/join/status', async (req, res) => {
  try {
    const countRes = await pool.query(
      'SELECT age_group, COUNT(*)::int AS n FROM join_registrations GROUP BY age_group'
    );
    const counts = {};
    countRes.rows.forEach((r) => { counts[r.age_group] = r.n; });

    const groups = [...VALID_GROUPS];
    const openValues = await Promise.all(groups.map((g) => getSetting(joinOpenKey(g), 'true')));

    // Kept as a flat map (not nested) so the existing frontend, which reads
    // status['pre-k'] etc. directly by grade key, keeps working unchanged.
    const status = {};
    groups.forEach((group, i) => {
      const count = counts[group] || 0;
      const capacity = CAPACITY[group];
      status[group] = { count, capacity, full: count >= capacity, open: openValues[i] === 'true' };
    });
    res.json(status);
  } catch (err) {
    console.error('Join status error:', err);
    res.status(500).json({ error: 'Could not load registration status.' });
  }
});

router.post('/join/:ageGroup', async (req, res) => {
  const { ageGroup } = req.params;
  if (!VALID_GROUPS.has(ageGroup)) {
    return res.status(404).json({ error: `Unknown age group "${ageGroup}".` });
  }

  try {
    const openValue = await getSetting(joinOpenKey(ageGroup), 'true');
    if (openValue !== 'true') {
      return res.status(403).json({ error: 'Registration for this grade is currently closed.', closed: true });
    }
  } catch (err) {
    console.error('Join status check error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  const {
    childName, dob, motivation, experience, availability,
    parentName, email, phone, emName, emPhone, medical, sessionType,
  } = req.body || {};

  const errors = {};
  if (!childName || !String(childName).trim()) errors.childName = "Please enter the player's name.";
  if (!dob) errors.dob = 'Please enter a date of birth.';
  if (!motivation || !String(motivation).trim()) errors.motivation = 'Please tell us a bit about this.';
  if (!parentName || !String(parentName).trim()) errors.parentName = 'Please enter a name.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email.';
  if (!phone || !PHONE_RE.test(String(phone).trim())) errors.phone = 'Please enter a valid US phone number as +1 followed by 10 digits.';
  if (!emName || !String(emName).trim()) errors.emName = 'Please enter an emergency contact name.';
  if (!emPhone || !PHONE_RE.test(String(emPhone).trim())) errors.emPhone = 'Please enter a valid emergency contact number as +1 followed by 10 digits.';
  if (!medical || !String(medical).trim()) errors.medical = 'Please answer this field.';
  if (!sessionType || !VALID_SESSION_TYPES.has(sessionType)) errors.sessionType = 'Please select a sessions-per-week option.';

  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  try {
    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS n FROM join_registrations WHERE age_group = $1',
      [ageGroup]
    );
    const currentCount = countRes.rows[0].n || 0;
    const capacity = CAPACITY[ageGroup];

    if (currentCount >= capacity) {
      return res.status(409).json({ error: `This grade is full (${capacity}/${capacity} spots filled).`, full: true });
    }

    const jersey = String((currentCount + 1) % 99 || 1).padStart(2, '0');

    // Re-check capacity atomically inside the INSERT itself, so two
    // simultaneous submissions can't both squeeze past the limit.
    const insertRes = await pool.query(
      `INSERT INTO join_registrations
        (age_group, child_name, dob, motivation, experience, availability,
         parent_name, email, phone, emergency_name, emergency_phone, medical, jersey_number, session_type)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
       WHERE (SELECT COUNT(*)::int FROM join_registrations WHERE age_group = $1) < $15
       RETURNING *`,
      [ageGroup, childName.trim(), dob, motivation.trim(), experience || '', availability || '',
       parentName.trim(), email.trim(), phone.trim(), emName.trim(), emPhone.trim(), medical.trim(), jersey,
       sessionType, capacity]
    );

    if (!insertRes.rows[0]) {
      return res.status(409).json({ error: `This grade is full (${capacity}/${capacity} spots filled).`, full: true });
    }

    const entry = insertRes.rows[0];
    sendJoinRegistrationEmails(entry).catch((e) => console.error('email error', e));

    res.status(201).json({
      ok: true,
      jerseyNumber: jersey,
      message: `Thanks for registering — a coordinator will reach out to you to start your first session.`,
    });
  } catch (err) {
    console.error('Join registration error:', err);
    res.status(500).json({ error: 'Something went wrong saving your registration. Please try again.' });
  }
});

module.exports = router;
module.exports.CAPACITY = CAPACITY;
module.exports.VALID_GROUPS = VALID_GROUPS;
