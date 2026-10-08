const express = require('express');
const pool = require('./pool');
const { sendSkillsRegistrationEmails } = require('./email');
const { getSetting } = require('./settings');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const VALID_GRADES = new Set(['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade']);
const VALID_SESSION_TYPES = new Set(['one', 'two', 'online']);

// Public: is Skills Training registration currently open?
// The frontend checks this before showing the registration form.
router.get('/register/status', async (req, res) => {
  try {
    const grades = [...VALID_GRADES];
    const [value, gradeValues] = await Promise.all([
      getSetting('skills_training_open', 'true'),
      Promise.all(grades.map((g) => getSetting(`skills_open_${g}`, 'true'))),
    ]);
    const grade = {};
    grades.forEach((g, i) => { grade[g] = gradeValues[i] === 'true'; });
    res.json({ open: value === 'true', grades: grade });
  } catch (err) {
    console.error('Register status error:', err);
    res.status(500).json({ error: 'Could not load registration status.' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const openValue = await getSetting('skills_training_open', 'true');
    if (openValue !== 'true') {
      return res.status(403).json({ error: 'Skills Training registration is currently closed.', closed: true });
    }
  } catch (err) {
    console.error('Register status check error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  const { fullName, parentName, dob, email, phone, team, experience, notes, grade, sessionType, siblingDiscount } = req.body || {};

  if (grade && VALID_GRADES.has(grade)) {
    try {
      if ((await getSetting(`skills_open_${grade}`, 'true')) !== 'true') {
        return res.status(403).json({ error: 'Skills Training registration for this grade is currently closed.', closed: true });
      }
    } catch (err) {
      console.error('Register grade check error:', err);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }

  const errors = {};
  if (!fullName || !String(fullName).trim()) errors.fullName = "Please enter the player's name.";
  if (!parentName || !String(parentName).trim()) errors.parentName = "Please enter the parent's/guardian's name.";
  if (!dob) errors.dob = 'Please enter a date of birth.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email.';
  if (!phone || !PHONE_RE.test(String(phone).trim())) errors.phone = 'Please enter a valid US phone number as +1 followed by 10 digits.';
  if (!team || !String(team).trim()) errors.team = 'Please answer this field.';
  if (!notes || !String(notes).trim()) errors.notes = 'Please share a note.';
  if (!grade || !VALID_GRADES.has(grade)) errors.grade = "Please select the player's grade.";
  if (!sessionType || !VALID_SESSION_TYPES.has(sessionType)) errors.sessionType = 'Please select a sessions-per-week option.';

  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  try {
    const countRes = await pool.query('SELECT COUNT(*)::int AS n FROM skills_registrations');
    const jersey = String(((countRes.rows[0].n || 0) + 1) % 99 || 1).padStart(2, '0');

    const insertRes = await pool.query(
      `INSERT INTO skills_registrations
        (full_name, parent_name, dob, email, phone, team, experience, notes, jersey_number, grade, session_type, sibling_discount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [fullName.trim(), parentName.trim(), dob, email.trim(), phone.trim(), team.trim(), experience || '', notes.trim(), jersey, grade, sessionType, [15, 20].includes(Number(siblingDiscount)) ? Number(siblingDiscount) : 0]
    );

    const entry = insertRes.rows[0];
    sendSkillsRegistrationEmails(entry).catch((e) => console.error('email error', e));

    res.status(201).json({
      ok: true,
      jerseyNumber: jersey,
      message: `Thanks, ${fullName.split(' ')[0]} — you're registered! A coordinator will reach out to you at ${email} to start your first session.`,
    });
  } catch (err) {
    console.error('Skills registration error:', err);
    res.status(500).json({ error: 'Something went wrong saving your registration. Please try again.' });
  }
});

module.exports = router;
