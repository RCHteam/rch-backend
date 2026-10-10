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
  const { grade, title, content } = req.body || {};
  if (!GRADES.includes(grade)) return res.status(400).json({ error: 'Please choose a grade.' });
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Please enter a chapter title.' });
  try {
    const r = await pool.query(
      `INSERT INTO curriculum_chapters (grade, position, title, content)
       VALUES ($1, COALESCE((SELECT MAX(position) FROM curriculum_chapters WHERE grade = $1), 0) + 1, $2, $3)
       RETURNING *`,
      [grade, String(title).trim(), String(content || '')]
    );
    res.status(201).json({ ok: true, entry: r.rows[0] });
  } catch (err) {
    console.error('Add chapter error:', err);
    res.status(500).json({ error: 'Could not add this chapter.' });
  }
});

router.put('/admin/curriculum/:id', requireAdmin, async (req, res) => {
  const { title, content } = req.body || {};
  if (title !== undefined && !String(title).trim()) return res.status(400).json({ error: 'Title can not be empty.' });
  try {
    const r = await pool.query(
      `UPDATE curriculum_chapters SET title = COALESCE($1, title), content = COALESCE($2, content) WHERE id = $3 RETURNING *`,
      [title !== undefined ? String(title).trim() : null, content !== undefined ? String(content) : null, req.params.id]
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
      if (r.chapter_title) doc.moveDown(0.3).text(`Chapter: ${r.chapter_title}`);
      doc.moveDown(0.8);
      doc.moveTo(54, doc.y).lineTo(558, doc.y).lineWidth(1).strokeColor('#d9a441').stroke();
      doc.moveDown(0.8);

      if (r.parent_name) doc.font('Helvetica').fontSize(11).fillColor('#000000').text(`Dear ${r.parent_name},`).moveDown(0.6);
      doc.font('Helvetica').fontSize(11).fillColor('#000000').text(String(r.body || ''), { align: 'left', lineGap: 3 });

      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0c2a1c').text(r.coach_name ? `Coach ${r.coach_name}` : 'RCH Elite Training coaching staff');
      doc.font('Helvetica').fontSize(10).fillColor('#666666').text('RCH Elite Training');
      doc.end();
    } catch (err) { reject(err); }
  });
}

router.post('/admin/student-reports', requireAdmin, async (req, res) => {
  const { playerId, chapterId, coachName, body, month, send } = req.body || {};
  if (!playerId) return res.status(400).json({ error: 'Please choose a child.' });
  if (!body || !String(body).trim()) return res.status(400).json({ error: 'Please write the report.' });
  try {
    const player = (await pool.query('SELECT * FROM players WHERE id = $1', [playerId])).rows[0];
    if (!player) return res.status(404).json({ error: 'Player not found.' });
    let chapter = null;
    if (chapterId) chapter = (await pool.query('SELECT * FROM curriculum_chapters WHERE id = $1', [chapterId])).rows[0] || null;
    const m = parseMonth(month);
    const shouldSend = send !== false;
    if (shouldSend && !String(player.parent_email || '').trim()) {
      return res.status(400).json({ error: 'This player has no parent email on file. Add one on the roster first.' });
    }
    const row = {
      player_id: player.id, player_name: player.player_name, grade: player.grade,
      chapter_id: chapter ? chapter.id : null, chapter_title: chapter ? chapter.title : null,
      month_key: monthKeyOf(m), month_label: monthLabel(m),
      coach_name: String(coachName || '').trim(), body: String(body).trim(),
      parent_name: player.parent_name || '', parent_email: player.parent_email || '',
    };
    const pdf = await buildReportPdf(row);
    const filename = `${row.player_name.replace(/[^a-z0-9]+/gi, '_')}_${MONTH_NAMES[m.month - 1]}_${m.year}_Report.pdf`;
    let emailed = false;
    if (shouldSend) {
      const result = await sendStudentReportEmail({
        to: row.parent_email, parentName: row.parent_name, childName: row.player_name,
        monthLabel: row.month_label, chapterTitle: row.chapter_title, pdf, filename,
      });
      emailed = !(result && result.ok === false);
      if (!emailed) return res.status(502).json({ error: 'The email could not be sent. Nothing was saved. Please try again.' });
    }
    const ins = await pool.query(
      `INSERT INTO student_reports
        (player_id, player_name, grade, chapter_id, chapter_title, month_key, month_label, coach_name, body, parent_name, parent_email, emailed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, ${emailed ? 'now()' : 'NULL'})
       RETURNING id`,
      [row.player_id, row.player_name, row.grade, row.chapter_id, row.chapter_title, row.month_key, row.month_label,
       row.coach_name, row.body, row.parent_name, row.parent_email]
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
      `SELECT id, player_id, player_name, grade, chapter_title, month_label, coach_name, parent_email, emailed_at, created_at
       FROM student_reports ${grade ? 'WHERE grade = $1' : ''} ORDER BY created_at DESC LIMIT 200`,
      grade ? [grade] : []
    );
    res.json(r.rows);
  } catch (err) {
    console.error('List reports error:', err);
    res.status(500).json({ error: 'Could not load reports.' });
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

module.exports = router;
module.exports.attendsOn = attendsOn;
module.exports.buildAttendancePdf = buildAttendancePdf;
