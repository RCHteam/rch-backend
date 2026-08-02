const express = require('express');
const pool = require('./pool');
const { sendJoinRegistrationEmails } = require('./email');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const VALID_GROUPS = new Set(['4-5', '6-7', '8-9', '10-11']);

router.post('/join/:ageGroup', async (req, res) => {
  const { ageGroup } = req.params;
  if (!VALID_GROUPS.has(ageGroup)) {
    return res.status(404).json({ error: `Unknown age group "${ageGroup}".` });
  }

  const {
    childName, dob, motivation, experience, availability,
    parentName, email, phone, emName, emPhone, medical,
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

  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  try {
    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS n FROM join_registrations WHERE age_group = $1',
      [ageGroup]
    );
    const jersey = String(((countRes.rows[0].n || 0) + 1) % 99 || 1).padStart(2, '0');

    const insertRes = await pool.query(
      `INSERT INTO join_registrations
        (age_group, child_name, dob, motivation, experience, availability,
         parent_name, email, phone, emergency_name, emergency_phone, medical, jersey_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [ageGroup, childName.trim(), dob, motivation.trim(), experience || '', availability || '',
       parentName.trim(), email.trim(), phone.trim(), emName.trim(), emPhone.trim(), medical.trim(), jersey]
    );

    const entry = insertRes.rows[0];
    sendJoinRegistrationEmails(entry).catch((e) => console.error('email error', e));

    res.status(201).json({
      ok: true,
      jerseyNumber: jersey,
      message: `Thanks for registering — a coordinator will email you with placement information and try-out details if selected.`,
    });
  } catch (err) {
    console.error('Join registration error:', err);
    res.status(500).json({ error: 'Something went wrong saving your registration. Please try again.' });
  }
});

module.exports = router;
