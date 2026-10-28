// Sultans section: try outs, the Sultans roster flag, and league rosters (teams).
const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');
const pool = require('./pool');
const { requireAdmin } = require('./auth');
const { ageNumber, ageGroupLabel, seasonStartYear } = require('./ageGroups');

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
    `SELECT ltp.team_id, p.id, p.player_name, to_char(p.dob, 'YYYY-MM-DD') AS dob, p.grade, p.parent_name, p.parent_phone, p.parent_email, p.shirt_size
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
      const comp = team.league_type === 'competitive';
      const HEAD = comp ? '#0e1712' : '#17803f';       // black = competitive, green = recreational
      const SUB = comp ? '#9fe6bb' : '#e6f8ec';

      function banner() {
        doc.rect(0, 0, pageW, 96).fill(HEAD);
        doc.rect(0, 96, pageW / 2, 4).fill('#c8372d');
        doc.rect(pageW / 2, 96, pageW / 2, 4).fill('#1f9d4b');
        try { doc.image(path.join(__dirname, 'assets', 'sultans-logo.png'), left, 12, { height: 74 }); } catch (e) { /* logo is optional */ }
        doc.font('Helvetica-Bold').fontSize(22).fillColor('#ffffff').text(team.name, 130, 20, { width: pageW - 130 - left });
        doc.font('Helvetica').fontSize(11).fillColor(SUB);
        const bits = [team.age_label, team.league_type === 'competitive' ? 'Competitive' : 'Recreational'];
        if (team.season_start || team.season_end) bits.push('Season: ' + (fmtDate(team.season_start) || '?') + ' to ' + (fmtDate(team.season_end) || '?'));
        bits.push(team.players.length + (team.players.length === 1 ? ' player' : ' players'));
        doc.text(bits.join('   •   '), 130, 54, { width: pageW - 130 - left });
      }
      function head(y) {
        doc.rect(left, y, tableW, 22).fill(HEAD);
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


// ---- UTeams: automatic teams from the whole RCH roster, by date of birth -----------------------
// U-age here is by BIRTH YEAR (season end year - birth year). Early (E) = born Jan-Jul, Late (L) = born Aug-Dec.
//   U4-U5 | U6-U7L | U7E - U8L | U8E - U9L | U9E - U10L | U10E - U11L | U11E - U12
// If a team's usual late half is empty, the early kids play with the late side of their own year instead.
const UTEAM_DEFS = [
  { key: 'u4-u5',    name: 'U4-U5' },
  { key: 'u6-u7l',   name: 'U6-U7L' },
  { key: 'u7e-u8l',  name: 'U7E - U8L' },
  { key: 'u8e-u9l',  name: 'U8E - U9L' },
  { key: 'u9e-u10l', name: 'U9E - U10L' },
  { key: 'u10e-u11l', name: 'U10E - U11L' },
  { key: 'u11e-u12', name: 'U11E - U12' },
];
const MONTHS3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function uteamRanges(se) { // se = season end year
  return [
    'Born ' + (se - 5) + ' or later',
    'Aug ' + (se - 7) + ' - Dec ' + (se - 6),
    'Aug ' + (se - 8) + ' - Jul ' + (se - 7),
    'Aug ' + (se - 9) + ' - Jul ' + (se - 8),
    'Aug ' + (se - 10) + ' - Jul ' + (se - 9),
    'Aug ' + (se - 11) + ' - Jul ' + (se - 10),
    'Jul ' + (se - 11) + ' or earlier',
  ];
}

// Pure function (also used by tests): rows need { dob: 'YYYY-MM-DD' }. Returns { teams, noDob }.
function buildUTeams(rows, now) {
  const se = seasonStartYear(now) + 1;
  const ranges = uteamRanges(se);
  const teams = UTEAM_DEFS.map((d, i) => ({ key: d.key, name: d.name, range: ranges[i], players: [] }));
  const noDob = [];
  // Sort everyone into halves: half[n] = { E: [], L: [] } for n = 7..11; others go straight to a team.
  const half = {};
  for (let n = 7; n <= 11; n++) half[n] = { E: [], L: [] };
  const young = [], six = [], old = [];
  rows.forEach((r) => {
    const p = String(r.dob || '').slice(0, 10).split('-');
    const y = Number(p[0]), m = Number(p[1]);
    if (p.length !== 3 || !y || !m) { noDob.push(r); return; }
    const n = se - y;
    const side = m >= 8 ? 'L' : 'E';
    const item = Object.assign({}, r, { u_label: 'U' + Math.max(4, Math.min(n, 12)) + (n >= 7 && n <= 11 ? side : '') });
    if (n <= 5) young.push(item);
    else if (n === 6) six.push(item);
    else if (n >= 12) old.push(item);
    else half[n][side].push(item);
  });
  // team index: 0 U4-U5, 1 U6-U7L, 2 U7E-U8L, 3 U8E-U9L, 4 U9E-U10L, 5 U10E-U11L, 6 U11E-U12
  young.forEach((x) => teams[0].players.push(x));
  six.forEach((x) => teams[1].players.push(x));
  old.forEach((x) => teams[6].players.push(x));
  const lateTeam = (n) => (n === 7 ? 1 : n - 6);          // team that holds late(n)
  for (let n = 7; n <= 11; n++) {
    const early = half[n].E, late = half[n].L;
    const partnerLate = n === 11 ? old : half[n + 1].L;    // the usual partner of early(n)
    const own = n - 5;                                      // team U(n)E - U(n+1)L
    late.forEach((x) => { if (n >= 8) teams[lateTeam(n)].players.push(x); else teams[1].players.push(x); });
    const moves = early.length && !partnerLate.length && late.length;
    early.forEach((x) => {
      if (moves) { teams[lateTeam(n)].players.push(Object.assign(x, { moved: true })); }
      else teams[own].players.push(x);
    });
  }
  // late(n) for n>=8 lives in team lateTeam(n); (n=7 handled above)
  teams.forEach((t) => t.players.sort((a, b) => String(a.player_name).localeCompare(String(b.player_name))));
  return { teams, noDob, season: (se - 1) + '-' + String(se).slice(2) };
}

async function loadRchRoster() {
  const r = await pool.query(
    `SELECT id, player_name, to_char(dob, 'YYYY-MM-DD') AS dob, grade, parent_name, parent_phone, parent_email, shirt_size, rch, sultans
     FROM players WHERE archived_at IS NULL ORDER BY player_name`);
  return r.rows;
}

router.get('/admin/uteams', requireAdmin, async (req, res) => {
  try {
    const out = buildUTeams(await loadRchRoster());
    res.json({
      season: out.season,
      teams: out.teams.map((t) => ({ key: t.key, name: t.name, range: t.range, players: t.players.map((p) => ({
        id: p.id, player_name: p.player_name, dob: p.dob, grade: p.grade, parent_name: p.parent_name,
        parent_phone: p.parent_phone, u_label: p.u_label, moved: !!p.moved, sultans: !!p.sultans })) })),
      noDob: out.noDob.map((p) => ({ id: p.id, player_name: p.player_name, grade: p.grade })),
    });
  } catch (err) {
    console.error('UTeams error:', err);
    res.status(500).json({ error: 'Could not build the UTeams.' });
  }
});

router.get('/admin/uteams/:key/pdf', requireAdmin, async (req, res) => {
  try {
    const out = buildUTeams(await loadRchRoster());
    const t = out.teams.find((x) => x.key === req.params.key);
    if (!t) return res.status(404).json({ error: 'Team not found.' });
    const pdf = await buildTeamPdf({
      name: t.name + ' (UTeam)', age_label: t.range, league_type: 'recreational', description: '',
      season_start: null, season_end: null,
      players: t.players.map((p) => ({ ...p, age_group: ageGroupLabel(p.dob) })),
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="UTeam_' + t.key + '.pdf"' });
    res.send(pdf);
  } catch (err) {
    console.error('UTeam PDF error:', err);
    res.status(500).json({ error: 'Could not build the PDF.' });
  }
});

// ---- League-only players: sent to us by the league, not in RCH or Sultans (name only) ----
router.get('/admin/league-guests', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, created_at FROM league_guests ORDER BY lower(name)');
    res.json(r.rows);
  } catch (err) { console.error('List league guests error:', err); res.status(500).json({ error: 'Could not load the list.' }); }
});
router.post('/admin/league-guests', requireAdmin, async (req, res) => {
  const name = String((req.body && req.body.name) || '').trim().replace(/\s+/g, ' ').slice(0, 120);
  if (!name) return res.status(400).json({ error: "Please enter the player's name." });
  try {
    const r = await pool.query('INSERT INTO league_guests (name) VALUES ($1) RETURNING id, name, created_at', [name]);
    res.status(201).json(r.rows[0]);
  } catch (err) { console.error('Add league guest error:', err); res.status(500).json({ error: 'Could not add this player.' }); }
});
router.delete('/admin/league-guests/:id', requireAdmin, async (req, res) => {
  try { await pool.query('DELETE FROM league_guests WHERE id = $1', [req.params.id]); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: 'Could not delete.' }); }
});

module.exports = router;
module.exports.buildUTeams = buildUTeams;
