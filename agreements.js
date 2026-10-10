// Agreement e-signing: admin sends a family a private link, the parent fills
// in/confirms the info and e-signs on the page, the server builds the signed
// PDF and stores it in the database (Data tab → Signed Agreements).
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const PDFDocument = require('pdfkit');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { sendAgreementEmail, sendSignedAgreementEmails } = require('./email');

const router = express.Router();
const fs = require('fs');
// The logo images may sit in assets/ or (if uploaded flat to GitHub) next to this file.
function assetPath(name) {
  const inAssets = path.join(__dirname, 'assets', name);
  return fs.existsSync(inAssets) ? inAssets : path.join(__dirname, name);
}
const DOC_VERSION = 'October 2026';

function siteUrl(req) { return `${req.protocol}://${req.get('host')}`; }
const clean = (v, max = 300) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);

// ---- The agreement text (one source for the web page AND the PDF) ----------
const SECTIONS = [
  { h: '1. Program Description', p: [
    'RCH Elite Training provides structured soccer skills training — large-group, one-on-one, and online sessions — focused on technical development, individual and collective skills, confidence, coordination, and overall player growth. Sessions are age-appropriate and performance-driven, emphasizing individual improvement, discipline, and long-term player development. Soccer Sultans FC is RCH’s competitive team program; additional Sultans terms appear in Section 8.' ] },
  { h: '2. Rules & Code of Conduct', p: ['Player expectations'], ul: [
    'Arrive on time and prepared for every session to learn.',
    'Show respect to coaches, teammates, opponents, officials, and equipment.',
    'No aggressive, disrespectful, bullying, discriminatory, or unsafe behavior.',
    'Follow instructions for safety and development.' ],
    p2: ['Parent / guardian expectations'], ul2: [
    'Maintain respectful and direct communication at all times.',
    'Refrain from coaching from the sidelines.',
    'Address concerns or recommendations privately with the coach.',
    'Support a positive learning environment.' ],
    p3: ['RCH Elite Training may pause or end a session, or decline future enrollment, for unsafe or disruptive behavior.'] },
  { h: '3. Attendance, Make-Ups & Program Changes', p: [
    'Consistent attendance and a positive attitude are expected. Sessions begin and end at the scheduled times, and late arrival does not extend the session. Parents should notify RCH as early as reasonably possible of an absence. Missed sessions do not automatically qualify for a make-up session, credit, refund, or reduction in monthly dues. Make-up sessions may be offered at the coach’s discretion depending on the season, availability, and schedule, but are not guaranteed. RCH may reasonably adjust coaching assignments, player groups, training locations, schedules, and program format, and will notify families of significant changes whenever reasonably practicable.' ] },
  { h: '4. Payment Agreement', ul: [
    'Monthly training fees are due on the 1st of each month unless RCH states otherwise in writing.',
    'Fees are paid through the secure online payment link sent by RCH Elite Training (card payment, processed by Stripe). Any other arrangement (such as cash or Zelle) requires RCH’s prior written approval.',
    'Training fees are separate from league or team fees.',
    'Late or unsuccessful payments may result in suspension of training until the balance is resolved.',
    'Families are responsible for keeping payment information current.' ] },
  { h: '5. Fees, Refunds & Withdrawal', p: [
    'Monthly dues support continued enrollment in the RCH Elite Training program. Once monthly dues have been paid or processed, they are generally non-refundable and non-transferable, except where required by law or expressly approved by RCH Elite Training. Missing training, temporarily stopping attendance, participating in another activity, traveling, or withdrawing during a paid month does not automatically qualify for a prorated refund or credit. Any withdrawal or cancellation of future enrollment must follow the procedure communicated by RCH Elite Training. Outstanding balances incurred before withdrawal remain the responsibility of the parent or guardian.' ] },
  { h: '6. Weather & Cancellations', ul: [
    'Sessions may be canceled, postponed, relocated, or shortened due to unsafe weather, field conditions, facility restrictions, or coach availability.',
    'RCH may offer a rescheduled session, an at-home assignment, or an online development activity. Make-ups are not guaranteed.',
    'Training times may adjust seasonally due to daylight availability and sunset conditions.',
    'Weather or operational changes do not automatically entitle families to a refund, credit, or reduction in dues.' ] },
  { h: '7. Online Classes', p: [
    'Online classes are delivered through Google Classroom. Families agree to supervise their child’s online participation and to keep Classroom links and materials private and for the enrolled player’s use only.' ] },
  { h: '8. Soccer Sultans FC (competitive team) – additional terms', ul: [
    'Trial & placement: registering reserves a spot for evaluation and does not guarantee a roster place; players may be placed, waitlisted, or referred to another age group or to Skills Training.',
    'Season commitment: rostered players commit to the full season’s practices and league fixtures, including away matches that may require travel. Repeated unexcused absences may affect playing time or roster status.',
    'Kit & team fees: rostered players must purchase the official Sultans FC kit and may owe a seasonal team fee covering league registration, referees, and facility costs, communicated upon placement.',
    'Parent responsibilities: on-time drop-off and pick-up, proper kit and hydration, and prompt updates to medical or emergency-contact information.' ] },
  { h: '9. Medical Release & Assumption of Risk', p: [
    'I acknowledge that participation in soccer training and play involves physical activity and inherent risk of injury, including but not limited to falls, contact with other players, or overexertion. I voluntarily assume all risks associated with my child’s participation in RCH Elite Training / Soccer Sultans, and I confirm my child is physically fit to participate. RCH coaches are not medical professionals and will follow standard first-aid and emergency procedures.',
    'In the event of an emergency, I authorize the coach to obtain emergency medical treatment for my child if I cannot be reached, and I accept responsibility for resulting medical costs.' ] },
  { h: '10. Liability Waiver', p: [
    'I hereby release, waive, and discharge RCH Elite Training / Soccer Sultans and its coaches, staff, and volunteers from any and all claims, liabilities, or demands arising from participation in training sessions, matches, or events, including injury, illness, or property loss, except in cases of gross negligence or willful misconduct.' ] },
  { h: '11. Privacy', p: [
    'Registration and medical information is used to run the program, ensure player safety, and communicate with families. We do not sell personal information. Limited information may be shared with league organizers, facilities, emergency services, and service providers such as Stripe for payments. See the Privacy Policy at rchelitetraining.com/privacy.' ] },
  { h: '12. General Terms', p: [
    'This agreement works together with the Terms of Service and the applicable Pre-Registration Policy at rchelitetraining.com. It is governed by the laws of the State of Texas. If any part is found unenforceable, the remainder stays in effect. Signing electronically has the same legal effect as signing on paper.' ] },
];
const PHOTO_TEXT = 'I grant permission for photos or videos of my child to be used for training, promotional, or social media purposes by RCH Elite Training / Soccer Sultans. I may withdraw this consent at any time in writing.';
const ACK_TEXT = 'I confirm that I have read and fully understand this agreement and voluntarily agree to all terms.';
const LOCKED_PROGRAMS = ['skills_one', 'online'];
const PROGRAMS = [
  ['skills_group', 'Skills Training – Large Group'],
  ['skills_one', 'Skills Training – One-on-One'],
  ['online', 'Online Classes (Google Classroom)'],
  ['sultans', 'Soccer Sultans FC (competitive team)'],
];

// ---- Pull what we already know about a family from the registration --------
async function lookupRegistration(type, id) {
  if (type === 'skills') {
    const r = (await pool.query('SELECT * FROM skills_registrations WHERE id=$1', [id])).rows[0];
    if (!r) return null;
    return { playerName: r.full_name, parentName: r.parent_name || r.full_name, email: r.email, phone: r.phone,
      dob: r.dob, grade: r.grade || '', programLabel: 'Skills Training', programs: ['skills_group'], medical: r.notes || '' };
  }
  if (type === 'join') {
    const r = (await pool.query('SELECT * FROM join_registrations WHERE id=$1', [id])).rows[0];
    if (!r) return null;
    return { playerName: r.child_name, parentName: r.parent_name, email: r.email, phone: r.phone, dob: r.dob,
      grade: r.age_group, programLabel: 'Sultans FC — ' + r.age_group, programs: ['sultans'],
      emergencyName: r.emergency_name, emergencyPhone: r.emergency_phone, medical: r.medical || '' };
  }
  if (type === 'player') {
    const r = (await pool.query('SELECT * FROM players WHERE id=$1', [id])).rows[0];
    if (!r) return null;
    const programs = [];
    if (r.rch) programs.push(r.session_type === 'online' ? 'online' : 'skills_group');
    if (r.sultans) programs.push('sultans');
    return { playerName: r.player_name, parentName: r.parent_name || '', email: r.parent_email || '', phone: r.parent_phone || '',
      dob: r.dob, grade: r.grade, programLabel: [r.rch && 'Skills Training', r.sultans && 'Sultans FC'].filter(Boolean).join(' + ') || 'Skills Training', programs };
  }
  return null;
}
const isoDate = (d) => (d ? (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)) : '');

// ---- Admin: send an agreement link -----------------------------------------
router.post('/admin/agreements/send', requireAdmin, async (req, res) => {
  const { registrationType, registrationId } = req.body || {};
  if (!['skills', 'join', 'player'].includes(registrationType) || !registrationId) {
    return res.status(400).json({ error: 'registrationType and registrationId are required.' });
  }
  try {
    const info = await lookupRegistration(registrationType, registrationId);
    if (!info) return res.status(404).json({ error: 'Registration not found.' });
    if (!info.email) return res.status(400).json({ error: 'This family has no email on file — add one first.' });

    // Re-use an unsigned link for the same registration (this is a "resend").
    let row = (await pool.query(
      `SELECT * FROM agreements WHERE registration_type=$1 AND registration_id=$2 AND signed_at IS NULL ORDER BY id DESC LIMIT 1`,
      [registrationType, registrationId])).rows[0];
    if (row) {
      await pool.query('UPDATE agreements SET sent_at=now(), parent_email=$2, program_label=$3 WHERE id=$1', [row.id, info.email, info.programLabel]);
    } else {
      const token = crypto.randomBytes(24).toString('hex');
      row = (await pool.query(
        `INSERT INTO agreements (token, registration_type, registration_id, player_name, parent_name, parent_email, program_label)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [token, registrationType, registrationId, info.playerName, info.parentName, info.email, info.programLabel])).rows[0];
    }
    const link = `${siteUrl(req)}/sign/${row.token}`;
    await sendAgreementEmail({ to: info.email, parentName: info.parentName, childName: info.playerName, link });
    res.json({ ok: true, link });
  } catch (err) {
    console.error('Send agreement error:', err);
    res.status(500).json({ error: 'Could not send the agreement.' });
  }
});

// Admin: list (without the PDF bytes) and download
router.get('/admin/agreements', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, registration_type, registration_id, player_name, parent_name, parent_email, program_label,
              sent_at, signed_at, (pdf_data IS NOT NULL) AS has_pdf
         FROM agreements ORDER BY COALESCE(signed_at, sent_at) DESC`);
    res.json(r.rows);
  } catch (err) {
    console.error('List agreements error:', err);
    res.status(500).json({ error: 'Could not load agreements.' });
  }
});

router.get('/admin/agreements/:id/pdf', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT player_name, pdf_data FROM agreements WHERE id=$1', [req.params.id]);
    if (!r.rows[0] || !r.rows[0].pdf_data) return res.status(404).json({ error: 'No signed PDF for this agreement.' });
    const safe = r.rows[0].player_name.replace(/[^a-z0-9]+/gi, '_');
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="Agreement_${safe}.pdf"` });
    res.send(r.rows[0].pdf_data);
  } catch (err) {
    console.error('Agreement pdf error:', err);
    res.status(500).json({ error: 'Could not load the PDF.' });
  }
});

router.delete('/admin/agreements/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM agreements WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete.' });
  }
});

// ---- Family: load + sign ---------------------------------------------------
router.get('/sign/:token', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM agreements WHERE token=$1', [req.params.token]);
    const a = r.rows[0];
    if (!a) return res.status(404).json({ error: 'not_found' });
    if (a.signed_at) return res.json({ status: 'signed', signedAt: a.signed_at });
    const info = (await lookupRegistration(a.registration_type, a.registration_id)) || {};
    res.json({
      status: 'pending',
      sections: SECTIONS, photoText: PHOTO_TEXT, ackText: ACK_TEXT, programs: PROGRAMS, lockedPrograms: LOCKED_PROGRAMS, version: DOC_VERSION,
      prefill: {
        playerName: a.player_name, dob: isoDate(info.dob), grade: info.grade || '', school: '',
        parentName: a.parent_name || '', phone: info.phone || '', email: a.parent_email, address: '',
        emergencyName: info.emergencyName || '', emergencyPhone: info.emergencyPhone || '', emergencyRelation: '',
        medical: info.medical || '', programs: info.programs || [],
      },
    });
  } catch (err) {
    console.error('Load agreement error:', err);
    res.status(500).json({ error: 'server' });
  }
});

router.post('/sign/:token', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM agreements WHERE token=$1', [req.params.token]);
    const a = r.rows[0];
    if (!a) return res.status(404).json({ error: 'This link is invalid.' });
    if (a.signed_at) return res.status(409).json({ error: 'This agreement has already been signed.' });

    const b = req.body || {};
    const f = {
      playerName: clean(b.playerName), dob: clean(b.dob, 20), grade: clean(b.grade, 40), school: clean(b.school),
      parentName: clean(b.parentName), phone: clean(b.phone, 40), email: clean(b.email), address: clean(b.address, 300),
      emergencyName: clean(b.emergencyName), emergencyPhone: clean(b.emergencyPhone, 40), emergencyRelation: clean(b.emergencyRelation, 60),
      medical: String(b.medical || '').trim().slice(0, 1500),
      programs: (Array.isArray(b.programs) ? b.programs : []).filter((k) => PROGRAMS.some((p) => p[0] === k)),
      photoConsent: b.photoConsent === 'yes' ? 'yes' : b.photoConsent === 'no' ? 'no' : '',
      typedName: clean(b.typedName),
    };
    // One-on-One and Online Classes are assigned by RCH, not chosen by the
    // family: they only count if they were already set on the registration.
    const info = (await lookupRegistration(a.registration_type, a.registration_id)) || {};
    f.programs = f.programs.filter((k) => !LOCKED_PROGRAMS.includes(k) || (info.programs || []).includes(k));
    const missing = [];
    if (!f.playerName) missing.push('player name');
    if (!f.dob) missing.push('date of birth');
    if (!f.parentName) missing.push('parent/guardian name');
    if (!f.phone) missing.push('phone number');
    if (!f.email) missing.push('email');
    if (!f.emergencyName || !f.emergencyPhone) missing.push('emergency contact');
    if (!f.programs.length) missing.push('program');
    if (!f.photoConsent) missing.push('photo consent choice');
    if (!f.typedName) missing.push('typed full name');
    if (missing.length) return res.status(400).json({ error: 'Please complete: ' + missing.join(', ') + '.' });
    if (b.agree !== true) return res.status(400).json({ error: 'Please check the box confirming you agree.' });

    const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(b.signature || '');
    if (!m || m[1].length > 600000) return res.status(400).json({ error: 'Please draw your signature in the box.' });
    const sigBuf = Buffer.from(m[1], 'base64');

    const signedAt = new Date();
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
    const ua = clean(req.headers['user-agent'] || '', 300);

    const pdf = await buildPdf({ f, sigBuf, signedAt, ip, docId: a.token.slice(0, 12).toUpperCase() });
    const hash = crypto.createHash('sha256').update(pdf).digest('hex');

    const upd = await pool.query(
      `UPDATE agreements SET signed_at=$2, form_data=$3, pdf_data=$4, pdf_sha256=$5, signer_ip=$6, signer_user_agent=$7,
              player_name=$8, parent_name=$9, parent_email=$10
        WHERE token=$1 AND signed_at IS NULL RETURNING id`,
      [a.token, signedAt, JSON.stringify(f), pdf, hash, ip, ua, f.playerName, f.parentName, f.email]);
    if (!upd.rows[0]) return res.status(409).json({ error: 'This agreement has already been signed.' });

    // Fire-and-forget copy to the family + the club. A mail failure must not
    // undo the signing — the PDF is already saved in the Data tab.
    sendSignedAgreementEmails({ to: f.email, parentName: f.parentName, childName: f.playerName, pdf }).catch((e) => console.error(e));
    res.json({ ok: true });
  } catch (err) {
    console.error('Sign agreement error:', err);
    res.status(500).json({ error: 'Could not save your signature. Please try again.' });
  }
});

// ---- PDF -------------------------------------------------------------------
function buildPdf({ f, sigBuf, signedAt, ip, docId }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 100, bottom: 56, left: 50, right: 50 }, bufferPages: true,
      info: { Title: 'RCH Elite Training / Soccer Sultans - Soccer Training Agreement & Liability Waiver', Author: 'RCH Elite Training' } });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const GREEN = '#1f7a46';
    const W = doc.page.width, L = 50, CW = W - 100;

    function header() {
      doc.image(assetPath('agreement-rch.png'), L, 28, { width: 92 });
      doc.image(assetPath('agreement-sultans.png'), W - L - 44, 24, { height: 50 });
      doc.fillColor('#111').font('Helvetica-Bold').fontSize(12.5).text('RCH ELITE TRAINING / SOCCER SULTANS', L, 34, { width: CW, align: 'center', lineBreak: false });
      doc.fillColor(GREEN).font('Helvetica').fontSize(9.5).text('Soccer Training Agreement & Liability Waiver', L, 52, { width: CW, align: 'center', lineBreak: false });
      doc.moveTo(L, 82).lineTo(W - L, 82).lineWidth(1.4).strokeColor(GREEN).stroke();
      doc.x = L; doc.y = 100;
    }
    header();
    doc.on('pageAdded', header);

    const need = (h) => { if (doc.y + h > doc.page.height - 60) doc.addPage(); };
    const heading = (t) => { need(40); doc.moveDown(0.5).fillColor(GREEN).font('Helvetica-Bold').fontSize(11).text(t, L, doc.y, { width: CW }); doc.moveDown(0.2); };
    const para = (t) => { doc.fillColor('#111').font('Helvetica').fontSize(9).text(t, L, doc.y, { width: CW, lineGap: 1.5 }); doc.moveDown(0.3); };
    const bullets = (arr) => arr.forEach((t) => {
      const idx = t.indexOf(': ');
      doc.fillColor('#111').fontSize(9);
      if (idx > 0 && idx < 40 && /^(Trial|Season|Kit|Parent)/.test(t)) {
        doc.font('Helvetica-Bold').text('•  ' + t.slice(0, idx + 1), L + 8, doc.y, { width: CW - 8, continued: true, lineGap: 1.5 })
          .font('Helvetica').text(' ' + t.slice(idx + 2), { lineGap: 1.5 });
      } else {
        doc.font('Helvetica').text('•  ' + t, L + 8, doc.y, { width: CW - 8, lineGap: 1.5 });
      }
      doc.moveDown(0.1);
    });
    const field = (label, val, x, y, w) => {
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#555').text(label, x, y, { width: w, lineBreak: false });
      doc.font('Helvetica').fontSize(10).fillColor('#111').text(val || '—', x, y + 10, { width: w - 8, lineBreak: false, ellipsis: true });
      doc.moveTo(x, y + 24).lineTo(x + w - 8, y + 24).lineWidth(0.5).strokeColor('#999').stroke();
    };
    const grid = (title, rows) => {
      heading(title);
      rows.forEach((r) => {
        need(32);
        const y = doc.y; const w = CW / r.length;
        r.forEach((c, i) => field(c[0], c[1], L + i * w, y, w));
        doc.y = y + 30;
      });
    };

    const gradeLabel = String(f.grade || '').replace(/-/g, ' ');
    grid('Player Information', [[['Player Full Name', f.playerName], ['Date of Birth', f.dob]], [['Age Group / Grade', gradeLabel], ['School (optional)', f.school]]]);
    grid('Parent / Guardian Information', [[['Parent/Guardian Name', f.parentName], ['Phone Number', f.phone]], [['Email Address', f.email], ['Home Address (optional)', f.address]]]);
    grid('Emergency Contact', [[['Name', f.emergencyName], ['Relationship', f.emergencyRelation]], [['Phone', f.emergencyPhone], ['', '']]]);
    heading('Program Selected');
    para(PROGRAMS.map((p) => (f.programs.includes(p[0]) ? '[X] ' : '[  ] ') + p[1]).join('     '));

    SECTIONS.forEach((s, i) => {
      heading(s.h);
      if (s.p) s.p.forEach((t) => { if (t === 'Player expectations') doc.font('Helvetica-Bold').fontSize(9).fillColor('#111').text(t, L, doc.y); else para(t); });
      if (s.ul) bullets(s.ul);
      if (s.p2) s.p2.forEach((t) => doc.font('Helvetica-Bold').fontSize(9).fillColor('#111').text(t, L, doc.y + 2));
      if (s.ul2) bullets(s.ul2);
      if (s.p3) s.p3.forEach(para);
      if (i === 7) { // after Sultans terms: the medical info the family wrote
        heading('Medical Information');
        para('Medical conditions, allergies, or limitations: ' + (f.medical || 'None reported.'));
      }
    });

    heading('Photo & Video Consent');
    para(PHOTO_TEXT);
    para((f.photoConsent === 'yes' ? '[X] Yes, I consent     [  ] No, I do not consent' : '[  ] Yes, I consent     [X] No, I do not consent'));

    need(190);
    heading('Acknowledgment & Signature');
    para(ACK_TEXT);
    const y0 = doc.y + 4;
    doc.image(sigBuf, L, y0, { fit: [210, 60] });
    doc.moveTo(L, y0 + 64).lineTo(L + 230, y0 + 64).lineWidth(0.6).strokeColor('#111').stroke();
    doc.font('Helvetica').fontSize(8).fillColor('#555').text('Parent / Guardian Signature', L, y0 + 67, { lineBreak: false });
    doc.font('Helvetica').fontSize(11).fillColor('#111').text(f.typedName, L + 270, y0 + 46, { width: 230, lineBreak: false });
    doc.moveTo(L + 270, y0 + 64).lineTo(W - L, y0 + 64).stroke();
    doc.fontSize(8).fillColor('#555').text('Printed Name', L + 270, y0 + 67, { lineBreak: false });
    const when = signedAt.toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'long', timeStyle: 'short' });
    doc.y = y0 + 90;
    doc.font('Helvetica-Oblique').fontSize(8).fillColor('#555').text(
      `Electronically signed on ${when} (Central Time). Document ID ${docId} · IP ${ip || 'n/a'} · Agreement version ${DOC_VERSION}. The parent/guardian agreed to sign electronically; an electronic signature has the same legal effect as a handwritten one.`,
      L, doc.y, { width: CW });

    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      doc.page.margins.bottom = 0; // footer sits inside the bottom margin; without this pdfkit adds a blank page
      doc.font('Helvetica').fontSize(8).fillColor('#888');
      doc.text('RCH Elite Training · rcheliteacademy@gmail.com · +1 (945) 527-5265', L, doc.page.height - 38, { lineBreak: false });
      doc.text(`Page ${i + 1} of ${range.count} · ${f.playerName}`, L, doc.page.height - 38, { width: CW, align: 'right', lineBreak: false });
    }
    doc.end();
  });
}

module.exports = { router, buildPdf, SECTIONS, assetPath };
