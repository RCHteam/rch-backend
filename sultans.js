// Sultans section: try outs, the Sultans roster flag, and league rosters (teams).
const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { ageNumber, ageGroupLabel } = require('./ageGroups');

const router = express.Router();

// ---- Sultans roster flag ----------------------------------------------------

// Send a player to the Sultans roster ({ in: true }) or take them off it ({ in: false }).
// Every Sultans player is also an RCH player. Taking a player off also removes them
// from any league roster they were on.
router.put('/admin/players/:id/sultans', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const isIn = !(req.body && req.body.in === false);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad player id.' });
  try {
    let r;
    if (isIn) {
      r = await pool.query(
        `UPDATE players SET sultans = true, rch = true,
                tryout_status = CASE WHEN tryout_status = 'tryout' THEN 'passed' ELSE tryout_status END
         WHERE id = $1 RETURNING *`, [id]);
    } else {
      r = await pool.query(`UPDATE players SET sultans = false, tryout_status = NULL WHERE id = $1 RETURNING *`, [id]);
      if (r.rows[0]) await pool.query('DELETE FROM league_team_players WHERE player_id = $1', [id]);
    }
    if (!r.rows[0]) return res.status(404).json({ error: 'Player not found.' });
    res.json({ ok: true, entry: r.rows[0] });
  } catch (err) {
    console.error('Sultans roster flag error:', err);
    res.status(500).json({ error: 'Could not update this player.' });
  }
});

// ---- Try outs ---------------------------------------------------------------

// Pass: the player moves into the Sultans roster. Fail: the player stays in RCH training only.
router.put('/admin/players/:id/tryout', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = req.body && req.body.result;
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad player id.' });
  if (!['pass', 'fail'].includes(result)) return res.status(400).json({ error: 'result must be "pass" or "fail".' });
  try {
    const cur = await pool.query('SELECT tryout_status FROM players WHERE id = $1', [id]);
    if (!cur.rows[0]) return res.status(404).json({ error: 'Player not found.' });
    if (cur.rows[0].tryout_status !== 'tryout') return res.status(409).json({ error: 'This player is not on the try outs list.' });
    const r = result === 'pass'
      ? await pool.query(`UPDATE players SET tryout_status = 'passed', sultans = true, rch = true WHERE id = $1 RETURNING *`, [id])
      : await pool.query(`UPDATE players SET tryout_status = 'failed' WHERE id = $1 RETURNING *`, [id]);
    res.json({ ok: true, entry: r.rows[0] });
  } catch (err) {
    console.error('Try outs result error:', err);
    res.status(500).json({ error: 'Could not save the try outs result.' });
  }
});

// ---- League rosters ---------------------------------------------------------

function ageLabelRange(from, to) {
  return from === to ? 'U' + from : 'U' + from + '-U' + to;
}
function cleanDate(v) {
  const s = String(v || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}
function parseTeamBody(b) {
  const name = String((b && b.name) || '').trim();
  const ageFrom = parseInt(b && b.ageFrom, 10);
  const ageTo = parseInt(b && b.ageTo, 10);
  if (!name) return { error: 'Please enter the league name.' };
  if (!(ageFrom >= 4 && ageFrom <= 12) || !(ageTo >= 4 && ageTo <= 12)) return { error: 'Pick the age range (U4 to U12).' };
  if (ageFrom > ageTo) return { error: 'The first age must be the same as or younger than the second age.' };
  const ids = Array.from(new Set(((b && b.playerIds) || []).map((x) => parseInt(x, 10)).filter(Number.isInteger)));
  return {
    name, ageFrom, ageTo, ids,
    seasonStart: cleanDate(b && b.seasonStart), seasonEnd: cleanDate(b && b.seasonEnd),
    description: String((b && b.description) || '').trim(),
    leagueType: (b && b.leagueType) === 'competitive' ? 'competitive' : 'recreational',
  };
}

async function loadTeams(onlyId) {
  const teams = await pool.query(
    `SELECT * FROM league_teams ${onlyId ? 'WHERE id = $1' : ''} ORDER BY created_at DESC, id DESC`,
    onlyId ? [onlyId] : []);
  const players = await pool.query(
    `SELECT ltp.team_id, p.id, p.player_name, p.dob, p.grade, p.parent_name, p.parent_phone, p.parent_email, p.shirt_size
     FROM league_team_players ltp
     JOIN players p ON p.id = ltp.player_id
     WHERE p.archived_at IS NULL AND p.sultans
     ${onlyId ? 'AND ltp.team_id = $1' : ''}
     ORDER BY p.player_name`,
    onlyId ? [onlyId] : []);
  return teams.rows.map((t) => ({
    ...t,
    season_start: t.season_start ? String(t.season_start.toISOString ? t.season_start.toISOString() : t.season_start).slice(0, 10) : null,
    season_end: t.season_end ? String(t.season_end.toISOString ? t.season_end.toISOString() : t.season_end).slice(0, 10) : null,
    age_label: ageLabelRange(t.age_from, t.age_to),
    players: players.rows.filter((p) => p.team_id === t.id).map((p) => ({ ...p, age_group: ageGroupLabel(p.dob) })),
  }));
}

router.get('/admin/league-teams', requireAdmin, async (req, res) => {
  try { res.json(await loadTeams()); }
  catch (err) { console.error('List league teams error:', err); res.status(500).json({ error: 'Could not load the league rosters.' }); }
});

async function saveTeamPlayers(client, teamId, ids) {
  await client.query('DELETE FROM league_team_players WHERE team_id = $1', [teamId]);
  if (!ids.length) return;
  // Only real Sultans-roster players can be added.
  await client.query(
    `INSERT INTO league_team_players (team_id, player_id)
     SELECT $1, id FROM players WHERE id = ANY($2::int[]) AND sultans AND archived_at IS NULL`,
    [teamId, ids]);
}

router.post('/admin/league-teams', requireAdmin, async (req, res) => {
  const t = parseTeamBody(req.body);
  if (t.error) return res.status(400).json({ error: t.error });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ins = await client.query(
      `INSERT INTO league_teams (name, season_start, season_end, age_from, age_to, description, league_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [t.name, t.seasonStart, t.seasonEnd, t.ageFrom, t.ageTo, t.description, t.leagueType]);
    await saveTeamPlayers(client, ins.rows[0].id, t.ids);
    await client.query('COMMIT');
    res.status(201).json({ ok: true, id: ins.rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Create league team error:', err);
    res.status(500).json({ error: 'Could not create this league roster.' });
  } finally { client.release(); }
});

router.put('/admin/league-teams/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const t = parseTeamBody(req.body);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id.' });
  if (t.error) return res.status(400).json({ error: t.error });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const upd = await client.query(
      `UPDATE league_teams SET name=$2, season_start=$3, season_end=$4, age_from=$5, age_to=$6, description=$7, league_type=$8
       WHERE id=$1 RETURNING id`,
      [id, t.name, t.seasonStart, t.seasonEnd, t.ageFrom, t.ageTo, t.description, t.leagueType]);
    if (!upd.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'League roster not found.' }); }
    await saveTeamPlayers(client, id, t.ids);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Update league team error:', err);
    res.status(500).json({ error: 'Could not save this league roster.' });
  } finally { client.release(); }
});

router.delete('/admin/league-teams/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id.' });
  try {
    await pool.query('DELETE FROM league_teams WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete league team error:', err);
    res.status(500).json({ error: 'Could not delete this league roster.' });
  }
});

// ---- PDF --------------------------------------------------------------------

function fmtDate(d) {
  const p = String(d || '').slice(0, 10).split('-');
  return p.length === 3 ? p[1] + '/' + p[2] + '/' + p[0] : '';
}

function buildTeamPdf(team) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 36, size: 'LETTER', layout: 'landscape' });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const left = 36, pageW = 792, pageH = 612, bottom = pageH - 50;
      const cols = [
        ['#', 24], ['Player', 150], ['Age', 52], ['DOB', 70], ['Size', 44],
        ['Parent', 120], ['Phone', 100], ['Email', 156],
      ];
      const tableW = cols.reduce((s, c) => s + c[1], 0);

      function banner() {
        doc.rect(0, 0, pageW, 96).fill('#0e1712');
        doc.rect(0, 96, pageW / 2, 4).fill('#c8372d');
        doc.rect(pageW / 2, 96, pageW / 2, 4).fill('#1f9d4b');
        try { doc.image(path.join(__dirname, 'assets', 'sultans-logo.png'), left, 12, { height: 74 }); } catch (e) { /* logo is optional */ }
        doc.font('Helvetica-Bold').fontSize(22).fillColor('#ffffff').text(team.name, 130, 20, { width: pageW - 130 - left });
        doc.font('Helvetica').fontSize(11).fillColor('#9fe6bb');
        const bits = [team.age_label, team.league_type === 'competitive' ? 'Competitive' : 'Recreational'];
        if (team.season_start || team.season_end) bits.push('Season: ' + (fmtDate(team.season_start) || '?') + ' to ' + (fmtDate(team.season_end) || '?'));
        bits.push(team.players.length + (team.players.length === 1 ? ' player' : ' players'));
        doc.text(bits.join('   •   '), 130, 54, { width: pageW - 130 - left });
      }
      function head(y) {
        doc.rect(left, y, tableW, 22).fill('#0e1712');
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
        let x = left;
        cols.forEach((c) => { doc.text(c[0], x + 4, y + 7, { width: c[1] - 6 }); x += c[1]; });
        return y + 22;
      }

      banner();
      let y = 112;
      if (team.description) {
        doc.font('Helvetica').fontSize(10).fillColor('#333333').text(team.description, left, y, { width: pageW - left * 2 });
        y = doc.y + 10;
      }
      y = head(y);
      const rowH = 22;
      team.players.forEach((p, i) => {
        if (y + rowH > bottom) { doc.addPage(); banner(); y = head(112); }
        if (i % 2 === 1) doc.rect(left, y, tableW, rowH).fill('#eef3ee');
        const cells = [String(i + 1), p.player_name, p.age_group || '', fmtDate(p.dob), p.shirt_size || '', p.parent_name || '', p.parent_phone || '', p.parent_email || ''];
        doc.font('Helvetica').fontSize(9).fillColor('#111111');
        let x = left;
        cells.forEach((v, k) => { doc.text(String(v), x + 4, y + 7, { width: cols[k][1] - 8, height: 12, ellipsis: true, lineBreak: false }); x += cols[k][1]; });
        doc.strokeColor('#d5ddd5').lineWidth(0.5).moveTo(left, y + rowH).lineTo(left + tableW, y + rowH).stroke();
        y += rowH;
      });
      if (!team.players.length) {
        doc.font('Helvetica-Oblique').fontSize(10).fillColor('#888888').text('No players have been added to this league roster yet.', left + 4, y + 8);
      }
      doc.font('Helvetica').fontSize(8).fillColor('#666666')
        .text('RCH Elite Training  •  Sultans FC', left, pageH - 36, { width: pageW - left * 2, align: 'center' });
      doc.end();
    } catch (err) { reject(err); }
  });
}

router.get('/admin/league-teams/:id/pdf', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id.' });
  try {
    const teams = await loadTeams(id);
    if (!teams[0]) return res.status(404).json({ error: 'League roster not found.' });
    const pdf = await buildTeamPdf(teams[0]);
    const safe = teams[0].name.replace(/[^A-Za-z0-9 _-]+/g, '').trim().replace(/\s+/g, '_') || 'league_roster';
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="' + safe + '.pdf"' });
    res.send(pdf);
  } catch (err) {
    console.error('League roster PDF error:', err);
    res.status(500).json({ error: 'Could not build the PDF.' });
  }
});

module.exports = router;
