module.exports = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>RCH Elite Training — Admin</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{ --pitch-deep:#0c2a1c; --pitch:#164a30; --gold:#d9a441; --chalk:#f6f2e7; }
  *{ box-sizing:border-box; }
  body{ margin:0; font-family:-apple-system,Segoe UI,Roboto,sans-serif; background:#f4f1e8; color:#1c2a20; }
  header{ background:var(--pitch-deep); color:var(--chalk); padding:20px 28px; display:flex; align-items:center; justify-content:space-between; }
  header h1{ font-size:1.15rem; margin:0; }
  header button{ background:transparent; border:1px solid rgba(246,242,231,0.4); color:var(--chalk); padding:8px 14px; border-radius:6px; cursor:pointer; }
  main{ max-width:1100px; margin:0 auto; padding:28px; }
  #login-view{ max-width:360px; margin:80px auto; background:#fff; padding:30px; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.08); }
  #login-view h2{ margin-top:0; }
  #login-view input{ width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; margin:10px 0; font-size:1rem; }
  #login-view button{ width:100%; padding:10px; background:var(--gold); border:none; border-radius:6px; font-weight:700; cursor:pointer; }
  #login-error{ color:#b5482f; font-size:0.9rem; min-height:1.2em; }
  .summary{ display:flex; gap:16px; flex-wrap:wrap; margin-bottom:28px; }
  .card{ background:#fff; border-radius:8px; padding:18px 22px; box-shadow:0 4px 14px rgba(0,0,0,0.06); min-width:140px; }
  .card .n{ font-size:1.6rem; font-weight:800; color:var(--pitch); }
  .card .l{ font-size:0.8rem; color:#666; text-transform:uppercase; letter-spacing:0.05em; }
  table{ width:100%; border-collapse:collapse; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.06); margin-bottom:32px; font-size:0.88rem; }
  th, td{ text-align:left; padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; }
  th{ background:#f0ece0; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.04em; color:#555; }
  .section-head{ display:flex; align-items:center; justify-content:space-between; margin:0 0 12px; }
  .section-head h2{ margin:0; font-size:1.05rem; }
  .section-head select, .section-head a{ font-size:0.85rem; }
  a.btn-export{ background:var(--pitch); color:#fff; padding:7px 14px; border-radius:6px; text-decoration:none; }
  .hidden{ display:none; }
  .empty{ padding:20px; color:#888; font-style:italic; }
</style>
</head>
<body>

<div id="login-view">
  <h2>Admin login</h2>
  <input type="password" id="pw" placeholder="Password" autofocus>
  <button id="loginBtn">Log in</button>
  <p id="login-error"></p>
</div>

<div id="app-view" class="hidden">
  <header>
    <h1>RCH Elite Training — Registrations</h1>
    <button id="logoutBtn">Log out</button>
  </header>
  <main>
    <div class="summary" id="summary"></div>

    <div class="section-head">
      <h2>Skills Training</h2>
      <a class="btn-export" id="exportSkills" href="#">Export CSV</a>
    </div>
    <div id="skillsTableWrap"></div>

    <div class="section-head">
      <h2>Join Sultans FC</h2>
      <div>
        <select id="ageGroupFilter">
          <option value="">All age groups</option>
          <option value="4-5">4–5</option>
          <option value="6-7">6–7</option>
          <option value="8-9">8–9</option>
          <option value="10-11">10–11</option>
        </select>
        <a class="btn-export" id="exportJoin" href="#">Export CSV</a>
      </div>
    </div>
    <div id="joinTableWrap"></div>
  </main>
</div>

<script>
  // Point this at your deployed API if the dashboard is ever hosted separately
  // from the API. Leave as '' if the dashboard is served by the same server
  // (the default setup in server.js).
  const API_BASE = '';

  const loginView = document.getElementById('login-view');
  const appView = document.getElementById('app-view');
  const pwInput = document.getElementById('pw');
  const loginError = document.getElementById('login-error');

  function getToken(){ return sessionStorage.getItem('rch_admin_token'); }
  function setToken(t){ sessionStorage.setItem('rch_admin_token', t); }
  function clearToken(){ sessionStorage.removeItem('rch_admin_token'); }

  async function api(path, opts = {}){
    const res = await fetch(API_BASE + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + getToken(),
        ...(opts.headers || {}),
      },
    });
    if (res.status === 401) { clearToken(); showLogin(); throw new Error('Unauthorized'); }
    return res.json();
  }

  function showLogin(){
    loginView.classList.remove('hidden');
    appView.classList.add('hidden');
  }
  function showApp(){
    loginView.classList.add('hidden');
    appView.classList.remove('hidden');
    loadAll();
  }

  document.getElementById('loginBtn').addEventListener('click', async () => {
    loginError.textContent = '';
    const password = pwInput.value;
    try {
      const res = await fetch(API_BASE + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) { setToken(password); showApp(); }
      else loginError.textContent = data.error || 'Login failed.';
    } catch (e) { loginError.textContent = 'Could not reach the server.'; }
  });
  pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('loginBtn').click(); });

  document.getElementById('logoutBtn').addEventListener('click', () => { clearToken(); showLogin(); });

  function renderTable(rows, columns){
    if (!rows.length) return '<div class="empty">No entries yet.</div>';
    let html = '<table><thead><tr>' + columns.map(c => \`<th>\${c.label}</th>\`).join('') + '</tr></thead><tbody>';
    for (const row of rows) {
      html += '<tr>' + columns.map(c => \`<td>\${row[c.key] ?? ''}</td>\`).join('') + '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  async function loadSummary(){
    const s = await api('/api/admin/summary');
    const groups = ['4-5','6-7','8-9','10-11'];
    const counts = Object.fromEntries(groups.map(g => [g, 0]));
    (s.joinCountsByAgeGroup || []).forEach(r => { counts[r.age_group] = r.n; });
    document.getElementById('summary').innerHTML = \`
      <div class="card"><div class="n">\${s.skillsTrainingCount}</div><div class="l">Skills Training</div></div>
      \${groups.map(g => \`<div class="card"><div class="n">\${counts[g]}</div><div class="l">Join FC \${g}</div></div>\`).join('')}
    \`;
  }

  async function loadSkills(){
    const rows = await api('/api/admin/skills-registrations');
    document.getElementById('skillsTableWrap').innerHTML = renderTable(rows, [
      { key:'jersey_number', label:'#' },
      { key:'full_name', label:'Name' },
      { key:'dob', label:'DOB' },
      { key:'email', label:'Email' },
      { key:'phone', label:'Phone' },
      { key:'team', label:'Team' },
      { key:'experience', label:'Experience' },
      { key:'submitted_at', label:'Submitted' },
    ]);
  }

  async function loadJoin(){
    const ageGroup = document.getElementById('ageGroupFilter').value;
    const rows = await api('/api/admin/join-registrations' + (ageGroup ? '?ageGroup=' + encodeURIComponent(ageGroup) : ''));
    document.getElementById('joinTableWrap').innerHTML = renderTable(rows, [
      { key:'jersey_number', label:'#' },
      { key:'age_group', label:'Group' },
      { key:'child_name', label:'Player' },
      { key:'dob', label:'DOB' },
      { key:'parent_name', label:'Parent' },
      { key:'email', label:'Email' },
      { key:'phone', label:'Phone' },
      { key:'availability', label:'Availability' },
      { key:'submitted_at', label:'Submitted' },
    ]);
  }

  function wireExportLinks(){
    document.getElementById('exportSkills').addEventListener('click', (e) => {
      e.preventDefault();
      window.open(API_BASE + '/api/admin/export/skills.csv?token=' + encodeURIComponent(getToken()));
    });
    document.getElementById('exportJoin').addEventListener('click', (e) => {
      e.preventDefault();
      const ageGroup = document.getElementById('ageGroupFilter').value;
      const params = new URLSearchParams({ token: getToken() });
      if (ageGroup) params.set('ageGroup', ageGroup);
      window.open(API_BASE + '/api/admin/export/join.csv?' + params.toString());
    });
    document.getElementById('ageGroupFilter').addEventListener('change', loadJoin);
  }

  async function loadAll(){
    await Promise.all([loadSummary(), loadSkills(), loadJoin()]);
  }

  wireExportLinks();
  if (getToken()) showApp(); else showLogin();
</script>
</body>
</html>
`;
