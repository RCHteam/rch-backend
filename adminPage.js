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
  .btn-add{ background:var(--gold); color:#1c2a20; border:none; padding:7px 14px; border-radius:6px; font-weight:700; cursor:pointer; font-size:0.85rem; }
  .modal-overlay{ position:fixed; inset:0; background:rgba(12,42,28,0.55); display:flex; align-items:center; justify-content:center; z-index:50; padding:16px; }
  .modal-overlay.hidden{ display:none; }
  .modal{ background:#fff; border-radius:10px; padding:26px 28px; width:100%; max-width:440px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.3); }
  .modal h3{ margin:0 0 4px; font-size:1.1rem; }
  .modal .modal-sub{ color:#666; font-size:0.85rem; margin-bottom:6px; }
  .modal label{ display:block; font-size:0.8rem; font-weight:600; color:#444; margin:14px 0 5px; }
  .modal select, .modal input, .modal textarea{ width:100%; padding:9px 10px; border:1px solid #ddd; border-radius:6px; font-size:0.92rem; font-family:inherit; }
  .modal textarea{ resize:vertical; min-height:56px; }
  .modal .modal-amounts{ background:#f4f1e8; border-radius:6px; padding:10px 12px; margin-top:16px; font-size:0.85rem; color:#333; line-height:1.5; }
  .modal .modal-actions{ display:flex; gap:10px; margin-top:22px; }
  .modal .modal-actions button{ flex:1; padding:10px; border-radius:6px; font-weight:700; cursor:pointer; border:none; font-size:0.92rem; }
  .modal .btn-cancel{ background:#eee; color:#333; }
  .modal .btn-send{ background:var(--pitch); color:#fff; }
  .modal .btn-send:disabled{ opacity:0.6; cursor:default; }
  .modal .modal-error{ color:#b5482f; font-size:0.85rem; margin-top:10px; min-height:1.1em; }
  .modal .two-col{ display:flex; gap:10px; }
  .modal .two-col > div{ flex:1; }
  .checkbox-row{ display:flex; align-items:center; gap:6px; margin-top:14px; }
  .checkbox-row input[type="checkbox"]{ width:auto; }
  .checkbox-row label{ margin:0; font-weight:400; }
  .pricing-box{ background:#fff; border-radius:8px; padding:18px 22px; box-shadow:0 4px 14px rgba(0,0,0,0.06); margin-bottom:20px; display:flex; align-items:flex-end; gap:20px; flex-wrap:wrap; }
  .pricing-box label{ display:block; font-size:0.8rem; font-weight:600; color:#444; }
  .pricing-box input{ margin-top:5px; padding:8px 10px; border:1px solid #ddd; border-radius:6px; font-size:0.92rem; width:140px; }
  .pricing-saved{ color:#2f8f57; font-size:0.85rem; font-weight:600; }
  table tfoot td, table tr.grand-total td{ font-weight:700; background:#f0ece0; }
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
        <button type="button" class="btn-add" id="addSkillsBtn">+ Add Registration</button>
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
        <button type="button" class="btn-add" id="addJoinBtn">+ Add Registration</button>
        <a class="btn-export" id="exportJoin" href="#">Export CSV</a>
      </div>
    </div>
    <div id="joinTableWrap"></div>

    <div class="section-head">
      <h2>Players Roster</h2>
      <div style="display:flex; align-items:center; gap:14px;">
        <select id="rosterGradeFilter">
          <option value="pre-k">Pre-K</option>
          <option value="kindergarten">Kindergarten</option>
          <option value="1st-grade">1st Grade</option>
          <option value="2nd-grade">2nd Grade</option>
          <option value="3rd-grade">3rd Grade</option>
          <option value="4th-grade">4th Grade</option>
          <option value="5th-grade">5th Grade</option>
          <option value="6th-grade">6th Grade</option>
        </select>
        <button type="button" class="btn-add" id="addPlayerBtn">+ Add Player</button>
      </div>
    </div>
    <div id="rosterTableWrap"></div>

    <div class="section-head">
      <h2>Season Overview — All Grades</h2>
    </div>
    <div id="overviewTableWrap"></div>

    <div class="section-head">
      <h2>Pricing &amp; Revenue</h2>
    </div>
    <div class="pricing-box">
      <div>
        <label for="priceOneInput">Price per Player — One Session</label>
        <input type="number" id="priceOneInput" min="0" step="0.01">
      </div>
      <div>
        <label for="priceTwoInput">Price per Player — Two Sessions</label>
        <input type="number" id="priceTwoInput" min="0" step="0.01">
      </div>
      <button type="button" class="btn-add" id="savePricingBtn">Save Prices</button>
      <span class="pricing-saved" id="pricingSaved"></span>
    </div>
    <div id="revenueTableWrap"></div>
  </main>
</div>

<div class="modal-overlay hidden" id="addPlayerModal">
  <div class="modal">
    <h3>Add Player</h3>
    <label for="apGrade">Grade</label>
    <select id="apGrade">
      <option value="pre-k">Pre-K</option>
      <option value="kindergarten">Kindergarten</option>
      <option value="1st-grade">1st Grade</option>
      <option value="2nd-grade">2nd Grade</option>
      <option value="3rd-grade">3rd Grade</option>
      <option value="4th-grade">4th Grade</option>
      <option value="5th-grade">5th Grade</option>
      <option value="6th-grade">6th Grade</option>
    </select>
    <label for="apName">Player name</label>
    <input type="text" id="apName">
    <label for="apDob">Date of birth</label>
    <input type="date" id="apDob">
    <div class="two-col">
      <div><label for="apParentName">Parent name</label><input type="text" id="apParentName"></div>
      <div><label for="apParentPhone">Parent phone</label><input type="text" id="apParentPhone"></div>
    </div>
    <label for="apParentEmail">Parent email</label>
    <input type="email" id="apParentEmail">
    <label for="apSessions">Sessions</label>
    <select id="apSessions">
      <option value="one">One</option>
      <option value="two">Two</option>
    </select>
    <div class="two-col">
      <div class="checkbox-row"><input type="checkbox" id="apRch"><label for="apRch">RCH</label></div>
      <div class="checkbox-row"><input type="checkbox" id="apSultans"><label for="apSultans">Sultans</label></div>
    </div>
    <label for="apDiscount">Discount ($)</label>
    <input type="number" id="apDiscount" min="0" step="0.01" value="0">
    <p class="modal-error" id="addPlayerError"></p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" id="addPlayerCancel">Cancel</button>
      <button type="button" class="btn-send" id="addPlayerSubmit">Add</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="paymentModal">
  <div class="modal">
    <h3>Send Payment Link</h3>
    <p class="modal-sub" id="paymentModalSub"></p>
    <label for="tierSelect">Service</label>
    <select id="tierSelect">
      <option value="one">1x per week — $62.10/mo</option>
      <option value="two">2x per week — $123.89/mo</option>
    </select>
    <label for="seasonSelect">Season</label>
    <select id="seasonSelect">
      <option value="fall">Fall</option>
      <option value="winterbreak">Winter Break</option>
      <option value="spring">Spring</option>
      <option value="summer">Summer</option>
    </select>
    <label for="seasonEndInput">Billing ends on</label>
    <input type="date" id="seasonEndInput">
    <div class="modal-amounts" id="modalAmounts"></div>
    <p class="modal-error" id="paymentModalError"></p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" id="paymentModalCancel">Cancel</button>
      <button type="button" class="btn-send" id="paymentModalSend">Send Link</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="addSkillsModal">
  <div class="modal">
    <h3>Add Skills Training Registration</h3>
    <p class="modal-sub">For a family you know personally who didn't register on the website.</p>
    <label for="asFullName">Full name</label>
    <input type="text" id="asFullName">
    <label for="asDob">Date of birth</label>
    <input type="date" id="asDob">
    <label for="asEmail">Email</label>
    <input type="email" id="asEmail">
    <label for="asPhone">Phone (+1 followed by 10 digits)</label>
    <input type="text" id="asPhone" placeholder="+12145551234">
    <label for="asTeam">Team</label>
    <input type="text" id="asTeam">
    <label for="asExperience">Experience</label>
    <input type="text" id="asExperience">
    <label for="asNotes">Notes</label>
    <textarea id="asNotes"></textarea>
    <p class="modal-error" id="addSkillsError"></p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" id="addSkillsCancel">Cancel</button>
      <button type="button" class="btn-send" id="addSkillsSubmit">Add</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="addJoinModal">
  <div class="modal">
    <h3>Add Join Sultans FC Registration</h3>
    <p class="modal-sub">For a family you know personally who didn't register on the website.</p>
    <label for="ajAgeGroup">Grade</label>
    <select id="ajAgeGroup">
      <option value="pre-k">Pre-K</option>
      <option value="kindergarten">Kindergarten</option>
      <option value="1st-grade">1st Grade</option>
      <option value="2nd-grade">2nd Grade</option>
      <option value="3rd-grade">3rd Grade</option>
      <option value="4th-grade">4th Grade</option>
      <option value="5th-grade">5th Grade</option>
      <option value="6th-grade">6th Grade</option>
    </select>
    <div class="two-col">
      <div><label for="ajChildName">Player name</label><input type="text" id="ajChildName"></div>
      <div><label for="ajDob">DOB</label><input type="date" id="ajDob"></div>
    </div>
    <label for="ajMotivation">Why they want to join</label>
    <textarea id="ajMotivation"></textarea>
    <div class="two-col">
      <div><label for="ajExperience">Experience</label><input type="text" id="ajExperience"></div>
      <div><label for="ajAvailability">Availability</label><input type="text" id="ajAvailability"></div>
    </div>
    <div class="two-col">
      <div><label for="ajParentName">Parent name</label><input type="text" id="ajParentName"></div>
      <div><label for="ajEmail">Email</label><input type="email" id="ajEmail"></div>
    </div>
    <label for="ajPhone">Phone (+1 followed by 10 digits)</label>
    <input type="text" id="ajPhone" placeholder="+12145551234">
    <div class="two-col">
      <div><label for="ajEmName">Emergency contact name</label><input type="text" id="ajEmName"></div>
      <div><label for="ajEmPhone">Emergency contact phone</label><input type="text" id="ajEmPhone" placeholder="+12145551234"></div>
    </div>
    <label for="ajMedical">Medical / allergies</label>
    <textarea id="ajMedical"></textarea>
    <p class="modal-error" id="addJoinError"></p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" id="addJoinCancel">Cancel</button>
      <button type="button" class="btn-send" id="addJoinSubmit">Add</button>
    </div>
  </div>
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
          const label = (row[opts.labelKey] ?? '').toString().replace(/"/g, '&quot;');
          html += \`<button type="button" class="btn-payment-link" data-id="\${row[opts.idKey || 'id']}" data-label="\${label}">Send Payment Link</button>\`;
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
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const label = btn.getAttribute('data-label') || '';
        openPaymentModal(registrationType, id, label, onSent);
      });
    });
  }

  // ---- Send Payment Link modal (service tier + season picker) ----

  const TIERS = {
    one: { label: '1x/week', monthly: 6210, priceText: '$62.10/mo' },
    two: { label: '2x/week', monthly: 12389, priceText: '$123.89/mo' },
  };
  const KIT_FEE = 5000;
  const SEASON_LABELS = { fall: 'Fall', winterbreak: 'Winter Break', spring: 'Spring', summer: 'Summer' };
  // Approximate Texas youth soccer season windows (PSA Plano/Murphy doesn't
  // publish exact dates, so these are sensible defaults — always editable
  // before sending).
  const SEASON_END_DEFAULTS = { fall: [11, 15], winterbreak: [12, 31], spring: [5, 15], summer: [7, 31] };

  function pad2(n){ return String(n).padStart(2, '0'); }

  function computeSeasonEndDate(seasonKey){
    const parts = SEASON_END_DEFAULTS[seasonKey];
    const month = parts[0];
    const day = parts[1];
    const now = new Date();
    let year = now.getFullYear();
    const candidate = new Date(Date.UTC(year, month - 1, day));
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    if (candidate.getTime() <= today.getTime()) year += 1;
    return year + '-' + pad2(month) + '-' + pad2(day);
  }

  let paymentModalCtx = null;

  function updateModalAmounts(){
    const tier = TIERS[document.getElementById('tierSelect').value];
    document.getElementById('modalAmounts').innerHTML = 'Kit fee (one-time): $50.00<br>Monthly: ' + tier.priceText;
  }

  function openPaymentModal(registrationType, id, label, onSent){
    paymentModalCtx = { registrationType, id, onSent };
    document.getElementById('paymentModalSub').textContent = label;
    document.getElementById('tierSelect').value = 'one';
    document.getElementById('seasonSelect').value = 'fall';
    document.getElementById('seasonEndInput').value = computeSeasonEndDate('fall');
    document.getElementById('paymentModalError').textContent = '';
    updateModalAmounts();
    document.getElementById('paymentModal').classList.remove('hidden');
  }

  function closePaymentModal(){
    document.getElementById('paymentModal').classList.add('hidden');
    paymentModalCtx = null;
  }

  document.getElementById('tierSelect').addEventListener('change', updateModalAmounts);
  document.getElementById('seasonSelect').addEventListener('change', (e) => {
    document.getElementById('seasonEndInput').value = computeSeasonEndDate(e.target.value);
  });
  document.getElementById('paymentModalCancel').addEventListener('click', closePaymentModal);

  document.getElementById('paymentModalSend').addEventListener('click', async () => {
    if (!paymentModalCtx) return;
    const seasonEndDate = document.getElementById('seasonEndInput').value;
    const errEl = document.getElementById('paymentModalError');
    errEl.textContent = '';
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(seasonEndDate)) {
      errEl.textContent = 'Please pick a valid billing end date.';
      return;
    }
    const tierKey = document.getElementById('tierSelect').value;
    const tier = TIERS[tierKey];
    const seasonKey = document.getElementById('seasonSelect').value;
    const tierLabel = tier.label + ' — ' + SEASON_LABELS[seasonKey];
    const ctx = paymentModalCtx;

    const btn = document.getElementById('paymentModalSend');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const result = await api('/api/admin/payment-links', {
        method: 'POST',
        body: JSON.stringify({
          registrationType: ctx.registrationType,
          registrationId: ctx.id,
          seasonEndDate,
          oneTimeAmount: KIT_FEE,
          monthlyAmount: tier.monthly,
          tierLabel,
        }),
      });
      if (result.error) {
        errEl.textContent = result.error;
      } else {
        closePaymentModal();
        alert('Payment link sent to ' + result.entry.email + '.');
        await ctx.onSent();
      }
    } catch (e) {
      errEl.textContent = 'Could not send the payment link. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Link';
    }
  });

  // ---- Manually add a registration (for families you know personally) ----

  document.getElementById('addSkillsBtn').addEventListener('click', () => {
    ['asFullName','asDob','asEmail','asPhone','asTeam','asExperience','asNotes'].forEach((id) => {
      document.getElementById(id).value = '';
    });
    document.getElementById('addSkillsError').textContent = '';
    document.getElementById('addSkillsModal').classList.remove('hidden');
  });
  document.getElementById('addSkillsCancel').addEventListener('click', () => {
    document.getElementById('addSkillsModal').classList.add('hidden');
  });
  document.getElementById('addSkillsSubmit').addEventListener('click', async () => {
    const errEl = document.getElementById('addSkillsError');
    errEl.textContent = '';
    const payload = {
      fullName: document.getElementById('asFullName').value.trim(),
      dob: document.getElementById('asDob').value,
      email: document.getElementById('asEmail').value.trim(),
      phone: document.getElementById('asPhone').value.trim(),
      team: document.getElementById('asTeam').value.trim(),
      experience: document.getElementById('asExperience').value.trim(),
      notes: document.getElementById('asNotes').value.trim(),
    };
    const btn = document.getElementById('addSkillsSubmit');
    btn.disabled = true;
    btn.textContent = 'Adding…';
    try {
      const result = await api('/api/admin/skills-registrations', { method: 'POST', body: JSON.stringify(payload) });
      if (result.error) {
        errEl.textContent = result.error + (result.fields ? ' (' + Object.values(result.fields).join(' ') + ')' : '');
      } else {
        document.getElementById('addSkillsModal').classList.add('hidden');
        await Promise.all([loadSummary(), loadSkills()]);
      }
    } catch (e) {
      errEl.textContent = 'Could not add this registration. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Add';
    }
  });

  document.getElementById('addJoinBtn').addEventListener('click', () => {
    ['ajChildName','ajDob','ajMotivation','ajExperience','ajAvailability','ajParentName','ajEmail','ajPhone','ajEmName','ajEmPhone','ajMedical'].forEach((id) => {
      document.getElementById(id).value = '';
    });
    document.getElementById('ajAgeGroup').value = 'pre-k';
    document.getElementById('addJoinError').textContent = '';
    document.getElementById('addJoinModal').classList.remove('hidden');
  });
  document.getElementById('addJoinCancel').addEventListener('click', () => {
    document.getElementById('addJoinModal').classList.add('hidden');
  });
  document.getElementById('addJoinSubmit').addEventListener('click', async () => {
    const errEl = document.getElementById('addJoinError');
    errEl.textContent = '';
    const payload = {
      ageGroup: document.getElementById('ajAgeGroup').value,
      childName: document.getElementById('ajChildName').value.trim(),
      dob: document.getElementById('ajDob').value,
      motivation: document.getElementById('ajMotivation').value.trim(),
      experience: document.getElementById('ajExperience').value.trim(),
      availability: document.getElementById('ajAvailability').value.trim(),
      parentName: document.getElementById('ajParentName').value.trim(),
      email: document.getElementById('ajEmail').value.trim(),
      phone: document.getElementById('ajPhone').value.trim(),
      emName: document.getElementById('ajEmName').value.trim(),
      emPhone: document.getElementById('ajEmPhone').value.trim(),
      medical: document.getElementById('ajMedical').value.trim(),
    };
    const btn = document.getElementById('addJoinSubmit');
    btn.disabled = true;
    btn.textContent = 'Adding…';
    try {
      const result = await api('/api/admin/join-registrations', { method: 'POST', body: JSON.stringify(payload) });
      if (result.error) {
        errEl.textContent = result.error + (result.fields ? ' (' + Object.values(result.fields).join(' ') + ')' : '');
      } else {
        document.getElementById('addJoinModal').classList.add('hidden');
        await Promise.all([loadSummary(), loadJoin()]);
      }
    } catch (e) {
      errEl.textContent = 'Could not add this registration. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Add';
    }
  });

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
    ], { onDelete: true, onPaymentLink: true, labelKey: 'full_name' });
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
    ], { onDelete: true, onPaymentLink: true, labelKey: 'child_name' });
    wireDeleteButtons('joinTableWrap', async (id) => {
      await api('/api/admin/join-registrations/' + id, { method: 'DELETE' });
      await Promise.all([loadSummary(), loadJoin()]);
    });
    wirePaymentLinkButtons('joinTableWrap', 'join', loadJoin);
  }

  // ---- Players Roster, Season Overview, Pricing & Revenue ----

  const GRADES = ['pre-k','kindergarten','1st-grade','2nd-grade','3rd-grade','4th-grade','5th-grade','6th-grade'];
  let currentPricing = { priceOneCents: 15000, priceTwoCents: 25000 };
  let lastOverview = null;

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderRosterTable(rows){
    if (!rows.length) return '<div class="empty">No players yet.</div>';
    let html = '<table><thead><tr>' +
      '<th>Name</th><th>DOB</th><th>Parent</th><th>Phone</th><th>Email</th>' +
      '<th>Sessions</th><th>RCH</th><th>Sultans</th><th>Discount</th><th></th>' +
      '</tr></thead><tbody>';
    rows.forEach((r) => {
      html += '<tr>' +
        '<td>' + escapeHtml(r.player_name) + '</td>' +
        '<td>' + escapeHtml(r.dob || '') + '</td>' +
        '<td>' + escapeHtml(r.parent_name || '') + '</td>' +
        '<td>' + escapeHtml(r.parent_phone || '') + '</td>' +
        '<td>' + escapeHtml(r.parent_email || '') + '</td>' +
        '<td>' + (r.session_type === 'two' ? 'Two' : 'One') + '</td>' +
        '<td>' + (r.rch ? '✓' : '—') + '</td>' +
        '<td>' + (r.sultans ? '✓' : '—') + '</td>' +
        '<td>$' + (r.discount_cents / 100).toFixed(2) + '</td>' +
        '<td><button type="button" class="btn-delete-row" data-id="' + r.id + '">Delete</button></td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  async function loadRoster(){
    const grade = document.getElementById('rosterGradeFilter').value;
    const rows = await api('/api/admin/players?grade=' + encodeURIComponent(grade));
    const wrap = document.getElementById('rosterTableWrap');
    wrap.innerHTML = renderRosterTable(rows);
    wrap.querySelectorAll('.btn-delete-row').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this player from the roster? This cannot be undone.')) return;
        btn.disabled = true;
        try {
          await api('/api/admin/players/' + btn.getAttribute('data-id'), { method: 'DELETE' });
          await Promise.all([loadRoster(), loadOverviewAndRevenue()]);
        } catch (e) {
          alert('Could not delete this player. Please try again.');
          btn.disabled = false;
        }
      });
    });
  }
  document.getElementById('rosterGradeFilter').addEventListener('change', loadRoster);

  function renderOverviewTable(overview){
    let html = '<table><thead><tr><th>Grade</th><th>Total Players</th><th>Total RCH</th>' +
      '<th>Total Sultans</th><th>Total Both</th><th>Total One Session</th><th>Total Two Session</th></tr></thead><tbody>';
    const grand = { players:0, rch:0, sultans:0, both:0, one:0, two:0 };
    GRADES.forEach((g) => {
      const o = overview[g] || { totalPlayers:0, totalRch:0, totalSultans:0, totalBoth:0, totalOne:0, totalTwo:0 };
      grand.players += o.totalPlayers; grand.rch += o.totalRch; grand.sultans += o.totalSultans;
      grand.both += o.totalBoth; grand.one += o.totalOne; grand.two += o.totalTwo;
      html += '<tr><td>' + GRADE_LABELS[g] + '</td><td>' + o.totalPlayers + '</td><td>' + o.totalRch + '</td>' +
        '<td>' + o.totalSultans + '</td><td>' + o.totalBoth + '</td><td>' + o.totalOne + '</td><td>' + o.totalTwo + '</td></tr>';
    });
    html += '<tr class="grand-total"><td>GRAND TOTAL</td><td>' + grand.players + '</td><td>' + grand.rch + '</td>' +
      '<td>' + grand.sultans + '</td><td>' + grand.both + '</td><td>' + grand.one + '</td><td>' + grand.two + '</td></tr>';
    html += '</tbody></table>';
    return html;
  }

  function renderRevenueTable(overview, pricing){
    let html = '<table><thead><tr><th>Grade</th><th>One-Session Players</th><th>Two-Session Players</th>' +
      '<th>Revenue (One)</th><th>Revenue (Two)</th><th>Discounts</th><th>Total Revenue</th></tr></thead><tbody>';
    const totals = { one:0, two:0, revOne:0, revTwo:0, disc:0, total:0 };
    GRADES.forEach((g) => {
      const o = overview[g] || { totalOne:0, totalTwo:0, totalDiscountCents:0 };
      const revOne = o.totalOne * pricing.priceOneCents;
      const revTwo = o.totalTwo * pricing.priceTwoCents;
      const disc = o.totalDiscountCents || 0;
      const total = revOne + revTwo - disc;
      totals.one += o.totalOne; totals.two += o.totalTwo;
      totals.revOne += revOne; totals.revTwo += revTwo; totals.disc += disc; totals.total += total;
      html += '<tr><td>' + GRADE_LABELS[g] + '</td><td>' + o.totalOne + '</td><td>' + o.totalTwo + '</td>' +
        '<td>$' + (revOne/100).toFixed(2) + '</td><td>$' + (revTwo/100).toFixed(2) + '</td>' +
        '<td>$' + (disc/100).toFixed(2) + '</td><td>$' + (total/100).toFixed(2) + '</td></tr>';
    });
    html += '<tr class="grand-total"><td>TOTAL WON (Revenue)</td><td>' + totals.one + '</td><td>' + totals.two + '</td>' +
      '<td>$' + (totals.revOne/100).toFixed(2) + '</td><td>$' + (totals.revTwo/100).toFixed(2) + '</td>' +
      '<td>$' + (totals.disc/100).toFixed(2) + '</td><td>$' + (totals.total/100).toFixed(2) + '</td></tr>';
    html += '</tbody></table>';
    return html;
  }

  async function loadOverviewAndRevenue(){
    const overview = await api('/api/admin/players-overview');
    lastOverview = overview;
    document.getElementById('overviewTableWrap').innerHTML = renderOverviewTable(overview);
    document.getElementById('revenueTableWrap').innerHTML = renderRevenueTable(overview, currentPricing);
  }

  async function loadPricing(){
    const p = await api('/api/admin/pricing');
    currentPricing = p;
    document.getElementById('priceOneInput').value = (p.priceOneCents / 100).toFixed(2);
    document.getElementById('priceTwoInput').value = (p.priceTwoCents / 100).toFixed(2);
  }

  document.getElementById('savePricingBtn').addEventListener('click', async () => {
    const priceOneCents = Math.round(parseFloat(document.getElementById('priceOneInput').value || '0') * 100);
    const priceTwoCents = Math.round(parseFloat(document.getElementById('priceTwoInput').value || '0') * 100);
    const btn = document.getElementById('savePricingBtn');
    btn.disabled = true;
    try {
      currentPricing = await api('/api/admin/pricing', {
        method: 'POST',
        body: JSON.stringify({ priceOneCents, priceTwoCents }),
      });
      const savedMsg = document.getElementById('pricingSaved');
      savedMsg.textContent = 'Saved.';
      setTimeout(() => { savedMsg.textContent = ''; }, 2000);
      if (lastOverview) {
        document.getElementById('revenueTableWrap').innerHTML = renderRevenueTable(lastOverview, currentPricing);
      }
    } catch (e) {
      alert('Could not save pricing. Please try again.');
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('addPlayerBtn').addEventListener('click', () => {
    document.getElementById('apGrade').value = document.getElementById('rosterGradeFilter').value;
    ['apName','apDob','apParentName','apParentPhone','apParentEmail'].forEach((id) => {
      document.getElementById(id).value = '';
    });
    document.getElementById('apSessions').value = 'one';
    document.getElementById('apRch').checked = false;
    document.getElementById('apSultans').checked = false;
    document.getElementById('apDiscount').value = '0';
    document.getElementById('addPlayerError').textContent = '';
    document.getElementById('addPlayerModal').classList.remove('hidden');
  });
  document.getElementById('addPlayerCancel').addEventListener('click', () => {
    document.getElementById('addPlayerModal').classList.add('hidden');
  });
  document.getElementById('addPlayerSubmit').addEventListener('click', async () => {
    const errEl = document.getElementById('addPlayerError');
    errEl.textContent = '';
    const grade = document.getElementById('apGrade').value;
    const payload = {
      grade: grade,
      playerName: document.getElementById('apName').value.trim(),
      dob: document.getElementById('apDob').value,
      parentName: document.getElementById('apParentName').value.trim(),
      parentPhone: document.getElementById('apParentPhone').value.trim(),
      parentEmail: document.getElementById('apParentEmail').value.trim(),
      sessionType: document.getElementById('apSessions').value,
      rch: document.getElementById('apRch').checked,
      sultans: document.getElementById('apSultans').checked,
      discountCents: Math.round(parseFloat(document.getElementById('apDiscount').value || '0') * 100),
    };
    if (!payload.playerName) { errEl.textContent = "Please enter the player's name."; return; }
    const btn = document.getElementById('addPlayerSubmit');
    btn.disabled = true;
    btn.textContent = 'Adding…';
    try {
      const result = await api('/api/admin/players', { method: 'POST', body: JSON.stringify(payload) });
      if (result.error) {
        errEl.textContent = result.error;
      } else {
        document.getElementById('addPlayerModal').classList.add('hidden');
        if (document.getElementById('rosterGradeFilter').value === grade) {
          await loadRoster();
        }
        await loadOverviewAndRevenue();
      }
    } catch (e) {
      errEl.textContent = 'Could not add this player. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Add';
    }
  });

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
    await Promise.all([loadSummary(), loadSkills(), loadJoin(), loadSkillsToggle(), loadRoster()]);
    await loadPricing();
    await loadOverviewAndRevenue();
  }

  wireExportLinks();
  if (getToken()) showApp(); else showLogin();
</script>
</body>
</html>
`;
