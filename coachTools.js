const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { sendStudentReportEmail } = require('./email');
const { centralDateParts, practiceDates } = require('./proration');

const router = express.Router();

const GRADES = ['pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'];
const GRADE_LABELS = {
  'pre-k': 'Pre-K', 'kindergarten': 'Kindergarten', '1st-grade': '1st Grade', '2nd-grade': '2nd Grade',
  '3rd-grade': '3rd Grade', '4th-grade': '4th Grade', '5th-grade': '5th Grade', '6th-grade': '6th Grade',
};
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseMonth(v) { // 'YYYY-MM' (or 'YYYY-MM-01'); defaults to this month in Central time
  const m = /^(\d{4})-(\d{2})/.exec(String(v || ''));
  if (m && Number(m[2]) >= 1 && Number(m[2]) <= 12) return { year: Number(m[1]), month: Number(m[2]) };
  const c = centralDateParts(new Date());
  return { year: c.year, month: c.month };
}
function monthLabel({ year, month }) { return `${MONTH_NAMES[month - 1]} ${year}`; }
function monthKeyOf({ year, month }) { return `${year}-${String(month).padStart(2, '0')}`; }


/* ---- The full curriculum pages (one HTML file per grade, shown in the admin inside a frame) ---- */
const CURRICULUM_FILES = { 'pre-k': 'curriculum-prek.html' };
router.all('/admin/curriculum-view/:grade', requireAdmin, (req, res) => {
  const file = CURRICULUM_FILES[req.params.grade];
  if (!file) return res.status(404).json({ error: 'This curriculum has not been loaded yet.' });
  try {
    const html = require('fs').readFileSync(path.join(__dirname, file), 'utf8');
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'no-store');
    res.send(req.method === 'HEAD' ? '' : html);
  } catch (err) {
    console.error('Curriculum view error:', err);
    res.status(404).json({ error: 'This curriculum has not been loaded yet.' });
  }
});

/* ------------------------------ Curriculum ------------------------------ */

router.get('/admin/curriculum', requireAdmin, async (req, res) => {
  try {
    const grade = GRADES.includes(req.query.grade) ? req.query.grade : null;
    const r = await pool.query(
      `SELECT * FROM curriculum_chapters ${grade ? 'WHERE grade = $1' : ''} ORDER BY grade, position, id`,
      grade ? [grade] : []
    );
    res.json(r.rows);
  } catch (err) {
    console.error('List curriculum error:', err);
    res.status(500).json({ error: 'Could not load the curriculum.' });
  }
});

router.post('/admin/curriculum', requireAdmin, async (req, res) => {
  const { grade, title, content, assessment } = req.body || {};
  if (!GRADES.includes(grade)) return res.status(400).json({ error: 'Please choose a grade.' });
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Please enter a chapter title.' });
  try {
    const r = await pool.query(
      `INSERT INTO curriculum_chapters (grade, position, title, content, assessment)
       VALUES ($1, COALESCE((SELECT MAX(position) FROM curriculum_chapters WHERE grade = $1), 0) + 1, $2, $3, $4)
       RETURNING *`,
      [grade, String(title).trim(), String(content || ''), String(assessment || '')]
    );
    res.status(201).json({ ok: true, entry: r.rows[0] });
  } catch (err) {
    console.error('Add chapter error:', err);
    res.status(500).json({ error: 'Could not add this chapter.' });
  }
});

router.put('/admin/curriculum/:id', requireAdmin, async (req, res) => {
  const { title, content, assessment } = req.body || {};
  if (title !== undefined && !String(title).trim()) return res.status(400).json({ error: 'Title can not be empty.' });
  try {
    const r = await pool.query(
      `UPDATE curriculum_chapters SET title = COALESCE($1, title), content = COALESCE($2, content), assessment = COALESCE($3, assessment) WHERE id = $4 RETURNING *`,
      [title !== undefined ? String(title).trim() : null, content !== undefined ? String(content) : null, assessment !== undefined ? String(assessment) : null, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Chapter not found.' });
    res.json({ ok: true, entry: r.rows[0] });
  } catch (err) {
    console.error('Edit chapter error:', err);
    res.status(500).json({ error: 'Could not save this chapter.' });
  }
});

// Swap a chapter with its neighbour: { direction: 'up' | 'down' }
router.put('/admin/curriculum/:id/move', requireAdmin, async (req, res) => {
  const dir = req.body && req.body.direction === 'up' ? 'up' : 'down';
  try {
    const cur = (await pool.query('SELECT * FROM curriculum_chapters WHERE id = $1', [req.params.id])).rows[0];
    if (!cur) return res.status(404).json({ error: 'Chapter not found.' });
    const all = (await pool.query('SELECT id FROM curriculum_chapters WHERE grade = $1 ORDER BY position, id', [cur.grade])).rows;
    const i = all.findIndex((x) => x.id === cur.id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= all.length) return res.json({ ok: true });
    const order = all.map((x) => x.id);
    [order[i], order[j]] = [order[j], order[i]];
    for (let k = 0; k < order.length; k++) {
      await pool.query('UPDATE curriculum_chapters SET position = $1 WHERE id = $2', [k + 1, order[k]]);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Move chapter error:', err);
    res.status(500).json({ error: 'Could not reorder.' });
  }
});

router.delete('/admin/curriculum/:id', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM curriculum_chapters WHERE id = $1 RETURNING id', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Chapter not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete chapter error:', err);
    res.status(500).json({ error: 'Could not delete this chapter.' });
  }
});

/* ---------------------------- Student reports ---------------------------- */

const ASSESSMENT_LABELS = { yes: 'Yes (skill achieved)', almost: 'Almost there', not_yet: 'Not yet' };

// The year has two seasons, each split into two terms.
const TERMS = ['Fall Term 1', 'Fall Term 2', 'Spring Term 1', 'Spring Term 2'];

function reportChapters(r) {
  try { const a = JSON.parse(r.chapters_json || '[]'); if (Array.isArray(a) && a.length) return a; } catch (e) { /* fall through */ }
  // Older reports saved a single chapter.
  if (r.chapter_title) return [{ title: r.chapter_title, assessment: r.assessment_check || '', result: r.assessment_result || '' }];
  return [];
}

function buildReportPdf(r) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 54, size: 'LETTER' });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.rect(0, 0, 612, 96).fill('#0c2a1c');
      try { doc.image(path.join(__dirname, 'assets', 'logo.png'), 54, 22, { height: 52 }); } catch (e) { /* logo is optional */ }
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#ffffff').text('Student Progress Report', 250, 38, { width: 308, align: 'right' });
      doc.fillColor('#000000');
      doc.y = 120; doc.x = 54;

      doc.font('Helvetica-Bold').fontSize(22).fillColor('#0c2a1c').text(r.player_name, 54, 120);
      doc.font('Helvetica').fontSize(12).fillColor('#444444')
        .text(`${GRADE_LABELS[r.grade] || r.grade}  •  ${r.month_label}`, 54);
      if (r.term) doc.moveDown(0.3).text(`Term: ${r.term}`);
      const chaps = reportChapters(r);
      if (chaps.length) doc.moveDown(0.3).text(`${chaps.length > 1 ? 'Chapters' : 'Chapter'}: ${chaps.map((c) => c.title).join('; ')}`);
      doc.moveDown(0.8);
      doc.moveTo(54, doc.y).lineTo(558, doc.y).lineWidth(1).strokeColor('#d9a441').stroke();
      doc.moveDown(0.8);

      if (r.parent_name) doc.font('Helvetica').fontSize(11).fillColor('#000000').text(`Dear ${r.parent_name},`).moveDown(0.6);
      doc.font('Helvetica').fontSize(11).fillColor('#000000').text(String(r.body || ''), { align: 'left', lineGap: 3 });

      for (const c of chaps) {
        if (!c.assessment) continue;
        doc.moveDown(1.2);
        const boxX = 54, boxW = 504;
        const label = ASSESSMENT_LABELS[c.result] || '';
        const textH = doc.font('Helvetica').fontSize(10.5).heightOfString(c.assessment, { width: boxW - 28 });
        const boxH = 30 + textH + (label ? 24 : 6);
        if (doc.y + boxH > 720) doc.addPage();
        const top = doc.y;
        doc.rect(boxX, top, boxW, boxH).fill('#f3efe3');
        doc.rect(boxX, top, 4, boxH).fill('#d9a441');
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#0c2a1c').text('Assessment' + (chaps.length > 1 ? ' - ' + c.title : ''), boxX + 14, top + 9, { width: boxW - 28 });
        doc.font('Helvetica').fontSize(10.5).fillColor('#222222').text(c.assessment, boxX + 14, top + 26, { width: boxW - 28 });
        if (label) doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#0c2a1c').text('Result: ' + label, boxX + 14, top + 28 + textH, { width: boxW - 28 });
        doc.y = top + boxH; doc.x = 54;
      }

      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0c2a1c').text(r.coach_name ? `Coach ${r.coach_name}` : 'RCH Elite Training coaching staff');
      doc.font('Helvetica').fontSize(10).fillColor('#666666').text('RCH Elite Training');
      doc.end();
    } catch (err) { reject(err); }
  });
}

router.post('/admin/student-reports', requireAdmin, async (req, res) => {
  const { playerId, chapterId, coachName, body, month, send, assessmentResult, term, chapters } = req.body || {};
  if (!playerId) return res.status(400).json({ error: 'Please choose a child.' });
  if (!body || !String(body).trim()) return res.status(400).json({ error: 'Please write the report.' });
  try {
    const player = (await pool.query('SELECT * FROM players WHERE id = $1', [playerId])).rows[0];
    if (!player) return res.status(404).json({ error: 'Player not found.' });
    // Chapters: a list of { id, result }. (An older single chapterId is still accepted.)
    const wanted = Array.isArray(chapters) ? chapters : (chapterId ? [{ id: chapterId, result: assessmentResult }] : []);
    const chapList = [];
    for (const w of wanted.slice(0, 30)) {
      const c = (await pool.query('SELECT * FROM curriculum_chapters WHERE id = $1', [w && w.id])).rows[0];
      if (!c) continue;
      chapList.push({ id: c.id, title: c.title, assessment: String(c.assessment || ''), result: c.assessment && ASSESSMENT_LABELS[w.result] ? w.result : '' });
    }
    const termName = TERMS.includes(term) ? term : '';
    const m = parseMonth(month);
    const shouldSend = send !== false;
    if (shouldSend && !String(player.parent_email || '').trim()) {
      return res.status(400).json({ error: 'This player has no parent email on file. Add one on the roster first.' });
    }
    const row = {
      player_id: player.id, player_name: player.player_name, grade: player.grade,
      chapter_id: chapList[0] ? chapList[0].id : null, chapter_title: chapList.length ? chapList.map((c) => c.title).join('; ') : null,
      term: termName, chapters_json: JSON.stringify(chapList),
      month_key: monthKeyOf(m), month_label: monthLabel(m),
      coach_name: String(coachName || '').trim(), body: String(body).trim(),
      parent_name: player.parent_name || '', parent_email: player.parent_email || '',
      assessment_check: '', assessment_result: '',
    };
    const pdf = await buildReportPdf(row);
    const filename = `${row.player_name.replace(/[^a-z0-9]+/gi, '_')}_${MONTH_NAMES[m.month - 1]}_${m.year}_Report.pdf`;
    let emailed = false;
    if (shouldSend) {
      const result = await sendStudentReportEmail({
        to: row.parent_email, parentName: row.parent_name, childName: row.player_name,
        monthLabel: row.month_label, chapterTitle: row.chapter_title, term: row.term, pdf, filename,
      });
      emailed = !(result && result.ok === false);
      if (!emailed) return res.status(502).json({ error: 'The email could not be sent. Nothing was saved. Please try again.' });
    }
    const ins = await pool.query(
      `INSERT INTO student_reports
        (player_id, player_name, grade, chapter_id, chapter_title, month_key, month_label, coach_name, body, parent_name, parent_email, assessment_check, assessment_result, term, chapters_json, emailed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, ${emailed ? 'now()' : 'NULL'})
       RETURNING id`,
      [row.player_id, row.player_name, row.grade, row.chapter_id, row.chapter_title, row.month_key, row.month_label,
       row.coach_name, row.body, row.parent_name, row.parent_email, row.assessment_check, row.assessment_result, row.term, row.chapters_json]
    );
    res.status(201).json({ ok: true, id: ins.rows[0].id, emailed, to: emailed ? row.parent_email : null });
  } catch (err) {
    console.error('Student report error:', err);
    res.status(500).json({ error: 'Could not create this report.' });
  }
});

router.get('/admin/student-reports', requireAdmin, async (req, res) => {
  try {
    const grade = GRADES.includes(req.query.grade) ? req.query.grade : null;
    const r = await pool.query(
      `SELECT id, player_id, player_name, grade, term, chapter_title, month_label, coach_name, parent_email, emailed_at, created_at
       FROM student_reports ${grade ? 'WHERE grade = $1' : ''} ORDER BY created_at DESC LIMIT 200`,
      grade ? [grade] : []
    );
    res.json(r.rows);
  } catch (err) {
    console.error('List reports error:', err);
    res.status(500).json({ error: 'Could not load reports.' });
  }
});

router.post('/admin/student-reports/:id/email', requireAdmin, async (req, res) => {
  try {
    const row = (await pool.query('SELECT * FROM student_reports WHERE id = $1', [req.params.id])).rows[0];
    if (!row) return res.status(404).json({ error: 'Report not found.' });
    let to = String(row.parent_email || '').trim(), parentName = row.parent_name || '';
    if (row.player_id) {
      const pl = (await pool.query('SELECT parent_email, parent_name FROM players WHERE id = $1', [row.player_id])).rows[0];
      if (pl && String(pl.parent_email || '').trim()) { to = String(pl.parent_email).trim(); parentName = pl.parent_name || parentName; }
    }
    if (!to) return res.status(400).json({ error: 'This player has no parent email on file. Add one on the roster first.' });
    const full = Object.assign({}, row, { parent_email: to, parent_name: parentName });
    const pdf = await buildReportPdf(full);
    const filename = `${row.player_name.replace(/[^a-z0-9]+/gi, '_')}_${row.month_key}_Report.pdf`;
    const result = await sendStudentReportEmail({
      to, parentName, childName: row.player_name, monthLabel: row.month_label,
      chapterTitle: row.chapter_title, term: row.term, pdf, filename,
    });
    if (result && result.ok === false) return res.status(502).json({ error: 'The email could not be sent. Please try again.' });
    await pool.query('UPDATE student_reports SET emailed_at = now(), parent_email = $2, parent_name = $3 WHERE id = $1', [row.id, to, parentName]);
    res.json({ ok: true, to });
  } catch (err) {
    console.error('Email report error:', err);
    res.status(500).json({ error: 'Could not email this report.' });
  }
});

router.delete('/admin/student-reports/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM student_reports WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete report error:', err);
    res.status(500).json({ error: 'Could not delete this report.' });
  }
});

router.get('/admin/student-reports/:id/pdf', requireAdmin, async (req, res) => {
  try {
    const row = (await pool.query('SELECT * FROM student_reports WHERE id = $1', [req.params.id])).rows[0];
    if (!row) return res.status(404).json({ error: 'Report not found.' });
    const pdf = await buildReportPdf(row);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${row.player_name.replace(/[^a-z0-9]+/gi, '_')}_${row.month_key}_Report.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('Report PDF error:', err);
    res.status(500).json({ error: 'Could not build the PDF.' });
  }
});

/* ------------------------------- Attendance ------------------------------ */

const WEEKDAY_SHORT = { 2: 'Tue', 4: 'Thu' };

// Which of this month's practices a player is expected at.
//   two    → every Tuesday and Thursday
//   one    → only their chosen day (session_day)
//   online → none (no in-person practices)
function attendsOn(player, weekday) {
  if (player.session_type === 'two') return true;
  if (player.session_type === 'online') return false;
  const d = player.session_day;
  if (d === 'tuesday') return weekday === 2;
  if (d === 'thursday') return weekday === 4;
  return true; // one-session player with no day chosen yet: leave both open so nobody is left off
}

function buildAttendancePdf({ grades, byGrade, ym }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 36, size: 'LETTER', layout: 'landscape' });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const days = practiceDates(ym.year, ym.month);
      const left = 36;
      const pageW = 792;
      const nameW = 170;
      const sessW = 62;
      const gridW = pageW - left * 2 - nameW - sessW - 22;
      const colW = days.length ? Math.min(60, gridW / days.length) : 60;
      const rowH = 26;
      const box = 14;
      const bottom = 612 - 60;

      let firstPage = true;
      grades.forEach((g) => {
        const players = byGrade[g] || [];
        let page = 0;
        let i = 0;
        do {
          if (!firstPage) doc.addPage();
          firstPage = false;
          page += 1;
          let y = 36;
          doc.font('Helvetica-Bold').fontSize(16).fillColor('#0c2a1c').text(`RCH Elite Training — Attendance`, left, y);
          doc.font('Helvetica-Bold').fontSize(12).fillColor('#444444')
            .text(`${GRADE_LABELS[g]}  •  ${monthLabel(ym)}${page > 1 ? '  (continued)' : ''}`, left, y + 20);
          y += 46;

          const headY = y;
          doc.rect(left, headY, nameW + sessW + 22 + colW * days.length, rowH).fill('#0c2a1c');
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
          doc.text('#', left + 4, headY + 9, { width: 18 });
          doc.text('Player', left + 22, headY + 9, { width: nameW - 4 });
          doc.text('Sessions', left + 22 + nameW, headY + 9, { width: sessW });
          days.forEach((d, k) => {
            const x = left + 22 + nameW + sessW + k * colW;
            doc.text(`${WEEKDAY_SHORT[d.weekday]} ${ym.month}/${d.day}`, x, headY + 9, { width: colW, align: 'center' });
          });
          y = headY + rowH;

          let drawn = 0;
          while (i < players.length && y + rowH <= bottom) {
            const p = players[i];
            if (drawn % 2 === 1) doc.rect(left, y, nameW + sessW + 22 + colW * days.length, rowH).fill('#f3f1e8');
            doc.font('Helvetica').fontSize(10).fillColor('#000000');
            doc.text(String(i + 1), left + 4, y + 8, { width: 18 });
            doc.text(p.player_name, left + 22, y + 8, { width: nameW - 6 });
            const sess = p.session_type === 'two' ? '2 / week' : (p.session_type === 'online' ? 'Online' : (p.session_day === 'tuesday' ? '1 (Tue)' : p.session_day === 'thursday' ? '1 (Thu)' : '1 / week'));
            doc.fontSize(9).fillColor('#444444').text(sess, left + 22 + nameW, y + 8, { width: sessW });
            days.forEach((d, k) => {
              const cx = left + 22 + nameW + sessW + k * colW + (colW - box) / 2;
              if (attendsOn(p, d.weekday)) {
                doc.lineWidth(1).strokeColor('#164a30').rect(cx, y + (rowH - box) / 2, box, box).stroke();
              } else {
                doc.rect(cx, y + (rowH - box) / 2, box, box).fill('#d8d8d8');
              }
            });
            doc.strokeColor('#e2e2e2').lineWidth(0.5).moveTo(left, y + rowH).lineTo(left + 22 + nameW + sessW + colW * days.length, y + rowH).stroke();
            y += rowH; i += 1; drawn += 1;
          }
          if (!players.length) {
            doc.font('Helvetica-Oblique').fontSize(10).fillColor('#888888').text('No players on the roster for this grade.', left + 22, y + 8);
          }
          doc.font('Helvetica').fontSize(8).fillColor('#666666')
            .text('Open box = expected at practice (tick when present).  Grey box = not scheduled that day.   Coach: ________________________', left, 612 - 50, { width: pageW - left * 2 });
        } while (i < players.length);
      });
      doc.end();
    } catch (err) { reject(err); }
  });
}

router.get('/admin/attendance/pdf', requireAdmin, async (req, res) => {
  try {
    const ym = parseMonth(req.query.month);
    const wantAll = req.query.grade === 'all';
    if (!wantAll && !GRADES.includes(req.query.grade)) return res.status(400).json({ error: 'Please choose a grade.' });
    const grades = wantAll ? GRADES : [req.query.grade];
    const r = await pool.query(
      `SELECT player_name, grade, session_type, session_day FROM players
       WHERE archived_at IS NULL AND grade = ANY($1) ORDER BY grade, player_name`,
      [grades]
    );
    const byGrade = {};
    r.rows.forEach((p) => { (byGrade[p.grade] = byGrade[p.grade] || []).push(p); });
    const pdf = await buildAttendancePdf({ grades, byGrade, ym });
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="Attendance_${wantAll ? 'All-Grades' : req.query.grade}_${monthKeyOf(ym)}.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('Attendance PDF error:', err);
    res.status(500).json({ error: 'Could not build the attendance sheet.' });
  }
});

/* ---------------------------- RCH Calendar ---------------------------- */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const EVENT_COLORS = new Set(['green', 'gold', 'red', 'blue']);
const eventOut = (r) => ({ id: r.id, title: r.title, date: r.event_date, startTime: r.start_time, endTime: r.end_time, location: r.location, notes: r.notes, color: r.color });
function eventFields(b) {
  const title = String((b && b.title) || '').trim().slice(0, 160);
  if (!title) return { error: 'Please enter an event title.' };
  if (!ISO_DATE.test(String(b.date || ''))) return { error: 'Please enter a valid date.' };
  const startTime = String(b.startTime || '').trim();
  const endTime = String(b.endTime || '').trim();
  if (startTime && !TIME_RE.test(startTime)) return { error: 'Please enter a valid start time.' };
  if (endTime && !TIME_RE.test(endTime)) return { error: 'Please enter a valid end time.' };
  if (startTime && endTime && endTime <= startTime) return { error: 'The end time must be after the start time.' };
  return { values: [title, b.date, startTime, endTime, String(b.location || '').trim().slice(0, 200), String(b.notes || '').trim().slice(0, 4000), EVENT_COLORS.has(b.color) ? b.color : 'green'] };
}

router.get('/admin/calendar-events', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM calendar_events ORDER BY event_date, start_time, id');
    res.json(r.rows.map(eventOut));
  } catch (err) {
    console.error('List events error:', err);
    res.status(500).json({ error: 'Could not load the calendar.' });
  }
});

router.post('/admin/calendar-events', requireAdmin, async (req, res) => {
  const f = eventFields(req.body);
  if (f.error) return res.status(400).json({ error: f.error });
  try {
    const r = await pool.query(
      'INSERT INTO calendar_events (title, event_date, start_time, end_time, location, notes, color) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', f.values);
    res.status(201).json(eventOut(r.rows[0]));
  } catch (err) {
    console.error('Add event error:', err);
    res.status(500).json({ error: 'Could not save the event.' });
  }
});

router.put('/admin/calendar-events/:id', requireAdmin, async (req, res) => {
  const f = eventFields(req.body);
  if (f.error) return res.status(400).json({ error: f.error });
  try {
    const r = await pool.query(
      'UPDATE calendar_events SET title=$1, event_date=$2, start_time=$3, end_time=$4, location=$5, notes=$6, color=$7 WHERE id=$8 RETURNING *',
      [...f.values, req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Event not found.' });
    res.json(eventOut(r.rows[0]));
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Could not save the event.' });
  }
});

router.delete('/admin/calendar-events/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM calendar_events WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Could not delete the event.' });
  }
});

module.exports = router;
module.exports.attendsOn = attendsOn;
module.exports.buildAttendancePdf = buildAttendancePdf;
