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
  .btn-delete-row{ background:#fff; border:1px solid #d98a76; color:#b5482f; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; }
  .btn-delete-row:hover{ background:#b5482f; color:#fff; }
  .btn-delete-row:disabled{ opacity:0.6; cursor:default; }
  .btn-payment-link{ background:#fff; border:1px solid var(--pitch); color:var(--pitch); padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; white-space:nowrap; }
  .btn-payment-link:hover{ background:var(--pitch); color:#fff; }
  .btn-payment-link:disabled{ opacity:0.6; cursor:default; }
  td:last-child, th:last-child{ white-space:nowrap; }
  .switch-row{ display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.85rem; color:#333; user-select:none; }
  .switch-row input{ position:absolute; opacity:0; width:0; height:0; }
  .switch-track{ position:relative; width:38px; height:22px; background:#c9c2ab; border-radius:20px; transition:background .18s ease; flex-shrink:0; }
  .switch-thumb{ position:absolute; top:2px; left:2px; width:18px; height:18px; background:#fff; border-radius:50%; transition:transform .18s ease; box-shadow:0 1px 3px rgba(0,0,0,0.3); }
  .switch-row input:checked + .switch-track{ background:#2f8f57; }
  .switch-row input:checked + .switch-track .switch-thumb{ transform:translateX(16px); }
  .switch-row input:disabled + .switch-track{ opacity:0.5; cursor:default; }
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
      <div style="display:flex; align-items:center; gap:14px;">
        <label class="switch-row">
          <input type="checkbox" id="skillsOpenToggle">
          <span class="switch-track"><span class="switch-thumb"></span></span>
          <span id="skillsOpenLabel">Registration open</span>
        </label>
        <a class="btn-export" id="exportSkills" href="#">Export CSV</a>
      </div>
    </div>
    <div id="skillsTableWrap"></div>

    <div class="section-head">
      <h2>Join Sultans FC</h2>
      <div>
        <select id="ageGroupFilter">
          <option value="">All grades</option>
          <option value="pre-k">Pre-K</option>
          <option value="kindergarten">Kindergarten</option>
          <option value="1st-grade">1st Grade</option>
          <option value="2nd-grade">2nd Grade</option>
          <option value="3rd-grade">3rd Grade</option>
          <option value="4th-grade">4th Grade</option>
          <option value="5th-grade">5th Grade</option>
          <option value="6th-grade">6th Grade</option>
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

  function renderTable(rows, columns, opts = {}){
    if (!rows.length) return '<div class="empty">No entries yet.</div>';
    const hasActions = opts.onDelete || opts.onPaymentLink;
    const cols = hasActions ? [...columns, { key:'__actions', label:'' }] : columns;
    let html = '<table><thead><tr>' + cols.map(c => \`<th>\${c.label}</th>\`).join('') + '</tr></thead><tbody>';
    for (const row of rows) {
      html += '<tr>' + columns.map(c => \`<td>\${row[c.key] ?? ''}</td>\`).join('');
      if (hasActions) {
        html += '<td style="display:flex; gap:6px;">';
        if (opts.onPaymentLink) {
          html += \`<button type="button" class="btn-payment-link" data-id="\${row[opts.idKey || 'id']}">Send Payment Link</button>\`;
        }
        if (opts.onDelete) {
          html += \`<button type="button" class="btn-delete-row" data-id="\${row[opts.idKey || 'id']}">Delete</button>\`;
        }
        html += '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  function wirePaymentLinkButtons(wrapId, registrationType, onSent){
    const wrap = document.getElementById(wrapId);
    wrap.querySelectorAll('.btn-payment-link').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const seasonEndDate = prompt('Season end date (YYYY-MM-DD) — monthly billing stops automatically on this date:');
        if (!seasonEndDate) return;
        if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(seasonEndDate)) {
          alert('Please enter the date as YYYY-MM-DD, e.g. 2026-12-15.');
          return;
        }
        btn.disabled = true;
        btn.textContent = 'Sending…';
        try {
          const result = await api('/api/admin/payment-links', {
            method: 'POST',
            body: JSON.stringify({ registrationType, registrationId: id, seasonEndDate }),
          });
          alert('Payment link sent to ' + result.entry.email + '.\\n\\nLink (in case you want to copy it too):\\n' + result.link);
          await onSent();
        } catch (e) {
          alert('Could not send the payment link. Please try again.');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Send Payment Link';
        }
      });
    });
  }

  function wireDeleteButtons(wrapId, onDelete){
    const wrap = document.getElementById(wrapId);
    wrap.querySelectorAll('.btn-delete-row').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Delete this registration? This cannot be undone, and will free up the slot immediately.')) return;
        btn.disabled = true;
        btn.textContent = 'Deleting…';
        try {
          await onDelete(id);
        } catch (e) {
          alert('Could not delete this registration. Please try again.');
          btn.disabled = false;
          btn.textContent = 'Delete';
        }
      });
    });
  }

  async function loadSummary(){
    const s = await api('/api/admin/summary');
    const groups = ['pre-k','kindergarten','1st-grade','2nd-grade','3rd-grade','4th-grade','5th-grade','6th-grade'];
    const groupLabels = {
      'pre-k':'Pre-K', 'kindergarten':'Kindergarten', '1st-grade':'1st Grade', '2nd-grade':'2nd Grade',
      '3rd-grade':'3rd Grade', '4th-grade':'4th Grade', '5th-grade':'5th Grade', '6th-grade':'6th Grade',
    };
    const counts = Object.fromEntries(groups.map(g => [g, 0]));
    (s.joinCountsByAgeGroup || []).forEach(r => { counts[r.age_group] = r.n; });
    document.getElementById('summary').innerHTML = \`
      <div class="card"><div class="n">\${s.skillsTrainingCount}</div><div class="l">Skills Training</div></div>
      \${groups.map(g => \`<div class="card"><div class="n">\${counts[g]}</div><div class="l">Join FC \${groupLabels[g]}</div></div>\`).join('')}
    \`;
  }

  function paymentLabel(status){
    if (status === 'completed') return 'Paid';
    if (status === 'canceled') return 'Canceled';
    if (status === 'pending') return 'Link sent';
    return 'Not sent';
  }

  async function loadSkills(){
    const rows = await api('/api/admin/skills-registrations');
    const displayRows = rows.map(r => ({ ...r, payment_status: paymentLabel(r.payment_status) }));
    document.getElementById('skillsTableWrap').innerHTML = renderTable(displayRows, [
      { key:'jersey_number', label:'#' },
      { key:'full_name', label:'Name' },
      { key:'dob', label:'DOB' },
      { key:'email', label:'Email' },
      { key:'phone', label:'Phone' },
      { key:'team', label:'Team' },
      { key:'experience', label:'Experience' },
      { key:'payment_status', label:'Payment' },
      { key:'submitted_at', label:'Submitted' },
    ], { onDelete: true, onPaymentLink: true });
    wireDeleteButtons('skillsTableWrap', async (id) => {
      await api('/api/admin/skills-registrations/' + id, { method: 'DELETE' });
      await Promise.all([loadSummary(), loadSkills()]);
    });
    wirePaymentLinkButtons('skillsTableWrap', 'skills', loadSkills);
  }

  const GRADE_LABELS = {
    'pre-k':'Pre-K', 'kindergarten':'Kindergarten', '1st-grade':'1st Grade', '2nd-grade':'2nd Grade',
    '3rd-grade':'3rd Grade', '4th-grade':'4th Grade', '5th-grade':'5th Grade', '6th-grade':'6th Grade',
  };

  async function loadJoin(){
    const ageGroup = document.getElementById('ageGroupFilter').value;
    const rows = await api('/api/admin/join-registrations' + (ageGroup ? '?ageGroup=' + encodeURIComponent(ageGroup) : ''));
    const displayRows = rows.map(r => ({ ...r, age_group: GRADE_LABELS[r.age_group] || r.age_group, payment_status: paymentLabel(r.payment_status) }));
    document.getElementById('joinTableWrap').innerHTML = renderTable(displayRows, [
      { key:'jersey_number', label:'#' },
      { key:'age_group', label:'Grade' },
      { key:'child_name', label:'Player' },
      { key:'dob', label:'DOB' },
      { key:'parent_name', label:'Parent' },
      { key:'email', label:'Email' },
      { key:'phone', label:'Phone' },
      { key:'availability', label:'Availability' },
      { key:'payment_status', label:'Payment' },
      { key:'submitted_at', label:'Submitted' },
    ], { onDelete: true, onPaymentLink: true });
    wireDeleteButtons('joinTableWrap', async (id) => {
      await api('/api/admin/join-registrations/' + id, { method: 'DELETE' });
      await Promise.all([loadSummary(), loadJoin()]);
    });
    wirePaymentLinkButtons('joinTableWrap', 'join', loadJoin);
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

  async function loadSkillsToggle(){
    const s = await api('/api/admin/settings');
    const toggle = document.getElementById('skillsOpenToggle');
    const label = document.getElementById('skillsOpenLabel');
    toggle.checked = !!s.skillsTrainingOpen;
    label.textContent = s.skillsTrainingOpen ? 'Registration open' : 'Registration closed';
  }

  document.getElementById('skillsOpenToggle').addEventListener('change', async (e) => {
    const toggle = e.target;
    const label = document.getElementById('skillsOpenLabel');
    const desiredState = toggle.checked;
    toggle.disabled = true;
    try {
      const result = await api('/api/admin/settings/skills-training', {
        method: 'POST',
        body: JSON.stringify({ open: desiredState }),
      });
      toggle.checked = !!result.skillsTrainingOpen;
      label.textContent = result.skillsTrainingOpen ? 'Registration open' : 'Registration closed';
    } catch (err) {
      toggle.checked = !desiredState;
      alert('Could not update the Skills Training toggle. Please try again.');
    } finally {
      toggle.disabled = false;
    }
  });

  async function loadAll(){
    await Promise.all([loadSummary(), loadSkills(), loadJoin(), loadSkillsToggle()]);
  }

  wireExportLinks();
  if (getToken()) showApp(); else showLogin();
</script>
</body>
</html>
`;
