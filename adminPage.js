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
  header{ background:var(--pitch-deep); color:var(--chalk); padding:12px 28px; display:flex; align-items:center; justify-content:space-between; }
  header .header-brand{ flex:1; display:flex; align-items:center; justify-content:center; }
  header .header-brand img{ height:76px; width:auto; display:block; }
  #sectionNav{ background:#fff; border:none; border-radius:6px; padding:8px 12px; font-size:0.85rem; font-weight:600; color:var(--pitch-deep); cursor:pointer; }
  #login-view .login-logo{ display:block; max-width:200px; width:100%; height:auto; margin:0 auto 20px; }
  header button{ background:transparent; border:1px solid rgba(246,242,231,0.4); color:var(--chalk); padding:8px 14px; border-radius:6px; cursor:pointer; }
  main{ max-width:1500px; margin:0 auto; padding:28px; }
  #login-view{ max-width:360px; margin:80px auto; background:#fff; padding:30px; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.08); }
  #login-view h2{ margin-top:0; }
  #login-view input{ width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; margin:10px 0; font-size:1rem; }
  #login-view button{ width:100%; padding:10px; background:var(--gold); border:none; border-radius:6px; font-weight:700; cursor:pointer; }
  #login-error{ color:#b5482f; font-size:0.9rem; min-height:1.2em; }
  .summary{ display:flex; gap:16px; flex-wrap:wrap; margin-bottom:28px; }
  .card{ background:#fff; border-radius:8px; padding:18px 22px; box-shadow:0 4px 14px rgba(0,0,0,0.06); min-width:140px; }
  .card .n{ font-size:1.6rem; font-weight:800; color:var(--pitch); }
  .card .l{ font-size:0.8rem; color:#666; text-transform:uppercase; letter-spacing:0.05em; }
  table{ width:100%; border-collapse:collapse; background:#fff; border-radius:8px; box-shadow:0 4px 14px rgba(0,0,0,0.06); margin-bottom:32px; font-size:0.88rem; }
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
  .btn-move-to-roster{ background:#fff; border:1px solid var(--pitch); color:var(--pitch); padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; white-space:nowrap; }
  .btn-move-to-roster:hover{ background:var(--pitch); color:#fff; }
  .btn-move-to-roster:disabled{ opacity:0.6; cursor:default; }
  .btn-unsubscribe{ background:#fff; border:1px solid #6a6a6a; color:#444; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; white-space:nowrap; }
  .btn-unsubscribe:hover{ background:#444; color:#fff; }
  .status-badge{ display:inline-block; padding:3px 10px; border-radius:12px; font-size:0.78rem; font-weight:700; white-space:nowrap; }
  .status-paid{ background:#e3f3e9; color:#1f7a44; }
  .status-declined{ background:#fbe6e1; color:#b5482f; }
  .status-pending{ background:#fdf3dd; color:#9a6b12; }
  .status-neutral{ background:#eee; color:#777; }
  /* Row actions: primary action stays visible, the rest collapse behind a
     "⋯" menu so a row with 5 actions doesn't wrap onto 2–3 lines. */
  .row-actions{ position:relative; display:flex; gap:6px; align-items:center; justify-content:flex-end; }
  .btn-kebab{ background:#fff; border:1px solid #ccc; color:#555; width:30px; height:30px; line-height:1; border-radius:6px; cursor:pointer; font-size:1.1rem; }
  .btn-kebab:hover{ background:#f2f2f2; }
  .row-menu{ position:absolute; top:calc(100% + 4px); right:0; background:#fff; border:1px solid #ddd; border-radius:8px; box-shadow:0 10px 28px rgba(0,0,0,0.18); padding:6px; display:flex; flex-direction:column; gap:4px; z-index:30; min-width:150px; }
  .row-menu.hidden{ display:none; }
  .row-menu button{ width:100%; white-space:nowrap; text-align:left; }
  .btn-unsubscribe:disabled{ opacity:0.6; cursor:default; }
  .btn-pause-toggle{ background:#fff; border:1px solid var(--gold); color:#8a6a1f; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; white-space:nowrap; }
  .btn-pause-toggle:hover{ background:var(--gold); color:#1c2a20; }
  .btn-pause-toggle:disabled{ opacity:0.6; cursor:default; }
  .btn-cancel-billing{ background:#fff; border:1px solid #b5482f; color:#b5482f; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; white-space:nowrap; }
  .btn-cancel-billing:hover{ background:#b5482f; color:#fff; }
  .btn-cancel-billing:disabled{ opacity:0.6; cursor:default; }
  .btn-edit-row{ background:#fff; border:1px solid #8a8a8a; color:#444; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; white-space:nowrap; }
  .btn-edit-row:hover{ background:#444; color:#fff; }
  .btn-edit-row:disabled{ opacity:0.6; cursor:default; }
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
  <img class="login-logo" src="/assets/logo.png" alt="RCH Elite Training">
  <h2>Admin login</h2>
  <input type="password" id="pw" placeholder="Password" autofocus>
  <button id="loginBtn">Log in</button>
  <p id="login-error"></p>
</div>

<div id="app-view" class="hidden">
  <header>
    <div class="header-brand">
      <img src="/assets/logo.png" alt="RCH Elite Training">
    </div>
    <div style="display:flex; align-items:center; gap:12px;">
      <select id="sectionNav">
        <option value="registrations">Registrations</option>
        <option value="finances">Finances</option>
        <option value="charges">Charges</option>
        <option value="coaches">Coaches</option>
        <option value="data">Data</option>
      </select>
      <button id="logoutBtn">Log out</button>
    </div>
  </header>
  <main>
    <div class="summary" id="summary"></div>

    <div id="section-registrations">

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
      <div style="display:flex; align-items:center; gap:14px;">
        <label class="switch-row">
          <input type="checkbox" id="joinOpenToggle">
          <span class="switch-track"><span class="switch-thumb"></span></span>
          <span id="joinOpenLabel">Registration open</span>
          <span id="joinOpenGradeLabel" style="color:#888; font-weight:normal;"></span>
        </label>
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

    </div><!-- /section-registrations -->

    <div id="section-finances" class="hidden">

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

    <div class="section-head">
      <h2>Payment Link Amounts</h2>
    </div>
    <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">What "Send Payment Link" actually charges. Change these here whenever the season's rate changes — no code update needed. The first payment is automatically prorated for however many Tuesday/Thursday practices are left in the current month; the kit fee (if included) is a one-time add-on on top of that.</p>
    <div class="pricing-box">
      <div>
        <label for="paymentOneInput">Monthly — One Session/Week</label>
        <input type="number" id="paymentOneInput" min="0" step="0.01">
      </div>
      <div>
        <label for="paymentTwoInput">Monthly — Two Sessions/Week</label>
        <input type="number" id="paymentTwoInput" min="0" step="0.01">
      </div>
      <div>
        <label for="kitFeeInput">Kit Fee (one-time)</label>
        <input type="number" id="kitFeeInput" min="0" step="0.01">
      </div>
      <div>
        <label for="onlineCourseInput">Monthly — Online Course</label>
        <input type="number" id="onlineCourseInput" min="0" step="0.01">
      </div>
      <button type="button" class="btn-add" id="savePaymentPricingBtn">Save Amounts</button>
      <span class="pricing-saved" id="paymentPricingSaved"></span>
    </div>

    <div class="section-head">
      <h2>Proration Mode</h2>
    </div>
    <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">While locked, the "this month" amount is fixed the moment you click Send Link — so a family that pays a few days late still owes what was shown to them, instead of a smaller amount recalculated at payment time. Turn this off once initial enrollment settles, so new signups pay live based on practices left as of the moment they actually pay.</p>
    <div class="pricing-box">
      <div class="checkbox-row">
        <input type="checkbox" id="lockProrationCheckbox">
        <label for="lockProrationCheckbox">Lock amount at link creation</label>
      </div>
      <button type="button" class="btn-add" id="saveProrationModeBtn">Save</button>
      <span class="pricing-saved" id="prorationModeSaved"></span>
    </div>

    <div class="section-head">
      <h2>One-Time Payments</h2>
    </div>
    <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">Create a stand-alone payment link for a single charge — a tournament fee, a replacement kit, a test charge, anything that isn't a recurring membership. Not tied to any registration or subscription; the family just pays this one amount once.</p>
    <div class="modal-amounts" style="background:#fff; border-radius:8px; padding:18px 22px; box-shadow:0 4px 14px rgba(0,0,0,0.06); margin-bottom:20px; display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end;">
      <div>
        <label for="otpTitleInput">Title</label><br>
        <input type="text" id="otpTitleInput" placeholder="e.g. Tournament fee">
      </div>
      <div>
        <label for="otpDescInput">Description (optional)</label><br>
        <input type="text" id="otpDescInput" placeholder="Shown to the family on the payment page">
      </div>
      <div>
        <label for="otpAmountInput">Amount ($)</label><br>
        <input type="number" id="otpAmountInput" min="0.01" step="0.01">
      </div>
      <button type="button" class="btn-add" id="addOneTimePaymentBtn">+ Create Link</button>
    </div>
    <div id="oneTimePaymentsTableWrap"></div>

    </div><!-- /section-finances -->

    <div id="section-charges" class="hidden">
      <div class="section-head">
        <h2>Charges</h2>
      </div>
      <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">Recurring charges apply to every month automatically (field rental, insurance, etc.). One-time charges apply only to the month you tag them with (a tournament fee, equipment purchase, etc.). Both are subtracted from estimated roster revenue in each month's snapshot, under Data.</p>
      <div class="modal-amounts" style="background:#fff; border-radius:8px; padding:18px 22px; box-shadow:0 4px 14px rgba(0,0,0,0.06); margin-bottom:20px; display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end;">
        <div>
          <label for="chargeDescInput">Description</label><br>
          <input type="text" id="chargeDescInput" placeholder="e.g. Field rental">
        </div>
        <div>
          <label for="chargeAmountInput">Amount ($)</label><br>
          <input type="number" id="chargeAmountInput" min="0" step="0.01">
        </div>
        <div>
          <label for="chargeKindInput">Type</label><br>
          <select id="chargeKindInput">
            <option value="recurring">Recurring (every month)</option>
            <option value="one_time">One-time (specific month)</option>
          </select>
        </div>
        <div id="chargeMonthWrap" class="hidden">
          <label for="chargeMonthInput">Month</label><br>
          <input type="date" id="chargeMonthInput">
        </div>
        <button type="button" class="btn-add" id="addChargeBtn">+ Add Charge</button>
      </div>
      <div id="chargesTableWrap"></div>
    </div><!-- /section-charges -->

    <div id="section-coaches" class="hidden">
      <div class="section-head">
        <h2>Coaches</h2>
        <button type="button" class="btn-add" id="addCoachBtn">+ Add Coach</button>
      </div>
      <div id="coachesTableWrap"></div>
    </div><!-- /section-coaches -->

    <div id="section-data" class="hidden">
      <div class="section-head">
        <h2>Monthly Snapshots</h2>
        <button type="button" class="btn-add" id="generateSnapshotBtn">Generate This Month's Snapshot</button>
      </div>
      <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">A snapshot of the roster + estimated revenue, charges, and net income is saved automatically on the 1st of each month for the month that just ended. Revenue is estimated from each active player's current monthly rate minus their discount — it's a projection from the roster, not a reconciliation against actual settled Stripe payments, which Stripe's own dashboard remains the source of truth for.</p>
      <div id="snapshotsTableWrap"></div>

      <div class="section-head" style="margin-top:32px;">
        <h2>Unsubscribed Players</h2>
      </div>
      <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">Players who quit. Cancel their billing first (from the Players Roster), then Unsubscribe them here to archive them off the active roster.</p>
      <div id="archivedTableWrap"></div>

      <div class="section-head" style="margin-top:32px;">
        <h2>Exports</h2>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <a class="btn-export" href="#" id="exportRosterLink">Download Roster CSV</a>
      </div>
    </div><!-- /section-data -->

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
      <option value="online">Online Course</option>
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

<div class="modal-overlay hidden" id="editPlayerModal">
  <div class="modal">
    <h3>Edit Player</h3>
    <label for="epGrade">Grade</label>
    <select id="epGrade">
      <option value="pre-k">Pre-K</option>
      <option value="kindergarten">Kindergarten</option>
      <option value="1st-grade">1st Grade</option>
      <option value="2nd-grade">2nd Grade</option>
      <option value="3rd-grade">3rd Grade</option>
      <option value="4th-grade">4th Grade</option>
      <option value="5th-grade">5th Grade</option>
      <option value="6th-grade">6th Grade</option>
    </select>
    <label for="epName">Player name</label>
    <input type="text" id="epName">
    <label for="epDob">Date of birth</label>
    <input type="date" id="epDob">
    <div class="two-col">
      <div><label for="epParentName">Parent name</label><input type="text" id="epParentName"></div>
      <div><label for="epParentPhone">Parent phone</label><input type="text" id="epParentPhone"></div>
    </div>
    <label for="epParentEmail">Parent email</label>
    <input type="email" id="epParentEmail">
    <label for="epSessions">Sessions</label>
    <select id="epSessions">
      <option value="one">One</option>
      <option value="two">Two</option>
      <option value="online">Online Course</option>
    </select>
    <div class="two-col">
      <div class="checkbox-row"><input type="checkbox" id="epRch"><label for="epRch">RCH</label></div>
      <div class="checkbox-row"><input type="checkbox" id="epSultans"><label for="epSultans">Sultans</label></div>
    </div>
    <label for="epDiscount">Discount ($)</label>
    <input type="number" id="epDiscount" min="0" step="0.01" value="0">
    <p class="modal-error" id="editPlayerError"></p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" id="editPlayerCancel">Cancel</button>
      <button type="button" class="btn-send" id="editPlayerSubmit">Save</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="coachModal">
  <div class="modal">
    <h3 id="coachModalTitle">Add Coach</h3>
    <label for="coachName">Name</label>
    <input type="text" id="coachName">
    <div class="two-col">
      <div><label for="coachEmail">Email</label><input type="email" id="coachEmail"></div>
      <div><label for="coachPhone">Phone</label><input type="text" id="coachPhone"></div>
    </div>
    <label>Grades coached</label>
    <div class="two-col" style="flex-wrap:wrap;">
      <div class="checkbox-row"><input type="checkbox" id="coachGrade_pre-k"><label for="coachGrade_pre-k">Pre-K</label></div>
      <div class="checkbox-row"><input type="checkbox" id="coachGrade_kindergarten"><label for="coachGrade_kindergarten">Kindergarten</label></div>
      <div class="checkbox-row"><input type="checkbox" id="coachGrade_1st-grade"><label for="coachGrade_1st-grade">1st Grade</label></div>
      <div class="checkbox-row"><input type="checkbox" id="coachGrade_2nd-grade"><label for="coachGrade_2nd-grade">2nd Grade</label></div>
      <div class="checkbox-row"><input type="checkbox" id="coachGrade_3rd-grade"><label for="coachGrade_3rd-grade">3rd Grade</label></div>
      <div class="checkbox-row"><input type="checkbox" id="coachGrade_4th-grade"><label for="coachGrade_4th-grade">4th Grade</label></div>
      <div class="checkbox-row"><input type="checkbox" id="coachGrade_5th-grade"><label for="coachGrade_5th-grade">5th Grade</label></div>
      <div class="checkbox-row"><input type="checkbox" id="coachGrade_6th-grade"><label for="coachGrade_6th-grade">6th Grade</label></div>
    </div>
    <div class="two-col">
      <div class="checkbox-row"><input type="checkbox" id="coachRch"><label for="coachRch">Coaches RCH</label></div>
      <div class="checkbox-row"><input type="checkbox" id="coachSultans"><label for="coachSultans">Coaches Sultans FC</label></div>
    </div>
    <label for="coachNotes">Notes</label>
    <textarea id="coachNotes" rows="3" style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-family:inherit; font-size:1rem;"></textarea>
    <p class="modal-error" id="coachModalError"></p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" id="coachModalCancel">Cancel</button>
      <button type="button" class="btn-send" id="coachModalSubmit">Save</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="moveToRosterModal">
  <div class="modal">
    <h3>Move to Roster</h3>
    <p class="modal-sub" id="moveModalSub"></p>
    <label for="moveGrade">Grade</label>
    <select id="moveGrade">
      <option value="pre-k">Pre-K</option>
      <option value="kindergarten">Kindergarten</option>
      <option value="1st-grade">1st Grade</option>
      <option value="2nd-grade">2nd Grade</option>
      <option value="3rd-grade">3rd Grade</option>
      <option value="4th-grade">4th Grade</option>
      <option value="5th-grade">5th Grade</option>
      <option value="6th-grade">6th Grade</option>
    </select>
    <label for="moveSessionType">Sessions</label>
    <select id="moveSessionType">
      <option value="one">One</option>
      <option value="two">Two</option>
      <option value="online">Online Course</option>
    </select>
    <div class="two-col">
      <div class="checkbox-row"><input type="checkbox" id="moveRch"><label for="moveRch">RCH</label></div>
      <div class="checkbox-row"><input type="checkbox" id="moveSultans"><label for="moveSultans">Sultans (implies RCH)</label></div>
    </div>
    <div class="two-col">
      <div><label for="moveParentName">Parent name</label><input type="text" id="moveParentName"></div>
      <div><label for="moveParentPhone">Parent phone</label><input type="text" id="moveParentPhone"></div>
    </div>
    <label for="moveParentEmail">Parent email</label>
    <input type="email" id="moveParentEmail">
    <p class="modal-error" id="moveModalError"></p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" id="moveModalCancel">Cancel</button>
      <button type="button" class="btn-send" id="moveModalSubmit">Move to Roster</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="paymentModal">
  <div class="modal">
    <h3>Send Payment Link</h3>
    <p class="modal-sub" id="paymentModalSub"></p>
    <label for="tierSelect">Service</label>
    <select id="tierSelect">
      <option value="one">1x per week</option>
      <option value="two">2x per week</option>
      <option value="online">Online Course</option>
    </select>
    <p style="color:#888; font-size:0.78rem; margin:-4px 0 10px;" id="tierSelectNote"></p>
    <label for="seasonSelect">Season</label>
    <select id="seasonSelect">
      <option value="regular">Regular Season (Aug 3 – May 3)</option>
      <option value="summer">Summer (Jun 3 – Jul 3)</option>
    </select>
    <label for="seasonEndInput">Billing ends on</label>
    <input type="date" id="seasonEndInput">
    <div class="checkbox-row">
      <input type="checkbox" id="includeKitFee">
      <label for="includeKitFee" id="includeKitFeeLabel">Include kit fee</label>
    </div>
    <div class="modal-amounts" id="modalAmounts"></div>
    <p class="modal-error" id="paymentModalError"></p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" id="paymentModalCancel">Cancel</button>
      <button type="button" class="btn-send" id="paymentModalSend">Send Link</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="pauseModal">
  <div class="modal">
    <h3>Pause Billing</h3>
    <p class="modal-sub" id="pauseModalSub"></p>
    <label for="resumeDateInput">Resume billing on</label>
    <input type="date" id="resumeDateInput">
    <p class="modal-error" id="pauseModalError"></p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" id="pauseModalCancel">Cancel</button>
      <button type="button" class="btn-send" id="pauseModalSend">Pause</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="addSkillsModal">
  <div class="modal">
    <h3>Add Skills Training Registration</h3>
    <p class="modal-sub">For a family you know personally who didn't register on the website.</p>
    <div class="two-col">
      <div><label for="asFullName">Player's full name</label><input type="text" id="asFullName"></div>
      <div><label for="asParentName">Parent / guardian name</label><input type="text" id="asParentName"></div>
    </div>
    <label for="asDob">Date of birth</label>
    <input type="date" id="asDob">
    <div class="two-col">
      <div><label for="asEmail">Email</label><input type="email" id="asEmail"></div>
      <div><label for="asPhone">Phone (+1 followed by 10 digits)</label><input type="text" id="asPhone" placeholder="+12145551234"></div>
    </div>
    <div class="two-col">
      <div>
        <label for="asGrade">Grade</label>
        <select id="asGrade">
          <option value="">Select grade</option>
          <option value="pre-k">Pre-K</option>
          <option value="kindergarten">Kindergarten</option>
          <option value="1st-grade">1st Grade</option>
          <option value="2nd-grade">2nd Grade</option>
          <option value="3rd-grade">3rd Grade</option>
          <option value="4th-grade">4th Grade</option>
          <option value="5th-grade">5th Grade</option>
          <option value="6th-grade">6th Grade</option>
        </select>
      </div>
      <div>
        <label for="asSessionType">Sessions per week</label>
        <select id="asSessionType">
          <option value="">Select an option</option>
          <option value="one">One</option>
          <option value="two">Two</option>
          <option value="online">Online Course</option>
        </select>
      </div>
    </div>
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
    <label for="ajSessionType">Sessions per week</label>
    <select id="ajSessionType">
      <option value="">Select an option</option>
      <option value="one">One</option>
      <option value="two">Two</option>
      <option value="online">Online Course</option>
    </select>
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
    document.getElementById('sectionNav').value = 'registrations';
    showSection('registrations');
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
    const hasActions = opts.onDelete || opts.onPaymentLink || opts.onPauseToggle || opts.onCancelBilling || opts.onMoveToRoster;
    const cols = hasActions ? [...columns, { key:'__actions', label:'' }] : columns;
    let html = '<table><thead><tr>' + cols.map(c => \`<th>\${c.label}</th>\`).join('') + '</tr></thead><tbody>';
    for (const row of rows) {
      html += '<tr>' + columns.map(c => \`<td>\${row[c.key] ?? ''}</td>\`).join('');
      if (hasActions) {
        html += '<td style="display:flex; gap:6px; flex-wrap:wrap;">';
        if (opts.onMoveToRoster) {
          const label = (row[opts.labelKey] ?? '').toString().replace(/"/g, '&quot;');
          html += \`<button type="button" class="btn-move-to-roster" data-id="\${row[opts.idKey || 'id']}" data-label="\${label}">Move to Roster</button>\`;
        }
        if (opts.onPaymentLink) {
          const label = (row[opts.labelKey] ?? '').toString().replace(/"/g, '&quot;');
          html += \`<button type="button" class="btn-payment-link" data-id="\${row[opts.idKey || 'id']}" data-label="\${label}">Send Payment Link</button>\`;
        }
        if (opts.onPauseToggle && row.payment_status === 'completed') {
          const label = (row[opts.labelKey] ?? '').toString().replace(/"/g, '&quot;');
          const isPaused = !!row.paused_until && new Date(row.paused_until) > new Date();
          html += \`<button type="button" class="btn-pause-toggle" data-id="\${row[opts.idKey || 'id']}" data-label="\${label}" data-paused="\${isPaused}">\${isPaused ? 'Resume Billing' : 'Pause Billing'}</button>\`;
        }
        if (opts.onCancelBilling && row.payment_status === 'completed') {
          const label = (row[opts.labelKey] ?? '').toString().replace(/"/g, '&quot;');
          html += \`<button type="button" class="btn-cancel-billing" data-id="\${row[opts.idKey || 'id']}" data-label="\${label}">Cancel Billing</button>\`;
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

  // ---- Move to Roster (Skills Training / Join Sultans FC → Players Roster) ----

  let moveModalCtx = null;

  function openMoveModal(sourceType, id, row, onSent){
    moveModalCtx = { sourceType, id, onSent };
    const label = sourceType === 'skills' ? row.full_name : row.child_name;
    document.getElementById('moveModalSub').textContent = label;
    // Prefill whatever the source registration already has — both forms now
    // collect grade (skills: row.grade; join: row.age_group) and session_type
    // directly from parents at signup, so this is usually already correct.
    document.getElementById('moveGrade').value = row.grade || row.age_group || 'pre-k';
    document.getElementById('moveSessionType').value = row.session_type || 'one';
    document.getElementById('moveRch').checked = true;
    // Skills Training applicants default to RCH-only, but the admin can still
    // check Sultans too if this player is also joining that squad. Join
    // Sultans FC registrations default with Sultans already checked (which
    // implies RCH).
    document.getElementById('moveSultans').checked = sourceType === 'join';
    document.getElementById('moveSultans').disabled = false;
    document.getElementById('moveSultans').closest('.checkbox-row').style.display = '';
    document.getElementById('moveRch').disabled = sourceType === 'join';
    document.getElementById('moveParentName').value = row.parent_name || row.full_name || '';
    document.getElementById('moveParentPhone').value = row.phone || '';
    document.getElementById('moveParentEmail').value = row.email || '';
    document.getElementById('moveModalError').textContent = '';
    document.getElementById('moveToRosterModal').classList.remove('hidden');
  }

  document.getElementById('moveSultans').addEventListener('change', (e) => {
    if (e.target.checked) {
      document.getElementById('moveRch').checked = true;
      document.getElementById('moveRch').disabled = true;
    } else {
      document.getElementById('moveRch').disabled = false;
    }
  });

  document.getElementById('moveModalCancel').addEventListener('click', () => {
    document.getElementById('moveToRosterModal').classList.add('hidden');
    document.getElementById('moveRch').disabled = false;
    document.getElementById('moveSultans').disabled = false;
    moveModalCtx = null;
  });

  document.getElementById('moveModalSubmit').addEventListener('click', async () => {
    if (!moveModalCtx) return;
    const errEl = document.getElementById('moveModalError');
    errEl.textContent = '';
    const payload = {
      sourceType: moveModalCtx.sourceType,
      sourceId: moveModalCtx.id,
      grade: document.getElementById('moveGrade').value,
      sessionType: document.getElementById('moveSessionType').value,
      rch: document.getElementById('moveRch').checked,
      sultans: document.getElementById('moveSultans').checked,
      parentName: document.getElementById('moveParentName').value.trim(),
      parentPhone: document.getElementById('moveParentPhone').value.trim(),
      parentEmail: document.getElementById('moveParentEmail').value.trim(),
    };
    const btn = document.getElementById('moveModalSubmit');
    btn.disabled = true;
    btn.textContent = 'Moving…';
    try {
      const result = await api('/api/admin/move-to-roster', { method: 'POST', body: JSON.stringify(payload) });
      if (result.error) {
        errEl.textContent = result.error;
      } else {
        document.getElementById('moveToRosterModal').classList.add('hidden');
        document.getElementById('moveRch').disabled = false;
        const ctx = moveModalCtx;
        moveModalCtx = null;
        await ctx.onSent();
        await Promise.all([loadSummary(), loadRoster()]);
      }
    } catch (e) {
      errEl.textContent = (e && e.message === 'Unauthorized')
        ? 'Your admin session expired — please log back in and try again.'
        : 'Could not reach the server. Please check your connection and try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Move to Roster';
    }
  });

  function wireMoveToRosterButtons(wrapId, sourceType, rows, onSent){
    const wrap = document.getElementById(wrapId);
    wrap.querySelectorAll('.btn-move-to-roster').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const row = rows.find((r) => String(r.id) === id);
        if (row) openMoveModal(sourceType, id, row, onSent);
      });
    });
  }

  function wirePaymentLinkButtons(wrapId, registrationType, onSent){
    const wrap = document.getElementById(wrapId);
    wrap.querySelectorAll('.btn-payment-link').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const label = btn.getAttribute('data-label') || '';
        const sessionType = btn.getAttribute('data-session') || null;
        openPaymentModal(registrationType, id, label, onSent, sessionType);
      });
    });
  }

  // ---- Send Payment Link modal (service tier + season picker) ----

  // Populated from /api/admin/payment-pricing by loadPaymentPricing() — kept
  // live here (rather than hardcoded) so a price change in the "Payment Link
  // Amounts" box takes effect immediately without a code deploy.
  let PAYMENT_PRICING = { oneSessionMonthlyCents: 6000, twoSessionMonthlyCents: 10000, kitFeeCents: 5000, onlineCourseMonthlyCents: 3120 };
  function currentTiers(){
    return {
      one: { label: '1x/week', monthly: PAYMENT_PRICING.oneSessionMonthlyCents },
      two: { label: '2x/week', monthly: PAYMENT_PRICING.twoSessionMonthlyCents },
      online: { label: 'Online Course', monthly: PAYMENT_PRICING.onlineCourseMonthlyCents },
    };
  }
  const SEASON_LABELS = { regular: 'Regular Season', summer: 'Summer' };
  // Regular season runs Aug 3 – May 3; Summer runs Jun 3 – Jul 3. Winter
  // break within the regular season is handled per-family with the Pause
  // Billing button instead of being a separate season here.
  const SEASON_END_DEFAULTS = { regular: [5, 3], summer: [7, 3] };

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
    const tier = currentTiers()[document.getElementById('tierSelect').value];
    const monthlyText = '$' + (tier.monthly / 100).toFixed(2) + '/mo';
    const includeKit = document.getElementById('includeKitFee').checked;
    const kitText = includeKit ? 'Kit fee (one-time): $' + (PAYMENT_PRICING.kitFeeCents / 100).toFixed(2) + '<br>' : '';
    document.getElementById('modalAmounts').innerHTML =
      kitText + 'Full monthly rate: ' + monthlyText +
      '<br><span style="color:#888;">First charge is prorated automatically for the Tue/Thu practices left this month.</span>';
  }

  function openPaymentModal(registrationType, id, label, onSent, sessionType){
    paymentModalCtx = { registrationType, id, onSent };
    document.getElementById('paymentModalSub').textContent = label;
    const tierSelect = document.getElementById('tierSelect');
    const tierNote = document.getElementById('tierSelectNote');
    if (sessionType && currentTiers()[sessionType]) {
      // Follow whatever this player's Sessions setting already says on the
      // roster, instead of letting the admin pick a different tier here and
      // risk it drifting out of sync — change it on the roster row instead.
      tierSelect.value = sessionType;
      tierSelect.disabled = true;
      tierNote.textContent = "Matches this player's Sessions setting on the roster. To change it, edit the player first.";
    } else {
      tierSelect.value = 'one';
      tierSelect.disabled = false;
      tierNote.textContent = '';
    }
    document.getElementById('seasonSelect').value = 'regular';
    document.getElementById('seasonEndInput').value = computeSeasonEndDate('regular');
    document.getElementById('includeKitFee').checked = false;
    document.getElementById('includeKitFeeLabel').textContent = 'Include kit fee ($' + (PAYMENT_PRICING.kitFeeCents / 100).toFixed(2) + ')';
    document.getElementById('paymentModalError').textContent = '';
    updateModalAmounts();
    document.getElementById('paymentModal').classList.remove('hidden');
  }

  function closePaymentModal(){
    document.getElementById('paymentModal').classList.add('hidden');
    paymentModalCtx = null;
  }

  document.getElementById('tierSelect').addEventListener('change', updateModalAmounts);
  document.getElementById('includeKitFee').addEventListener('change', updateModalAmounts);
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
    const tier = currentTiers()[tierKey];
    const seasonKey = document.getElementById('seasonSelect').value;
    const tierLabel = tier.label + ' — ' + SEASON_LABELS[seasonKey];
    const includeKit = document.getElementById('includeKitFee').checked;
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
          oneTimeAmount: includeKit ? PAYMENT_PRICING.kitFeeCents : 0,
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

  // ---- Pause / Resume Billing (e.g. winter break travel) ----

  let pauseModalCtx = null;

  function openPauseModal(registrationType, id, label, onSent){
    pauseModalCtx = { registrationType, id, onSent };
    document.getElementById('pauseModalSub').textContent = label;
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    document.getElementById('resumeDateInput').value = d.toISOString().slice(0, 10);
    document.getElementById('pauseModalError').textContent = '';
    document.getElementById('pauseModal').classList.remove('hidden');
  }
  function closePauseModal(){
    document.getElementById('pauseModal').classList.add('hidden');
    pauseModalCtx = null;
  }
  document.getElementById('pauseModalCancel').addEventListener('click', closePauseModal);

  document.getElementById('pauseModalSend').addEventListener('click', async () => {
    if (!pauseModalCtx) return;
    const resumesAt = document.getElementById('resumeDateInput').value;
    const errEl = document.getElementById('pauseModalError');
    errEl.textContent = '';
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(resumesAt)) {
      errEl.textContent = 'Please pick a valid resume date.';
      return;
    }
    const ctx = pauseModalCtx;
    const btn = document.getElementById('pauseModalSend');
    btn.disabled = true;
    btn.textContent = 'Pausing…';
    try {
      const result = await api('/api/admin/payment-links/pause', {
        method: 'POST',
        body: JSON.stringify({ registrationType: ctx.registrationType, registrationId: ctx.id, resumesAt }),
      });
      if (result.error) {
        errEl.textContent = result.error;
      } else {
        closePauseModal();
        await ctx.onSent();
      }
    } catch (e) {
      errEl.textContent = 'Could not pause billing. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Pause';
    }
  });

  function wirePauseButtons(wrapId, registrationType, onSent){
    const wrap = document.getElementById(wrapId);
    wrap.querySelectorAll('.btn-pause-toggle').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const label = btn.getAttribute('data-label') || '';
        const isPaused = btn.getAttribute('data-paused') === 'true';
        if (isPaused) {
          if (!confirm('Resume billing for ' + label + ' now?')) return;
          btn.disabled = true;
          try {
            await api('/api/admin/payment-links/resume', {
              method: 'POST',
              body: JSON.stringify({ registrationType, registrationId: id }),
            });
            await onSent();
          } catch (e) {
            alert('Could not resume billing. Please try again.');
            btn.disabled = false;
          }
        } else {
          openPauseModal(registrationType, id, label, onSent);
        }
      });
    });
  }

  // Ends a family's subscription outright (e.g. to stop an old rate before a
  // price change takes effect, rather than letting it auto-charge). Works
  // whether the subscription is still in its initial trial period (nothing
  // has been charged yet) or already active — either way it just stops.
  function wireCancelButtons(wrapId, registrationType, onSent){
    const wrap = document.getElementById(wrapId);
    wrap.querySelectorAll('.btn-cancel-billing').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const label = btn.getAttribute('data-label') || '';
        if (!confirm('Cancel billing for ' + label + '? This stops their subscription immediately and cannot be undone — you\\'d need to send a new payment link to restart it.')) return;
        btn.disabled = true;
        try {
          const result = await api('/api/admin/payment-links/cancel', {
            method: 'POST',
            body: JSON.stringify({ registrationType, registrationId: id }),
          });
          if (result && result.error) {
            alert(result.error);
            btn.disabled = false;
          } else {
            await onSent();
          }
        } catch (e) {
          alert('Could not cancel billing. Please try again.');
          btn.disabled = false;
        }
      });
    });
  }

  // ---- Charges (Finances) ----

  function renderChargesTable(rows){
    if (!rows.length) return '<div class="empty">No charges yet.</div>';
    let html = '<table><thead><tr><th>Description</th><th>Amount</th><th>Type</th><th>Month</th><th></th></tr></thead><tbody>';
    rows.forEach((c) => {
      html += '<tr>' +
        '<td>' + escapeHtml(c.description) + '</td>' +
        '<td>$' + (c.amount_cents / 100).toFixed(2) + '</td>' +
        '<td>' + (c.kind === 'recurring' ? 'Recurring' : 'One-time') + '</td>' +
        '<td>' + (c.charge_month ? String(c.charge_month).slice(0, 10) : '—') + '</td>' +
        '<td><button type="button" class="btn-delete-row" data-id="' + c.id + '">Delete</button></td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  async function loadCharges(){
    const rows = await api('/api/admin/charges');
    const wrap = document.getElementById('chargesTableWrap');
    wrap.innerHTML = renderChargesTable(rows);
    wrap.querySelectorAll('.btn-delete-row').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this charge?')) return;
        btn.disabled = true;
        try {
          await api('/api/admin/charges/' + btn.getAttribute('data-id'), { method: 'DELETE' });
          await loadCharges();
        } catch (e) {
          alert('Could not delete this charge. Please try again.');
          btn.disabled = false;
        }
      });
    });
  }

  document.getElementById('chargeKindInput').addEventListener('change', (e) => {
    document.getElementById('chargeMonthWrap').classList.toggle('hidden', e.target.value !== 'one_time');
  });

  document.getElementById('addChargeBtn').addEventListener('click', async () => {
    const description = document.getElementById('chargeDescInput').value.trim();
    const amountCents = Math.round(parseFloat(document.getElementById('chargeAmountInput').value || '0') * 100);
    const kind = document.getElementById('chargeKindInput').value;
    const chargeMonth = document.getElementById('chargeMonthInput').value;
    if (!description) { alert('Please enter a description.'); return; }
    if (kind === 'one_time' && !chargeMonth) { alert('Please pick a month for this one-time charge.'); return; }
    const btn = document.getElementById('addChargeBtn');
    btn.disabled = true;
    try {
      const result = await api('/api/admin/charges', {
        method: 'POST',
        body: JSON.stringify({ description, amountCents, kind, chargeMonth: kind === 'one_time' ? chargeMonth : undefined }),
      });
      if (result.error) {
        alert(result.error);
      } else {
        document.getElementById('chargeDescInput').value = '';
        document.getElementById('chargeAmountInput').value = '';
        document.getElementById('chargeMonthInput').value = '';
        await loadCharges();
      }
    } catch (e) {
      alert('Could not add this charge. Please try again.');
    } finally {
      btn.disabled = false;
    }
  });

  // ---- Coaches ----

  const ALL_GRADE_LABELS = {
    'pre-k':'Pre-K', 'kindergarten':'Kindergarten', '1st-grade':'1st Grade', '2nd-grade':'2nd Grade',
    '3rd-grade':'3rd Grade', '4th-grade':'4th Grade', '5th-grade':'5th Grade', '6th-grade':'6th Grade',
  };

  function renderCoachesTable(rows){
    if (!rows.length) return '<div class="empty">No coaches yet.</div>';
    let html = '<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Grades</th><th>RCH</th><th>Sultans</th><th>Notes</th><th></th></tr></thead><tbody>';
    rows.forEach((c) => {
      const gradeLabels = (c.grades || []).map((g) => ALL_GRADE_LABELS[g] || g).join(', ') || '—';
      html += '<tr>' +
        '<td>' + escapeHtml(c.name) + '</td>' +
        '<td>' + escapeHtml(c.email || '') + '</td>' +
        '<td>' + escapeHtml(c.phone || '') + '</td>' +
        '<td>' + gradeLabels + '</td>' +
        '<td>' + (c.rch ? '✓' : '—') + '</td>' +
        '<td>' + (c.sultans ? '✓' : '—') + '</td>' +
        '<td>' + escapeHtml(c.notes || '') + '</td>' +
        '<td style="display:flex; gap:6px; flex-wrap:wrap;">' +
          '<button type="button" class="btn-edit-row" data-id="' + c.id + '">Edit</button>' +
          '<button type="button" class="btn-delete-row" data-id="' + c.id + '">Delete</button>' +
        '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  let coachRows = [];
  let editCoachId = null;

  async function loadCoaches(){
    coachRows = await api('/api/admin/coaches');
    const wrap = document.getElementById('coachesTableWrap');
    wrap.innerHTML = renderCoachesTable(coachRows);
    wrap.querySelectorAll('.btn-delete-row').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this coach?')) return;
        btn.disabled = true;
        try {
          await api('/api/admin/coaches/' + btn.getAttribute('data-id'), { method: 'DELETE' });
          await loadCoaches();
        } catch (e) {
          alert('Could not delete this coach. Please try again.');
          btn.disabled = false;
        }
      });
    });
    wrap.querySelectorAll('.btn-edit-row').forEach((btn) => {
      btn.addEventListener('click', () => {
        const coach = coachRows.find((c) => String(c.id) === btn.getAttribute('data-id'));
        if (coach) openCoachModal(coach);
      });
    });
  }

  function openCoachModal(coach){
    editCoachId = coach ? coach.id : null;
    document.getElementById('coachModalTitle').textContent = coach ? 'Edit Coach' : 'Add Coach';
    document.getElementById('coachName').value = coach ? coach.name : '';
    document.getElementById('coachEmail').value = coach ? (coach.email || '') : '';
    document.getElementById('coachPhone').value = coach ? (coach.phone || '') : '';
    document.getElementById('coachRch').checked = coach ? !!coach.rch : false;
    document.getElementById('coachSultans').checked = coach ? !!coach.sultans : false;
    document.getElementById('coachNotes').value = coach ? (coach.notes || '') : '';
    const grades = coach ? (coach.grades || []) : [];
    GRADES.forEach((g) => {
      const cb = document.getElementById('coachGrade_' + g);
      if (cb) cb.checked = grades.includes(g);
    });
    document.getElementById('coachModalError').textContent = '';
    document.getElementById('coachModal').classList.remove('hidden');
  }

  document.getElementById('addCoachBtn').addEventListener('click', () => openCoachModal(null));
  document.getElementById('coachModalCancel').addEventListener('click', () => {
    document.getElementById('coachModal').classList.add('hidden');
    editCoachId = null;
  });
  document.getElementById('coachModalSubmit').addEventListener('click', async () => {
    const errEl = document.getElementById('coachModalError');
    errEl.textContent = '';
    const name = document.getElementById('coachName').value.trim();
    if (!name) { errEl.textContent = "Please enter the coach's name."; return; }
    const grades = GRADES.filter((g) => document.getElementById('coachGrade_' + g) && document.getElementById('coachGrade_' + g).checked);
    const payload = {
      name,
      email: document.getElementById('coachEmail').value.trim(),
      phone: document.getElementById('coachPhone').value.trim(),
      grades,
      rch: document.getElementById('coachRch').checked,
      sultans: document.getElementById('coachSultans').checked,
      notes: document.getElementById('coachNotes').value.trim(),
    };
    const btn = document.getElementById('coachModalSubmit');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      const result = editCoachId
        ? await api('/api/admin/coaches/' + editCoachId, { method: 'PUT', body: JSON.stringify(payload) })
        : await api('/api/admin/coaches', { method: 'POST', body: JSON.stringify(payload) });
      if (result.error) {
        errEl.textContent = result.error;
      } else {
        document.getElementById('coachModal').classList.add('hidden');
        editCoachId = null;
        await loadCoaches();
      }
    } catch (e) {
      errEl.textContent = 'Could not save this coach. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save';
    }
  });

  // ---- Data: monthly snapshots + archived (unsubscribed) players ----

  function renderSnapshotsTable(rows){
    if (!rows.length) return '<div class="empty">No snapshots yet.</div>';
    let html = '<table><thead><tr><th>Month</th><th>Revenue</th><th>Charges</th><th>Net</th><th></th></tr></thead><tbody>';
    rows.forEach((s) => {
      html += '<tr>' +
        '<td>' + String(s.month).slice(0, 7) + '</td>' +
        '<td>$' + (s.total_revenue_cents / 100).toFixed(2) + '</td>' +
        '<td>$' + (s.total_charges_cents / 100).toFixed(2) + '</td>' +
        '<td>$' + (s.net_cents / 100).toFixed(2) + '</td>' +
        '<td><a class="btn-export" href="#" data-month="' + String(s.month).slice(0, 10) + '">Download CSV</a></td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  async function loadSnapshots(){
    const rows = await api('/api/admin/monthly-snapshots');
    const wrap = document.getElementById('snapshotsTableWrap');
    wrap.innerHTML = renderSnapshotsTable(rows);
    wrap.querySelectorAll('a[data-month]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const month = a.getAttribute('data-month');
        window.open(API_BASE + '/api/admin/monthly-snapshots/' + month + '/csv?token=' + encodeURIComponent(getToken()));
      });
    });
  }

  document.getElementById('generateSnapshotBtn').addEventListener('click', async () => {
    const btn = document.getElementById('generateSnapshotBtn');
    btn.disabled = true;
    try {
      const result = await api('/api/admin/monthly-snapshots/generate', { method: 'POST', body: JSON.stringify({}) });
      if (result.error) alert(result.error);
      else await loadSnapshots();
    } catch (e) {
      alert('Could not generate this snapshot. Please try again.');
    } finally {
      btn.disabled = false;
    }
  });

  function renderArchivedTable(rows){
    if (!rows.length) return '<div class="empty">No unsubscribed players.</div>';
    let html = '<table><thead><tr><th>Name</th><th>Grade</th><th>Parent</th><th></th></tr></thead><tbody>';
    rows.forEach((r) => {
      html += '<tr>' +
        '<td>' + escapeHtml(r.player_name) + '</td>' +
        '<td>' + (ALL_GRADE_LABELS[r.grade] || r.grade) + '</td>' +
        '<td>' + escapeHtml(r.parent_name || '') + '</td>' +
        '<td><button type="button" class="btn-payment-link" data-id="' + r.id + '">Restore to Roster</button></td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  async function loadArchivedPlayers(){
    const rows = await api('/api/admin/players?archived=true');
    const wrap = document.getElementById('archivedTableWrap');
    wrap.innerHTML = renderArchivedTable(rows);
    wrap.querySelectorAll('.btn-payment-link').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await api('/api/admin/players/' + btn.getAttribute('data-id') + '/unarchive', { method: 'PUT' });
          await loadArchivedPlayers();
        } catch (e) {
          alert('Could not restore this player. Please try again.');
          btn.disabled = false;
        }
      });
    });
  }

  // ---- Manually add a registration (for families you know personally) ----

  document.getElementById('addSkillsBtn').addEventListener('click', () => {
    ['asFullName','asParentName','asDob','asEmail','asPhone','asTeam','asExperience','asNotes'].forEach((id) => {
      document.getElementById(id).value = '';
    });
    document.getElementById('asGrade').value = '';
    document.getElementById('asSessionType').value = '';
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
      parentName: document.getElementById('asParentName').value.trim(),
      dob: document.getElementById('asDob').value,
      email: document.getElementById('asEmail').value.trim(),
      phone: document.getElementById('asPhone').value.trim(),
      team: document.getElementById('asTeam').value.trim(),
      experience: document.getElementById('asExperience').value.trim(),
      notes: document.getElementById('asNotes').value.trim(),
      grade: document.getElementById('asGrade').value,
      sessionType: document.getElementById('asSessionType').value,
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
    document.getElementById('ajSessionType').value = '';
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
      sessionType: document.getElementById('ajSessionType').value,
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
      <div class="card"><div class="n">\${s.potentialRchCount ?? 0}</div><div class="l">Potential RCH</div></div>
      <div class="card"><div class="n">\${s.potentialSultansCount ?? 0}</div><div class="l">Potential Sultans</div></div>
      <div class="card"><div class="n">\${s.skillsTrainingCount}</div><div class="l">Skills Training</div></div>
      \${groups.map(g => \`<div class="card"><div class="n">\${counts[g]}</div><div class="l">Join FC \${groupLabels[g]}</div></div>\`).join('')}
    \`;
  }

  function paymentLabel(row){
    if (row.payment_status === 'completed') {
      if (row.paused_until && new Date(row.paused_until) > new Date()) {
        return 'Paused until ' + String(row.paused_until).slice(0, 10);
      }
      if (row.last_payment_status === 'failed') return 'Declined';
      return 'Paid';
    }
    if (row.payment_status === 'canceled') return 'Canceled';
    if (row.payment_status === 'pending') return 'Pending';
    return 'Not sent';
  }

  function paymentLabelClass(row){
    const label = paymentLabel(row);
    if (label === 'Paid') return 'status-paid';
    if (label === 'Declined') return 'status-declined';
    if (label === 'Pending') return 'status-pending';
    return 'status-neutral';
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
    ], { onDelete: true, onMoveToRoster: true, labelKey: 'full_name' });
    wireDeleteButtons('skillsTableWrap', async (id) => {
      await api('/api/admin/skills-registrations/' + id, { method: 'DELETE' });
      await Promise.all([loadSummary(), loadSkills()]);
    });
    wireMoveToRosterButtons('skillsTableWrap', 'skills', rows, async () => { await Promise.all([loadSummary(), loadSkills()]); });
  }

  const GRADE_LABELS = {
    'pre-k':'Pre-K', 'kindergarten':'Kindergarten', '1st-grade':'1st Grade', '2nd-grade':'2nd Grade',
    '3rd-grade':'3rd Grade', '4th-grade':'4th Grade', '5th-grade':'5th Grade', '6th-grade':'6th Grade',
  };

  async function loadJoin(){
    const ageGroup = document.getElementById('ageGroupFilter').value;
    const rows = await api('/api/admin/join-registrations' + (ageGroup ? '?ageGroup=' + encodeURIComponent(ageGroup) : ''));
    const displayRows = rows.map(r => ({ ...r, age_group: GRADE_LABELS[r.age_group] || r.age_group }));
    document.getElementById('joinTableWrap').innerHTML = renderTable(displayRows, [
      { key:'jersey_number', label:'#' },
      { key:'age_group', label:'Grade' },
      { key:'child_name', label:'Player' },
      { key:'dob', label:'DOB' },
      { key:'parent_name', label:'Parent' },
      { key:'email', label:'Email' },
      { key:'phone', label:'Phone' },
      { key:'availability', label:'Availability' },
      { key:'submitted_at', label:'Submitted' },
    ], { onDelete: true, onMoveToRoster: true, labelKey: 'child_name' });
    wireDeleteButtons('joinTableWrap', async (id) => {
      await api('/api/admin/join-registrations/' + id, { method: 'DELETE' });
      await Promise.all([loadSummary(), loadJoin()]);
    });
    wireMoveToRosterButtons('joinTableWrap', 'join', rows, async () => { await Promise.all([loadSummary(), loadJoin()]); });
  }

  // ---- Players Roster, Season Overview, Pricing & Revenue ----

  const GRADES = ['pre-k','kindergarten','1st-grade','2nd-grade','3rd-grade','4th-grade','5th-grade','6th-grade'];
  let currentPricing = { priceOneCents: 15000, priceTwoCents: 25000 };
  let lastOverview = null;

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Closes any open row-action "⋯" menus — called before opening a new one,
  // and on any click outside a menu, so at most one stays open at a time.
  function closeAllRowMenus(){
    document.querySelectorAll('.row-menu').forEach((m) => m.classList.add('hidden'));
  }
  document.addEventListener('click', closeAllRowMenus);

  function renderRosterTable(rows){
    if (!rows.length) return '<div class="empty">No players yet.</div>';
    let html = '<table><thead><tr>' +
      '<th>Name</th><th>DOB</th><th>Parent</th><th>Phone</th><th>Email</th>' +
      '<th>Sessions</th><th>RCH</th><th>Sultans</th><th>Discount</th><th>Payment Status</th><th></th>' +
      '</tr></thead><tbody>';
    rows.forEach((r) => {
      const label = escapeHtml(r.player_name);
      html += '<tr>' +
        '<td>' + escapeHtml(r.player_name) + '</td>' +
        '<td>' + escapeHtml(r.dob || '') + '</td>' +
        '<td>' + escapeHtml(r.parent_name || '') + '</td>' +
        '<td>' + escapeHtml(r.parent_phone || '') + '</td>' +
        '<td>' + escapeHtml(r.parent_email || '') + '</td>' +
        '<td>' + (r.session_type === 'two' ? 'Two' : r.session_type === 'online' ? 'Online' : 'One') + '</td>' +
        '<td>' + (r.rch ? '✓' : '—') + '</td>' +
        '<td>' + (r.sultans ? '✓' : '—') + '</td>' +
        '<td>$' + (r.discount_cents / 100).toFixed(2) + '</td>' +
        '<td><span class="status-badge ' + paymentLabelClass(r) + '">' + escapeHtml(paymentLabel(r)) + '</span></td>' +
        '<td>' +
          '<div class="row-actions">' +
            '<button type="button" class="btn-payment-link" data-id="' + r.id + '" data-label="' + label + '" data-session="' + (r.session_type || 'one') + '">Send Payment Link</button>' +
            '<button type="button" class="btn-kebab" aria-label="More actions">⋯</button>' +
            '<div class="row-menu hidden">' +
              '<button type="button" class="btn-cancel-billing" data-id="' + r.id + '" data-label="' + label + '">Cancel Billing</button>' +
              '<button type="button" class="btn-unsubscribe" data-id="' + r.id + '" data-label="' + label + '">Unsubscribe</button>' +
              '<button type="button" class="btn-edit-row" data-id="' + r.id + '">Edit</button>' +
              '<button type="button" class="btn-delete-row" data-id="' + r.id + '">Delete</button>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  let editPlayerId = null;

  function openEditPlayerModal(player){
    editPlayerId = player.id;
    document.getElementById('epGrade').value = player.grade;
    document.getElementById('epName').value = player.player_name || '';
    document.getElementById('epDob').value = player.dob || '';
    document.getElementById('epParentName').value = player.parent_name || '';
    document.getElementById('epParentPhone').value = player.parent_phone || '';
    document.getElementById('epParentEmail').value = player.parent_email || '';
    document.getElementById('epSessions').value = player.session_type === 'two' ? 'two' : 'one';
    document.getElementById('epRch').checked = !!player.rch;
    document.getElementById('epSultans').checked = !!player.sultans;
    document.getElementById('epDiscount').value = (player.discount_cents / 100).toFixed(2);
    document.getElementById('editPlayerError').textContent = '';
    document.getElementById('editPlayerModal').classList.remove('hidden');
  }
  document.getElementById('editPlayerCancel').addEventListener('click', () => {
    document.getElementById('editPlayerModal').classList.add('hidden');
    editPlayerId = null;
  });
  document.getElementById('editPlayerSubmit').addEventListener('click', async () => {
    if (!editPlayerId) return;
    const errEl = document.getElementById('editPlayerError');
    errEl.textContent = '';
    const payload = {
      grade: document.getElementById('epGrade').value,
      playerName: document.getElementById('epName').value.trim(),
      dob: document.getElementById('epDob').value,
      parentName: document.getElementById('epParentName').value.trim(),
      parentPhone: document.getElementById('epParentPhone').value.trim(),
      parentEmail: document.getElementById('epParentEmail').value.trim(),
      sessionType: document.getElementById('epSessions').value,
      rch: document.getElementById('epRch').checked,
      sultans: document.getElementById('epSultans').checked,
      discountCents: Math.round(parseFloat(document.getElementById('epDiscount').value || '0') * 100),
    };
    if (!payload.playerName) { errEl.textContent = "Please enter the player's name."; return; }
    const btn = document.getElementById('editPlayerSubmit');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      const result = await api('/api/admin/players/' + editPlayerId, { method: 'PUT', body: JSON.stringify(payload) });
      if (result.error) {
        errEl.textContent = result.error;
      } else {
        document.getElementById('editPlayerModal').classList.add('hidden');
        editPlayerId = null;
        await Promise.all([loadRoster(), loadOverviewAndRevenue()]);
      }
    } catch (e) {
      errEl.textContent = 'Could not save changes. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save';
    }
  });

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
    wrap.querySelectorAll('.btn-edit-row').forEach((btn) => {
      btn.addEventListener('click', () => {
        const player = rows.find((r) => String(r.id) === btn.getAttribute('data-id'));
        if (player) openEditPlayerModal(player);
      });
    });
    wirePaymentLinkButtons('rosterTableWrap', 'player', loadRoster);
    wireCancelButtons('rosterTableWrap', 'player', loadRoster);
    wrap.querySelectorAll('.btn-kebab').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        const wasHidden = menu.classList.contains('hidden');
        closeAllRowMenus();
        if (wasHidden) menu.classList.remove('hidden');
      });
    });
    wrap.querySelectorAll('.btn-unsubscribe').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const label = btn.getAttribute('data-label') || 'this player';
        if (!confirm('Unsubscribe ' + label + '? Make sure you\\'ve already clicked Cancel Billing first if they have an active subscription — this just moves them off the active roster into Data → Unsubscribed Players, it does not touch Stripe.')) return;
        btn.disabled = true;
        try {
          await api('/api/admin/players/' + btn.getAttribute('data-id') + '/archive', { method: 'PUT' });
          await Promise.all([loadRoster(), loadOverviewAndRevenue(), loadSummary()]);
        } catch (e) {
          alert('Could not unsubscribe this player. Please try again.');
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

  // ---- Payment Link Amounts (what "Send Payment Link" actually charges) ----

  async function loadPaymentPricing(){
    const p = await api('/api/admin/payment-pricing');
    PAYMENT_PRICING = p;
    document.getElementById('paymentOneInput').value = (p.oneSessionMonthlyCents / 100).toFixed(2);
    document.getElementById('paymentTwoInput').value = (p.twoSessionMonthlyCents / 100).toFixed(2);
    document.getElementById('kitFeeInput').value = (p.kitFeeCents / 100).toFixed(2);
    document.getElementById('onlineCourseInput').value = (p.onlineCourseMonthlyCents / 100).toFixed(2);
  }

  document.getElementById('savePaymentPricingBtn').addEventListener('click', async () => {
    const oneSessionMonthlyCents = Math.round(parseFloat(document.getElementById('paymentOneInput').value || '0') * 100);
    const twoSessionMonthlyCents = Math.round(parseFloat(document.getElementById('paymentTwoInput').value || '0') * 100);
    const kitFeeCents = Math.round(parseFloat(document.getElementById('kitFeeInput').value || '0') * 100);
    const onlineCourseMonthlyCents = Math.round(parseFloat(document.getElementById('onlineCourseInput').value || '0') * 100);
    const btn = document.getElementById('savePaymentPricingBtn');
    btn.disabled = true;
    try {
      PAYMENT_PRICING = await api('/api/admin/payment-pricing', {
        method: 'POST',
        body: JSON.stringify({ oneSessionMonthlyCents, twoSessionMonthlyCents, kitFeeCents, onlineCourseMonthlyCents }),
      });
      const savedMsg = document.getElementById('paymentPricingSaved');
      savedMsg.textContent = 'Saved.';
      setTimeout(() => { savedMsg.textContent = ''; }, 2000);
    } catch (e) {
      alert('Could not save payment amounts. Please try again.');
    } finally {
      btn.disabled = false;
    }
  });

  // ---- Proration Mode (lock at link creation vs. calculate live) ----

  async function loadProrationMode(){
    const { mode } = await api('/api/admin/proration-mode');
    document.getElementById('lockProrationCheckbox').checked = (mode === 'locked');
  }

  document.getElementById('saveProrationModeBtn').addEventListener('click', async () => {
    const mode = document.getElementById('lockProrationCheckbox').checked ? 'locked' : 'live';
    const btn = document.getElementById('saveProrationModeBtn');
    btn.disabled = true;
    try {
      await api('/api/admin/proration-mode', {
        method: 'POST',
        body: JSON.stringify({ mode }),
      });
      const savedMsg = document.getElementById('prorationModeSaved');
      savedMsg.textContent = 'Saved.';
      setTimeout(() => { savedMsg.textContent = ''; }, 2000);
    } catch (e) {
      alert('Could not save proration mode. Please try again.');
    } finally {
      btn.disabled = false;
    }
  });

  // ---- One-Time Payments (stand-alone payment links, not tied to a registration) ----

  function renderOneTimePaymentsTable(rows){
    if (!rows.length) return '<div class="empty">No one-time payment links yet.</div>';
    let html = '<table><thead><tr><th>Title</th><th>Description</th><th>Amount</th><th>Status</th><th>Link</th><th></th></tr></thead><tbody>';
    rows.forEach((p) => {
      html += '<tr>' +
        '<td>' + escapeHtml(p.title) + '</td>' +
        '<td>' + escapeHtml(p.description || '—') + '</td>' +
        '<td>$' + (p.amount_cents / 100).toFixed(2) + '</td>' +
        '<td>' + (p.status === 'completed' ? 'Paid' : 'Pending') + '</td>' +
        '<td><button type="button" class="btn-payment-link btn-copy-link" data-token="' + p.token + '">Copy link</button></td>' +
        '<td>' + (p.status === 'pending' ? '<button type="button" class="btn-delete-row" data-id="' + p.id + '">Delete</button>' : '') + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  async function loadOneTimePayments(){
    const rows = await api('/api/admin/one-time-payments');
    const wrap = document.getElementById('oneTimePaymentsTableWrap');
    wrap.innerHTML = renderOneTimePaymentsTable(rows);
    wrap.querySelectorAll('.btn-copy-link').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const link = location.origin + '/pay/one-time/' + btn.getAttribute('data-token');
        try {
          await navigator.clipboard.writeText(link);
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = original; }, 1500);
        } catch (e) {
          prompt('Copy this link:', link);
        }
      });
    });
    wrap.querySelectorAll('.btn-delete-row').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this payment link?')) return;
        btn.disabled = true;
        try {
          await api('/api/admin/one-time-payments/' + btn.getAttribute('data-id'), { method: 'DELETE' });
          await loadOneTimePayments();
        } catch (e) {
          alert('Could not delete this payment link. Please try again.');
          btn.disabled = false;
        }
      });
    });
  }

  document.getElementById('addOneTimePaymentBtn').addEventListener('click', async () => {
    const title = document.getElementById('otpTitleInput').value.trim();
    const description = document.getElementById('otpDescInput').value.trim();
    const amountCents = Math.round(parseFloat(document.getElementById('otpAmountInput').value || '0') * 100);
    if (!title) { alert('Please enter a title.'); return; }
    if (!amountCents || amountCents <= 0) { alert('Please enter an amount greater than $0.'); return; }
    const btn = document.getElementById('addOneTimePaymentBtn');
    btn.disabled = true;
    try {
      const result = await api('/api/admin/one-time-payments', {
        method: 'POST',
        body: JSON.stringify({ title, description, amountCents }),
      });
      if (result.error) {
        alert(result.error);
      } else {
        document.getElementById('otpTitleInput').value = '';
        document.getElementById('otpDescInput').value = '';
        document.getElementById('otpAmountInput').value = '';
        await loadOneTimePayments();
      }
    } catch (e) {
      alert('Could not create this payment link. Please try again.');
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
    document.getElementById('exportRosterLink').addEventListener('click', (e) => {
      e.preventDefault();
      window.open(API_BASE + '/api/admin/export/roster.csv?token=' + encodeURIComponent(getToken()));
    });
  }

  // ---- Section navigation (Registrations / Finances / Charges / Coaches / Data) ----

  const SECTION_IDS = ['registrations', 'finances', 'charges', 'coaches', 'data'];
  function showSection(name){
    SECTION_IDS.forEach((id) => {
      document.getElementById('section-' + id).classList.toggle('hidden', id !== name);
    });
  }
  document.getElementById('sectionNav').addEventListener('change', async (e) => {
    const name = e.target.value;
    showSection(name);
    if (name === 'charges' && !chargesLoaded) { chargesLoaded = true; await loadCharges(); }
    if (name === 'coaches' && !coachesLoaded) { coachesLoaded = true; await loadCoaches(); }
    if (name === 'data') { await Promise.all([loadSnapshots(), loadArchivedPlayers()]); }
  });
  let chargesLoaded = false;
  let coachesLoaded = false;

  // Join Sultans FC registration can be open/closed per grade, so the toggle
  // tracks whichever grade is currently selected in the ageGroupFilter
  // dropdown — switching grades re-reads that grade's own on/off state.
  let joinOpenByGrade = {};

  async function loadSkillsToggle(){
    const s = await api('/api/admin/settings');
    const toggle = document.getElementById('skillsOpenToggle');
    const label = document.getElementById('skillsOpenLabel');
    toggle.checked = !!s.skillsTrainingOpen;
    label.textContent = s.skillsTrainingOpen ? 'Registration open' : 'Registration closed';

    joinOpenByGrade = s.joinRegistrationOpenByGrade || {};
    applyJoinToggleForSelectedGrade();
  }

  function applyJoinToggleForSelectedGrade(){
    const grade = document.getElementById('ageGroupFilter').value;
    const joinToggle = document.getElementById('joinOpenToggle');
    const joinLabel = document.getElementById('joinOpenLabel');
    const joinGradeLabel = document.getElementById('joinOpenGradeLabel');
    if (!grade) {
      // "All grades" selected — toggling doesn't map to one grade, so disable
      // it and prompt picking a specific grade instead.
      joinToggle.checked = false;
      joinToggle.disabled = true;
      joinLabel.textContent = 'Select a grade to toggle';
      if (joinGradeLabel) joinGradeLabel.textContent = '';
      return;
    }
    joinToggle.disabled = false;
    const isOpen = joinOpenByGrade[grade] !== false;
    joinToggle.checked = isOpen;
    joinLabel.textContent = isOpen ? 'Registration open' : 'Registration closed';
    if (joinGradeLabel) joinGradeLabel.textContent = '(' + (GRADE_LABELS[grade] || grade) + ')';
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

  document.getElementById('joinOpenToggle').addEventListener('change', async (e) => {
    const toggle = e.target;
    const label = document.getElementById('joinOpenLabel');
    const grade = document.getElementById('ageGroupFilter').value;
    if (!grade) return; // toggle is disabled in this state, but guard anyway
    const desiredState = toggle.checked;
    toggle.disabled = true;
    try {
      const result = await api('/api/admin/settings/join-registration', {
        method: 'POST',
        body: JSON.stringify({ open: desiredState, ageGroup: grade }),
      });
      joinOpenByGrade[grade] = !!result.open;
      toggle.checked = !!result.open;
      label.textContent = result.open ? 'Registration open' : 'Registration closed';
    } catch (err) {
      toggle.checked = !desiredState;
      alert('Could not update the Join Sultans FC toggle for this grade. Please try again.');
    } finally {
      toggle.disabled = false;
    }
  });

  document.getElementById('ageGroupFilter').addEventListener('change', applyJoinToggleForSelectedGrade);

  async function loadAll(){
    await Promise.all([loadSummary(), loadSkills(), loadJoin(), loadSkillsToggle(), loadRoster()]);
    await loadPricing();
    await loadPaymentPricing();
    await loadProrationMode();
    await loadOneTimePayments();
    await loadOverviewAndRevenue();
  }

  wireExportLinks();
  if (getToken()) showApp(); else showLogin();
</script>
</body>
</html>
`;
