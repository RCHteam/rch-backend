const express = require('express');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { syncCoachCharges } = require('./coachCharges');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set(['president', 'general_manager', 'head_coach', 'coach', 'volunteer']);
const VALID_EMPLOYMENT_TYPES = new Set(['full_time', 'part_time']);

router.get('/admin/coaches', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coaches ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('List coaches error:', err);
    res.status(500).json({ error: 'Could not load coaches.' });
  }
});

router.post('/admin/coaches', requireAdmin, async (req, res) => {
  const {
    firstName, lastName, email, phone, grades, rch, sultans, notes,
    role, qualifications, certificates, degree, employmentType,
    fixedSalaryCents, referralRateCents, playersReferred,
  } = req.body || {};
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  if (!first || !last) {
    return res.status(400).json({ error: "Please enter the coach's first and last name." });
  }
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email, or leave it blank.' });
  }
  if (!VALID_ROLES.has(role)) {
    return res.status(400).json({ error: 'Please choose a category (President, General Manager, Head Coach, Coach, or Volunteer).' });
  }
  if (!VALID_EMPLOYMENT_TYPES.has(employmentType)) {
    return res.status(400).json({ error: 'Please choose Full-Time or Part-Time.' });
  }
  const name = `${first} ${last}`;
  try {
    const insertRes = await pool.query(
      `INSERT INTO coaches
         (name, first_name, last_name, email, phone, grades, rch, sultans, notes,
          role, qualifications, certificates, degree, employment_type,
          fixed_salary_cents, referral_rate_cents, players_referred)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [
        name, first, last, email || '', phone || '', Array.isArray(grades) ? grades : [], !!rch, !!sultans, notes || '',
        role, qualifications || '', certificates || '', degree || '', employmentType,
        Math.max(0, Math.round(Number(fixedSalaryCents) || 0)),
        Math.max(0, Math.round(Number(referralRateCents) || 0)),
        Math.max(0, Math.round(Number(playersReferred) || 0)),
      ]
    );
    const coach = insertRes.rows[0];
    await syncCoachCharges(coach.id);
    res.status(201).json({ ok: true, entry: coach });
  } catch (err) {
    console.error('Add coach error:', err);
    res.status(500).json({ error: 'Could not add this coach.' });
  }
});

router.put('/admin/coaches/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const existingRes = await pool.query('SELECT * FROM coaches WHERE id = $1', [id]);
    const existing = existingRes.rows[0];
    if (!existing) return res.status(404).json({ error: 'Coach not found.' });

    const {
      firstName, lastName, email, phone, grades, rch, sultans, notes,
      role, qualifications, certificates, degree, employmentType,
      fixedSalaryCents, referralRateCents, playersReferred,
    } = req.body || {};
    if (email !== undefined && email && !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email, or leave it blank.' });
    }
    if (role !== undefined && !VALID_ROLES.has(role)) {
      return res.status(400).json({ error: 'Please choose a category (President, General Manager, Head Coach, Coach, or Volunteer).' });
    }
    if (employmentType !== undefined && !VALID_EMPLOYMENT_TYPES.has(employmentType)) {
      return res.status(400).json({ error: 'Please choose Full-Time or Part-Time.' });
    }
    const merged = {
      firstName: firstName !== undefined ? String(firstName).trim() : existing.first_name,
      lastName: lastName !== undefined ? String(lastName).trim() : existing.last_name,
      email: email !== undefined ? email : existing.email,
      phone: phone !== undefined ? phone : existing.phone,
      grades: grades !== undefined ? (Array.isArray(grades) ? grades : []) : existing.grades,
      rch: rch !== undefined ? !!rch : existing.rch,
      sultans: sultans !== undefined ? !!sultans : existing.sultans,
      notes: notes !== undefined ? notes : existing.notes,
      role: role !== undefined ? role : existing.role,
      qualifications: qualifications !== undefined ? qualifications : existing.qualifications,
      certificates: certificates !== undefined ? certificates : existing.certificates,
      degree: degree !== undefined ? degree : existing.degree,
      employmentType: employmentType !== undefined ? employmentType : existing.employment_type,
      fixedSalaryCents: fixedSalaryCents !== undefined ? Math.max(0, Math.round(Number(fixedSalaryCents) || 0)) : existing.fixed_salary_cents,
      referralRateCents: referralRateCents !== undefined ? Math.max(0, Math.round(Number(referralRateCents) || 0)) : existing.referral_rate_cents,
      playersReferred: playersReferred !== undefined ? Math.max(0, Math.round(Number(playersReferred) || 0)) : existing.players_referred,
    };
    if (!merged.firstName || !merged.lastName) {
      return res.status(400).json({ error: "Coach first and last name can't be empty." });
    }
    const name = `${merged.firstName} ${merged.lastName}`;

    const updateRes = await pool.query(
      `UPDATE coaches SET
         name = $1, first_name = $2, last_name = $3, email = $4, phone = $5, grades = $6,
         rch = $7, sultans = $8, notes = $9, role = $10, qualifications = $11,
         certificates = $12, degree = $13, employment_type = $14,
         fixed_salary_cents = $15, referral_rate_cents = $16, players_referred = $17
       WHERE id = $18 RETURNING *`,
      [
        name, merged.firstName, merged.lastName, merged.email, merged.phone, merged.grades,
        merged.rch, merged.sultans, merged.notes, merged.role, merged.qualifications,
        merged.certificates, merged.degree, merged.employmentType,
        merged.fixedSalaryCents, merged.referralRateCents, merged.playersReferred, id,
      ]
    );
    const coach = updateRes.rows[0];
    await syncCoachCharges(coach.id);
    res.json({ ok: true, entry: coach });
  } catch (err) {
    console.error('Edit coach error:', err);
    res.status(500).json({ error: 'Could not save changes to this coach.' });
  }
});

router.delete('/admin/coaches/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM coaches WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Coach not found.' });
    res.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('Delete coach error:', err);
    res.status(500).json({ error: 'Could not delete this coach.' });
  }
});

module.exports = router;
