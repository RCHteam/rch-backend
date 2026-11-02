// Family checklist: one line per child showing, right now, whether the family is
// on monthly billing, has signed the agreement, has filed the child info update,
// and has paid the kit fee. Data tab > Family Checklist (live numbers + PDF).
const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');
const pool = require('./pool');
const { requireAdmin } = require('./auth');

const router = express.Router();

// The owner's own family is left off the checklist.
const EXCLUDE = new Set(['mohammad ali', 'ismail rachidi']);
const norm = (v) => String(v == null ? '' : v).trim().toLowerCase();

async function gatherChecklist() {
  const players = (await pool.query(
    `SELECT id, player_name, parent_name, parent_email, parent_phone, paid_otherwise_at, paid_manual
       FROM players WHERE archived_at IS NULL`)).rows
    .filter((p) => !EXCLUDE.has(norm(p.player_name)));

  // Monthly billing: a completed payment link that has a Stripe subscription attached.
  const subs = new Set((await pool.query(
    `SELECT DISTINCT registration_id FROM payment_links
      WHERE registration_type = 'player' AND status = 'completed' AND stripe_subscription_id IS NOT NULL`)).rows
    .map((r) => String(r.registration_id)));

  // Agreements: signed if any copy is signed, "not signed" if one was sent.
  const ag = (await pool.query(
    `SELECT registration_type, registration_id, lower(player_name) AS n, lower(COALESCE(parent_email,'')) AS e, signed_at
       FROM agreements`)).rows;

  // Child info update ("size" requests): filed if the family answered, waiting if only sent.
  const size = (await pool.query(`SELECT children, responded_at FROM outreach_requests WHERE kind = 'size'`)).rows;
  const filed = new Set(), asked = new Set();
  size.forEach((r) => {
    const kids = Array.isArray(r.children) ? r.children : [];
    kids.forEach((k) => { (r.responded_at ? filed : asked).add(String(k.id)); });
  });

  // Kit fees by child name (practice and Sultans kits are combined).
  const kits = (await pool.query(`SELECT lower(trim(player_name)) AS n, paid_at, paid_method FROM kit_fees WHERE NOT hidden`)).rows;
  const kitBy = new Map();
  kits.forEach((k) => { const a = kitBy.get(k.n) || []; a.push(k); kitBy.set(k.n, a); });

  const rows = players.map((p) => {
    const mine = ag.filter((a) => (a.registration_type === 'player' && String(a.registration_id) === String(p.id)) ||
      (a.n === norm(p.player_name) && a.e === norm(p.parent_email)));
    const agreement = mine.some((a) => a.signed_at) ? 'signed' : (mine.length ? 'sent' : 'none');
    const info = filed.has(String(p.id)) ? 'filed' : (asked.has(String(p.id)) ? 'waiting' : 'none');
    const ks = kitBy.get(norm(p.player_name)) || [];
    let kit = 'none', kitNote = '';
    if (ks.length) {
      const paidN = ks.filter((k) => k.paid_at).length;
      kit = paidN === ks.length ? 'paid' : (paidN ? 'partly' : 'unpaid');
      const m = ks.find((k) => k.paid_method);
      if (kit === 'paid' && m) kitNote = m.paid_method === 'cash' ? 'Cash' : 'Zelle';
    }
    const billing = subs.has(String(p.id)) ? 'stripe' : (p.paid_otherwise_at ? 'other' : 'none');
    return { id: p.id, parent: p.parent_name || '', child: p.player_name, email: p.parent_email || '', phone: p.parent_phone || '',
      billing, agreement, info, kit, kitNote };
  });
  rows.sort((a, b) => a.parent.toLowerCase().localeCompare(b.parent.toLowerCase()) || a.child.localeCompare(b.child));

  const counts = {
    total: rows.length,
    stripe: rows.filter((r) => r.billing === 'stripe').length,
    signed: rows.filter((r) => r.agreement === 'signed').length,
    filed: rows.filter((r) => r.info === 'filed').length,
    kitPaid: rows.filter((r) => r.kit === 'paid').length,
  };
  return { rows, counts };
}

// ---- PDF (green, with the RCH logo, same look as the monthly report) ----
const LOGO_PATH = path.join(__dirname, 'assets', 'rch-logo.png');
const C = { dark: '#0c2a1c', green: '#164a30', mid: '#17803f', light: '#e6f2ea', zebra: '#f4f9f5', ink: '#1b2a22', muted: '#6b7a70' };
const GOOD = '#1f7a3d', BAD = '#b5482f', WARN = '#b07a10';
const PAGE_W = 792, PAGE_H = 612, MX = 36, CW = 720, BOTTOM = 44, ROW_H = 24;
const COLS = [
  { label: 'Parent', w: 100 }, { label: 'Child', w: 108 }, { label: 'Email', w: 150 }, { label: 'Phone', w: 84 },
  { label: 'Monthly billing', w: 76 }, { label: 'Agreement', w: 66 }, { label: 'Child info', w: 62 }, { label: 'Kit fee', w: 74 },
];

function cellStatus(r) {
  const billing = r.billing === 'stripe' ? ['In Stripe', GOOD] : (r.billing === 'other' ? ['Paid other way', WARN] : ['Not in Stripe', BAD]);
  const agreement = r.agreement === 'signed' ? ['Signed', GOOD] : (r.agreement === 'sent' ? ['Not signed', BAD] : ['Not sent', WARN]);
  const info = r.info === 'filed' ? ['Filed', GOOD] : (r.info === 'waiting' ? ['Waiting', BAD] : ['Not sent', WARN]);
  let kit;
  if (r.kit === 'paid') kit = ['Paid' + (r.kitNote ? ' (' + r.kitNote + ')' : ''), GOOD];
  else if (r.kit === 'partly') kit = ['Part paid', WARN];
  else if (r.kit === 'unpaid') kit = ['Not paid', BAD];
  else kit = ['Not sent', WARN];
  return [billing, agreement, info, kit];
}

function drawBand(doc, first, dateLabel) {
  if (first) {
    doc.rect(0, 0, PAGE_W, 78).fill(C.green);
    doc.rect(0, 78, PAGE_W, 4).fill(C.mid);
    try { doc.image(LOGO_PATH, MX, 14, { height: 50 }); } catch (e) { /* logo is optional */ }
    doc.fillColor('#b9e4c8').font('Helvetica-Bold').fontSize(9)
      .text('FAMILY CHECKLIST  |  ' + dateLabel.toUpperCase(), MX, 24, { width: CW, align: 'right', lineBreak: false });
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20)
      .text('Billing, agreement, info and kit', MX, 42, { width: CW, align: 'right', lineBreak: false });
    doc.y = 94;
  } else {
    doc.rect(0, 0, PAGE_W, 26).fill(C.green);
    doc.rect(0, 26, PAGE_W, 3).fill(C.mid);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text('RCH ELITE TRAINING', MX, 9, { lineBreak: false });
    doc.fillColor('#b9e4c8').font('Helvetica').fontSize(9)
      .text('Family checklist - ' + dateLabel, MX, 9, { width: CW, align: 'right', lineBreak: false });
    doc.y = 42;
  }
  doc.fillColor(C.ink).font('Helvetica').fontSize(8);
}

function drawHead(doc) {
  const y = doc.y;
  doc.rect(MX, y, CW, 20).fill(C.green);
  let x = MX;
  COLS.forEach((c) => {
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8).text(c.label, x + 6, y + 6, { width: c.w - 10, lineBreak: false });
    x += c.w;
  });
  doc.y = y + 20;
}

function buildChecklistPdf(data, dateLabel) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 36, size: 'LETTER', layout: 'landscape', bufferPages: true });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.on('pageAdded', () => { drawBand(doc, false, dateLabel); drawHead(doc); });

      drawBand(doc, true, dateLabel);
      const k = data.counts;
      doc.fillColor(C.muted).font('Helvetica-Oblique').fontSize(9).text(
        k.total + ' children.  In Stripe: ' + k.stripe + '.  Agreement signed: ' + k.signed + '.  Child info filed: ' + k.filed + '.  Kit paid: ' + k.kitPaid + '.',
        MX, doc.y, { width: CW, lineBreak: false });
      doc.y += 16;
      drawHead(doc);

      data.rows.forEach((r, i) => {
        if (doc.y + ROW_H > PAGE_H - BOTTOM) doc.addPage();
        const y = doc.y;
        if (i % 2 === 1) doc.rect(MX, y, CW, ROW_H).fill(C.zebra);
        const st = cellStatus(r);
        const texts = [r.parent, r.child, r.email, r.phone || '-'];
        let x = MX;
        COLS.forEach((c, n) => {
          if (n < 4) {
            doc.fillColor(C.ink).font('Helvetica').fontSize(8)
              .text(String(texts[n]), x + 6, y + 8, { width: c.w - 10, height: 10, ellipsis: true });
          } else {
            const s = st[n - 4];
            doc.fillColor(s[1]).font('Helvetica-Bold').fontSize(8).text(s[0], x + 6, y + 8, { width: c.w - 8, lineBreak: false });
          }
          x += c.w;
        });
        doc.y = y + ROW_H;
      });

      // Footer on every page.
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        doc.page.margins.bottom = 0;
        doc.rect(0, PAGE_H - 26, PAGE_W, 26).fill(C.green);
        doc.fillColor('#b9e4c8').font('Helvetica').fontSize(8)
          .text('RCH Elite Training  |  Allen, TX', MX, PAGE_H - 17, { lineBreak: false });
        doc.text('Page ' + (i + 1) + ' of ' + range.count, MX, PAGE_H - 17, { width: CW, align: 'right', lineBreak: false });
      }
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Live numbers for the Data tab panel.
router.get('/admin/family-checklist', requireAdmin, async (req, res) => {
  try {
    const d = await gatherChecklist();
    res.json(d.counts);
  } catch (err) {
    console.error('Family checklist error:', err);
    res.status(500).json({ error: 'Could not build the checklist.' });
  }
});

// Fresh PDF every time it is downloaded.
router.get('/admin/family-checklist/pdf', requireAdmin, async (req, res) => {
  try {
    const d = await gatherChecklist();
    const dateLabel = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Chicago' });
    const pdf = await buildChecklistPdf(d, dateLabel);
    const stamp = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="RCH-Family-Checklist-' + stamp + '.pdf"' });
    res.send(pdf);
  } catch (err) {
    console.error('Family checklist PDF error:', err);
    res.status(500).json({ error: 'Could not build the checklist PDF.' });
  }
});

module.exports = router;
module.exports.gatherChecklist = gatherChecklist;
module.exports.buildChecklistPdf = buildChecklistPdf;
