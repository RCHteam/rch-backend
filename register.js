const express = require('express');
const pool = require('./pool');
const { sendSkillsRegistrationEmails } = require('./email');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

router.post('/register', async (req, res) => {
  const { fullName, dob, email, phone, team, experience, notes } = req.body || {};

  const errors = {};
  if (!fullName || !String(fullName).trim()) errors.fullName = 'Please enter a name.';
  if (!dob) errors.dob = 'Please enter a date of birth.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email.';
  if (!phone || !PHONE_RE.test(String(phone).trim())) errors.phone = 'Please enter a valid US phone number as +1 followed by 10 digits.';
  if (!team || !String(team).trim()) errors.team = 'Please answer this field.';
  if (!notes || !String(notes).trim()) errors.notes = 'Please share a note.';

  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  try {
    const countRes = await pool.query('SELECT COUNT(*)::int AS n FROM skills_registrations');
    const jersey = String(((countRes.rows[0].n || 0) + 1) % 99 || 1).padStart(2, '0');

    const insertRes = await pool.query(
      `INSERT INTO skills_registrations
        (full_name, dob, email, phone, team, experience, notes, jersey_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [fullName.trim(), dob, email.trim(), phone.trim(), team.trim(), experience || '', notes.trim(), jersey]
    );

    const entry = insertRes.rows[0];
    sendSkillsRegistrationEmails(entry).catch((e) => console.error('email error', e));

    res.status(201).json({
      ok: true,
      jerseyNumber: jersey,
      message: `Thanks, ${fullName.split(' ')[0]} — you're registered! A coordinator will reach out to you at ${email} with your placement and first training date.`,
    });
  } catch (err) {
    console.error('Skills registration error:', err);
    res.status(500).json({ error: 'Something went wrong saving your registration. Please try again.' });
  }
});

module.exports = router;
