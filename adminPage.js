module.exports = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>RCH Elite Training — Admin</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root{ --pitch-deep:#0c2a1c; --pitch:#164a30; --turf:#3f8f5b; --gold:#d9a441; --gold-bright:#f0c674; --chalk:#f6f2e7; --chalk-dim:#e9e2d0; --ink:#0b1710; --acc:#3fcf7a; --away:#b5482f; --line:#e4dcc6; --shadow:0 10px 30px rgba(11,23,16,0.10); }
  *{ box-sizing:border-box; }
  body{ margin:0; font-family:'Work Sans',-apple-system,Segoe UI,Roboto,sans-serif; background:var(--chalk); color:var(--ink); -webkit-font-smoothing:antialiased; }
  h1,h2,h3{ font-family:'Anton',sans-serif; font-weight:400; letter-spacing:0.02em; }
  header{ background:var(--pitch-deep); border-bottom:3px solid var(--acc); color:var(--chalk); padding:10px 28px; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:16px; position:sticky; top:0; z-index:40; }
  header .header-brand{ display:flex; align-items:center; justify-content:center; }
  header .header-brand a{ display:block; line-height:0; border-radius:4px; }
  header .header-brand a:focus-visible{ outline:2px solid var(--gold); outline-offset:4px; }
  header .header-brand img{ height:56px; width:auto; display:block; transition:transform .2s ease; }
  header .header-brand a:hover img{ transform:scale(1.04); }
  .header-right{ display:flex; align-items:center; justify-content:flex-end; gap:12px; }
  #sectionNav{ background:transparent; border:1px solid rgba(246,242,231,0.3); border-radius:3px; padding:9px 12px; font-family:'Space Mono',monospace; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--chalk); cursor:pointer; }
  #sectionNav option{ color:var(--ink); text-transform:none; letter-spacing:0; }
  /* search */
  .search-wrap{ position:relative; max-width:380px; width:100%; }
  .search-wrap input{ width:100%; padding:10px 14px 10px 36px; border:1px solid rgba(246,242,231,0.3); background:rgba(246,242,231,0.08); color:var(--chalk); border-radius:3px; font-family:inherit; font-size:0.9rem; }
  .search-wrap input::-webkit-search-cancel-button, .search-wrap input::-webkit-search-decoration{ -webkit-appearance:none; appearance:none; }
  .search-wrap input:focus ~ kbd, .search-wrap input:not(:placeholder-shown) ~ kbd{ display:none; }
  .search-wrap input::placeholder{ color:rgba(246,242,231,0.55); }
  .search-wrap input:focus{ outline:none; border-color:var(--acc); background:rgba(246,242,231,0.14); }
  .search-wrap .search-icon{ position:absolute; left:11px; top:50%; transform:translateY(-50%); width:15px; height:15px; opacity:0.7; pointer-events:none; }
  .search-wrap kbd{ position:absolute; right:10px; top:50%; transform:translateY(-50%); font-family:'Space Mono',monospace; font-size:0.65rem; color:rgba(246,242,231,0.55); border:1px solid rgba(246,242,231,0.3); border-radius:3px; padding:1px 6px; pointer-events:none; }
  .search-results{ position:absolute; top:calc(100% + 6px); left:0; width:min(560px,92vw); background:#fff; color:var(--ink); border-radius:6px; box-shadow:0 20px 50px rgba(11,23,16,0.35); max-height:70vh; overflow-y:auto; z-index:60; }
  .search-results.hidden{ display:none; }
  .sr-item{ display:grid; grid-template-columns:auto 1fr auto; gap:4px 12px; align-items:center; padding:10px 14px; border-bottom:1px solid #eee; cursor:pointer; }
  .sr-item:last-child{ border-bottom:none; }
  .sr-item:hover, .sr-item.active{ background:#f3f7f1; }
  .sr-item.sr-dim{ opacity:0.55; cursor:default; }
  .sr-type{ font-family:'Space Mono',monospace; font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; padding:3px 8px; border-radius:3px; background:var(--pitch); color:var(--chalk); white-space:nowrap; }
  .sr-type.t-skills{ background:var(--gold); color:var(--ink); }
  .sr-type.t-join{ background:var(--turf); }
  .sr-name{ font-weight:700; }
  .sr-meta{ grid-column:2 / 4; font-size:0.78rem; color:#666; }
  .sr-tag{ font-size:0.72rem; color:#777; text-align:right; }
  .sr-empty{ padding:16px; color:#888; font-size:0.9rem; }
  tr.row-flash td{ animation:rowflash 2.2s ease; }
  @keyframes rowflash{ 0%,60%{ background:#fff3c4; } 100%{ background:transparent; } }
  #login-view .login-logo{ display:block; max-width:200px; width:100%; height:auto; margin:0 auto 20px; }
  header button{ background:transparent; border:1px solid rgba(246,242,231,0.3); color:var(--chalk); padding:9px 14px; border-radius:3px; cursor:pointer; font-family:'Space Mono',monospace; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; transition:background .2s ease,border-color .2s ease; }
  header button:hover{ background:rgba(246,242,231,0.1); border-color:var(--acc); }
  main{ max-width:1500px; margin:0 auto; padding:28px; }
  @media (max-width:820px){ header{ grid-template-columns:1fr auto; padding:10px 14px; } header .search-slot{ grid-column:1 / -1; order:3; } .header-right{ gap:8px; } main{ padding:16px; } }
  #login-view{ max-width:360px; margin:80px auto; background:#fff; padding:30px; border-radius:6px; border-top:4px solid var(--acc); box-shadow:var(--shadow); }
  #login-view h2{ margin-top:0; font-size:1.5rem; }
  #login-view input{ width:100%; padding:11px 12px; border:1px solid #d9d2bd; border-radius:3px; margin:10px 0; font-size:1rem; font-family:inherit; }
  #login-view input:focus{ outline:2px solid var(--acc); outline-offset:0; border-color:transparent; }
  #login-view button{ width:100%; padding:12px; background:var(--gold); border:none; border-radius:3px; font-weight:700; cursor:pointer; font-family:inherit; font-size:0.95rem; transition:background .2s ease; }
  #login-view button:hover{ background:var(--gold-bright); }
  #login-error{ color:#b5482f; font-size:0.9rem; min-height:1.2em; }
  .summary{ display:flex; flex-wrap:wrap; align-items:flex-start; gap:18px 34px; margin-bottom:30px; }
  .sum-group{ min-width:0; }
  .sum-title{ margin:0 0 10px; font-family:'Anton',sans-serif; font-weight:400; font-size:1.25rem; letter-spacing:0.03em; padding-bottom:6px; border-bottom:3px solid var(--gc); display:flex; align-items:baseline; gap:10px; }
  .sum-title small{ font-family:'Space Mono',monospace; font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; color:#6b7568; }
  .sum-cards{ display:grid; gap:12px; }
  .sum-reg{ --gc:#9aa39b; } .sum-reg .sum-cards{ grid-template-columns:repeat(2,minmax(130px,1fr)); }
  .sum-rch{ --gc:#3fcf7a; } .sum-rch .sum-cards{ grid-template-columns:minmax(150px,1fr); }
  .sum-sul{ --gc:#d98a76; flex:1 1 520px; } .sum-sul .sum-cards{ grid-template-columns:repeat(4,minmax(110px,1fr)); }
  .sum-reg .card{ background:#fff; }
  .sum-rch .card{ background:#dff3e4; border-top-color:#3fcf7a; }
  .sum-sul .card{ background:#f9dfd9; border-top-color:#d98a76; }
  .sum-sul .card .n{ color:#8a3b27; }
  .sum-rch .card .n{ color:#164a30; }
  @media (max-width:820px){ .sum-sul .sum-cards{ grid-template-columns:repeat(2,minmax(110px,1fr)); } .sum-reg, .sum-rch, .sum-sul{ flex:1 1 100%; } }
  @media (max-width:820px){ .btn-export, .btn-add{ white-space:normal; } #exportJoin{ margin-left:0 !important; } main div:has(> #exportJoin){ flex-wrap:wrap; } }
  .card{ background:#fff; border-radius:6px; border-top:3px solid var(--acc); padding:16px 22px; box-shadow:var(--shadow); min-width:150px; }
  .card .n{ font-family:'Anton',sans-serif; font-size:2rem; font-weight:400; color:var(--pitch); line-height:1.1; }
  .card .l{ font-family:'Space Mono',monospace; font-size:0.65rem; color:#6b7568; text-transform:uppercase; letter-spacing:0.14em; margin-top:4px; }
  table{ width:100%; border-collapse:collapse; background:#fff; border-radius:6px; box-shadow:var(--shadow); margin-bottom:34px; font-size:0.88rem; }
  tbody tr{ transition:background .15s ease; }
  tbody tr:hover{ background:#faf7ee; }
  th, td{ text-align:left; padding:11px 8px; border-bottom:1px solid #eee8d8; white-space:nowrap; }
  td.cell-wrap{ white-space:normal; max-width:240px; word-wrap:break-word; }
  td details{ white-space:normal; }
  td details summary{ cursor:pointer; color:var(--pitch); font-size:0.8rem; list-style:none; }
  td details summary::-webkit-details-marker{ display:none; }
  td details summary:before{ content:"▸ "; }
  td details[open] summary:before{ content:"▾ "; }
  th{ background:var(--pitch-deep); font-family:'Space Mono',monospace; font-size:0.62rem; font-weight:400; text-transform:uppercase; letter-spacing:0.09em; color:var(--chalk-dim); white-space:normal; line-height:1.35; vertical-align:bottom; }
  thead th:first-child{ border-top-left-radius:6px; } thead th:last-child{ border-top-right-radius:6px; }
  .section-head{ display:flex; align-items:center; justify-content:space-between; margin:0 0 14px; gap:12px; flex-wrap:wrap; }
  .section-head h2{ margin:0; font-size:1.5rem; padding-left:12px; border-left:4px solid var(--gold); line-height:1.15; }
  .section-head select, .section-head a{ font-size:0.85rem; }
  .section-head select{ padding:8px 10px; border:1px solid #d9d2bd; border-radius:3px; background:#fff; font-family:inherit; color:var(--ink); cursor:pointer; }
  a.btn-export{ background:var(--pitch); color:#fff; padding:8px 14px; border-radius:3px; text-decoration:none; font-weight:600; transition:background .2s ease; }
  a.btn-export:hover{ background:var(--turf); }
  .date-bad{ border-color:#b5482f !important; background:#fdf1ee; }
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
  .btn-paid-other{ background:#fff; border:1px solid #1f7a44; color:#1f7a44; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; white-space:nowrap; }
  .btn-paid-other:hover{ background:#1f7a44; color:#fff; }
  .btn-send-agreement{ background:#fff; border:1px solid #164a30; color:#164a30; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; white-space:nowrap; }
  .btn-send-agreement:hover{ background:#164a30; color:#fff; }
  .btn-dl-agreement{ background:#fff; border:1px solid #164a30; color:#164a30; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; }
  .btn-send-agreement:disabled{ opacity:0.6; cursor:default; }
  .btn-reset-payments{ background:#fff; border:2px solid #b5482f; color:#b5482f; padding:10px 18px; border-radius:8px; cursor:pointer; font-weight:700; }
  .btn-reset-payments:hover{ background:#b5482f; color:#fff; }
  .btn-cancel-billing{ background:#fff; border:1px solid #b5482f; color:#b5482f; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; white-space:nowrap; }
  .btn-cancel-billing:hover{ background:#b5482f; color:#fff; }
  .btn-cancel-billing:disabled{ opacity:0.6; cursor:default; }
  .btn-start-billing{ background:#fff; border:1px solid var(--pitch); color:var(--pitch); padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; white-space:nowrap; }
  .btn-start-billing:hover{ background:var(--pitch); color:#fff; }
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
  .btn-add{ background:var(--gold); color:var(--ink); border:none; padding:8px 15px; border-radius:3px; font-weight:700; cursor:pointer; font-size:0.85rem; font-family:inherit; transition:background .2s ease, transform .2s ease; }
  .btn-add:hover{ background:var(--gold-bright); transform:translateY(-1px); }
  .modal-overlay{ position:fixed; inset:0; background:rgba(12,42,28,0.55); display:flex; align-items:center; justify-content:center; z-index:50; padding:16px; }
  .modal-overlay.hidden{ display:none; }
  .modal{ background:#fff; border-radius:6px; border-top:4px solid var(--acc); padding:26px 28px; width:100%; max-width:440px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.3); }
  .modal h3{ margin:0 0 4px; font-size:1.4rem; }
  .modal .modal-sub{ color:#666; font-size:0.85rem; margin-bottom:6px; }
  .modal label{ display:block; font-size:0.8rem; font-weight:600; color:#444; margin:14px 0 5px; }
  .modal select, .modal input, .modal textarea{ width:100%; padding:9px 10px; border:1px solid #ddd; border-radius:6px; font-size:0.92rem; font-family:inherit; }
  .modal textarea{ resize:vertical; min-height:56px; }
  .modal .modal-amounts{ background:var(--chalk); border-left:3px solid var(--gold); border-radius:3px; padding:10px 12px; margin-top:16px; font-size:0.85rem; color:#333; line-height:1.5; }
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
  .pricing-box{ background:#fff; border-radius:6px; padding:18px 22px; box-shadow:var(--shadow); margin-bottom:20px; display:flex; align-items:flex-end; gap:20px; flex-wrap:wrap; }
  .pricing-box label{ display:block; font-size:0.8rem; font-weight:600; color:#444; }
  .pricing-box input{ margin-top:5px; padding:8px 10px; border:1px solid #ddd; border-radius:6px; font-size:0.92rem; width:140px; }
  .pricing-saved{ color:#2f8f57; font-size:0.85rem; font-weight:600; }

  /* collapsible panels (Finances + Data) */
  .panel-tools{ display:flex; justify-content:flex-end; gap:8px; margin:0 0 12px; }
  .panel-tool{ background:transparent; border:1px solid #d9d2bd; color:#555; font-family:'Space Mono',monospace; font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; padding:6px 10px; border-radius:3px; cursor:pointer; }
  .panel-tool:hover{ border-color:var(--pitch); color:var(--pitch); }
  details.panel{ background:#fff; border-radius:6px; box-shadow:var(--shadow); margin-bottom:14px; border-left:4px solid var(--gold); }
  details.panel[open]{ border-left-color:var(--acc); }
  details.panel > summary{ list-style:none; cursor:pointer; display:flex; align-items:center; gap:14px; padding:16px 20px; user-select:none; }
  details.panel > summary::-webkit-details-marker{ display:none; }
  details.panel > summary:hover{ background:#faf7ee; border-radius:6px; }
  .panel-title{ font-family:'Anton',sans-serif; font-size:1.3rem; letter-spacing:0.02em; }
  .panel-hint{ color:#7a8277; font-size:0.85rem; flex:1; }
  .panel-chev{ width:10px; height:10px; border-right:2px solid var(--pitch); border-bottom:2px solid var(--pitch); transform:rotate(45deg); transition:transform .2s ease; margin-right:4px; }
  details.panel[open] .panel-chev{ transform:rotate(-135deg); }
  .panel-body{ padding:4px 20px 22px; }
  .panel-body p{ margin:8px 0 14px !important; }
  .panel-body .pricing-box, .panel-body .modal-amounts{ box-shadow:none; border:1px solid #eee8d8; padding:16px 18px; }
  .panel-body table{ box-shadow:none; border:1px solid #eee8d8; margin-bottom:6px; }
  .panel-actions{ display:flex; justify-content:flex-end; margin-bottom:10px; }

  /* tables scroll inside their own box so the page never slides sideways */
  body{ overflow-x:clip; }
  main{ min-width:0; }
  [id$="TableWrap"]{ overflow-x:auto; max-width:100%; padding:2px 8px 30px; margin:-2px -8px 0; }
  [id$="TableWrap"] table{ margin-bottom:0; }
  .panel-body [id$="TableWrap"]{ padding-bottom:6px; }
  .row-menu{ position:fixed; }

  /* email dropdown */
  details.email-dd summary{ cursor:pointer; color:var(--pitch); font-weight:600; font-size:0.8rem; list-style:none; display:inline-block; border:1px solid #d9d2bd; border-radius:3px; padding:3px 9px; background:#fff; }
  td details.email-dd summary:before, td details.email-dd[open] summary:before{ content:none; }
  details.email-dd summary::-webkit-details-marker{ display:none; }
  details.email-dd summary::after{ content:" ▾"; }
  details.email-dd[open] summary::after{ content:" ▴"; }
  details.email-dd summary:hover{ border-color:var(--pitch); }
  .email-dd-body{ display:flex; flex-direction:column; align-items:flex-start; gap:6px; margin-top:6px; max-width:210px; }
  .email-dd-text{ user-select:all; -webkit-user-select:all; cursor:text; font-size:0.85rem; padding:3px 6px; background:#f3f7f1; border-radius:3px; word-break:break-all; white-space:normal; }
  .btn-copy-email{ background:var(--pitch); color:#fff; border:none; border-radius:3px; padding:4px 10px; font-size:0.72rem; cursor:pointer; white-space:nowrap; }
  .btn-copy-email:hover{ background:var(--turf); }

  /* coach cards */
  .coach-role-head{ display:flex; align-items:center; gap:10px; margin:30px 0 14px; }
  .coach-role-head h3{ margin:0; font-size:1.35rem; }
  .coach-role-head .dot{ width:12px; height:12px; border-radius:50%; background:var(--rc); box-shadow:0 0 0 3px rgba(0,0,0,0.06); }
  .coach-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:22px; }
  .coach-card{ --rc:#3f8f5b; --rc2:#8fd9a8; position:relative; padding:9px; border-radius:16px; background:linear-gradient(145deg,var(--rc),var(--rc2) 45%,var(--rc) 100%); box-shadow:0 8px 22px rgba(11,23,16,0.22); transition:transform .25s ease, box-shadow .25s ease; display:flex; }
  .coach-card:hover{ transform:translateY(-6px) rotate(-0.4deg); box-shadow:0 18px 34px rgba(11,23,16,0.3); }
  .coach-card.role-general_manager{ --rc:#c98f1c; --rc2:#f6d98a; }
  .coach-card.role-head_coach{ --rc:#b5482f; --rc2:#f0a58f; }
  .coach-card.role-coach{ --rc:#2f8f57; --rc2:#9be3b5; }
  .coach-card.role-volunteer{ --rc:#2f78a8; --rc2:#a6d6f0; }
  .coach-role-head.role-general_manager{ --rc:#c98f1c; } .coach-role-head.role-head_coach{ --rc:#b5482f; } .coach-role-head.role-coach{ --rc:#2f8f57; } .coach-role-head.role-volunteer{ --rc:#2f78a8; }
  .cc-inner{ background:linear-gradient(180deg,#fffdf6,#f6f0dc); border-radius:10px; padding:12px 14px 14px; width:100%; display:flex; flex-direction:column; gap:10px; }
  .cc-top{ display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
  .cc-stage{ font-family:'Space Mono',monospace; font-size:0.58rem; letter-spacing:0.12em; text-transform:uppercase; background:var(--rc); color:#fff; padding:2px 7px; border-radius:3px; white-space:nowrap; }
  .cc-name{ font-family:'Anton',sans-serif; font-size:1.35rem; letter-spacing:0.02em; line-height:1.1; flex:1; margin-left:8px; }
  .cc-hp{ font-family:'Space Mono',monospace; font-size:0.6rem; text-transform:uppercase; color:#b5482f; text-align:right; line-height:1.1; }
  .cc-hp b{ font-family:'Anton',sans-serif; font-size:1.05rem; font-weight:400; letter-spacing:0.02em; }
  .cc-art{ position:relative; height:118px; border-radius:6px; border:3px solid #d8c88f; background:radial-gradient(circle at 30% 25%,rgba(255,255,255,0.65),transparent 45%),linear-gradient(135deg,var(--rc),var(--rc2)); display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .cc-art::before{ content:""; position:absolute; inset:0; background:repeating-linear-gradient(115deg,rgba(255,255,255,0.14) 0 8px,transparent 8px 18px); }
  .cc-art::after{ content:""; position:absolute; width:150px; height:150px; right:-40px; bottom:-60px; border-radius:50%; border:10px solid rgba(255,255,255,0.22); }
  .cc-initials{ position:relative; font-family:'Anton',sans-serif; font-size:3.2rem; color:#fff; letter-spacing:0.05em; text-shadow:0 3px 0 rgba(0,0,0,0.25); }
  .cc-role{ position:absolute; left:8px; bottom:6px; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.1em; text-transform:uppercase; background:rgba(11,23,16,0.7); color:#fff; padding:2px 7px; border-radius:3px; z-index:1; }
  .cc-star{ position:absolute; right:8px; top:6px; font-size:0.65rem; font-family:'Space Mono',monospace; letter-spacing:0.08em; background:var(--gold); color:var(--ink); padding:2px 7px; border-radius:3px; z-index:1; font-weight:700; }
  .cc-info{ font-style:italic; font-size:0.72rem; color:#6b7568; text-align:center; border-top:1px solid #e6dcb8; border-bottom:1px solid #e6dcb8; padding:4px 0; }
  .cc-move{ display:flex; align-items:flex-start; gap:9px; font-size:0.82rem; }
  .cc-cost{ min-width:28px; height:22px; border-radius:11px; background:var(--rc); color:#fff; font-family:'Space Mono',monospace; font-size:0.62rem; display:flex; align-items:center; justify-content:center; padding:0 6px; white-space:nowrap; margin-top:1px; }
  .cc-move b{ display:block; font-size:0.84rem; }
  .cc-move span.txt{ color:#555; }
  .cc-chips{ display:flex; flex-wrap:wrap; gap:4px; margin-top:3px; }
  .cc-chip{ background:#fff; border:1px solid var(--rc); color:var(--ink); font-size:0.68rem; padding:1px 7px; border-radius:10px; }
  .cc-card-details{ font-size:0.78rem; } .cc-card-details summary{ cursor:pointer; color:var(--pitch); font-weight:600; } .cc-card-details div{ margin-top:4px; color:#444; white-space:pre-wrap; }
  .cc-foot{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:auto; padding-top:8px; border-top:1px solid #e6dcb8; }
  .cc-contact{ font-size:0.7rem; color:#555; line-height:1.35; word-break:break-all; }
  .cc-actions{ display:flex; gap:6px; }
  table tfoot td, table tr.grand-total td{ font-weight:700; background:#f3e6c4; }
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
    <div class="search-slot">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="#f6f2e7" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input type="search" id="globalSearch" placeholder="Search players, parents, emails…" autocomplete="off" spellcheck="false" aria-label="Search">
        <kbd>/</kbd>
        <div class="search-results hidden" id="searchResults" role="listbox"></div>
      </div>
    </div>
    <div class="header-brand">
      <a href="#dashboard" id="logoHome" title="Back to the dashboard" aria-label="RCH Elite Training — back to the dashboard">
        <img src="/assets/logo.png" alt="RCH Elite Training">
      </a>
    </div>
    <div class="header-right">
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
      <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
        <label class="switch-row">
          <input type="checkbox" id="skillsOpenToggle">
          <span class="switch-track"><span class="switch-thumb"></span></span>
          <span id="skillsOpenLabel">Registration open</span>
          <span id="skillsOpenGradeLabel" style="color:#888; font-weight:normal;"></span>
        </label>
        <select id="skillsGradeFilter" title="Pick a grade to open/close just that grade; All grades = the whole Skills Training page">
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
    <div class="panel-tools"><button type="button" class="panel-tool" data-panels="expand">Expand all</button><button type="button" class="panel-tool" data-panels="collapse">Collapse all</button></div>


    <details class="panel" open>
      <summary><span class="panel-title">Pricing &amp; Revenue</span><span class="panel-hint">Estimated monthly revenue by grade</span><span class="panel-chev" aria-hidden="true"></span></summary>
      <div class="panel-body">
    <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">Revenue below is calculated from the <strong>Payment Link Amounts</strong> further down this page (the prices families actually pay), minus each player's discount. Change prices there only.</p>
    <div id="revenueTableWrap"></div>

      </div>
    </details>

    <details class="panel">
      <summary><span class="panel-title">Payment Link Amounts</span><span class="panel-hint">What families are charged</span><span class="panel-chev" aria-hidden="true"></span></summary>
      <div class="panel-body">
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

      </div>
    </details>

    <details class="panel">
      <summary><span class="panel-title">Proration Mode</span><span class="panel-hint">How the first month is calculated</span><span class="panel-chev" aria-hidden="true"></span></summary>
      <div class="panel-body">
    <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">While locked, the "this month" amount is fixed the moment you click Send Link — so a family that pays a few days late still owes what was shown to them, instead of a smaller amount recalculated at payment time. Turn this off once initial enrollment settles, so new signups pay live based on practices left as of the moment they actually pay.</p>
    <div class="pricing-box">
      <div class="checkbox-row">
        <input type="checkbox" id="lockProrationCheckbox">
        <label for="lockProrationCheckbox">Lock amount at link creation</label>
      </div>
      <button type="button" class="btn-add" id="saveProrationModeBtn">Save</button>
      <span class="pricing-saved" id="prorationModeSaved"></span>
    </div>

      </div>
    </details>

    <details class="panel">
      <summary><span class="panel-title">One-Time Payments</span><span class="panel-hint">Tournament fees, extra kits, one-off charges</span><span class="panel-chev" aria-hidden="true"></span></summary>
      <div class="panel-body">
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
      <button type="button" class="btn-add" id="openSendLinkBtn" style="background:#fff; border:1px solid var(--pitch); color:var(--pitch);">Send Link to Roster…</button>
    </div>
    <div id="oneTimePaymentsTableWrap"></div>

      </div>
    </details>

    <details class="panel">
      <summary><span class="panel-title">Reset Payment Status</span><span class="panel-hint">Start a fresh billing month</span><span class="panel-chev" aria-hidden="true"></span></summary>
      <div class="panel-body">
    <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">For the start of a new billing month (e.g. November 1st, after last month's links have expired). Sets everyone's Payment Status back to "Not sent", cancels any unpaid links that are still open, and clears every "Paid otherwise" mark so you can send fresh links at the new price. Active Stripe subscriptions are not touched. Can only be used once per calendar month.</p>
    <div class="pricing-box">
      <button type="button" class="btn-reset-payments" id="resetPaymentStatusBtn">Reset Payment Status…</button>
      <span class="pricing-saved" id="resetPaymentInfo" style="color:#666;"></span>
    </div>


      </div>
    </details>
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
          <input type="text" data-datemask id="chargeMonthInput">
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

      <div class="coach-role-head role-general_manager"><span class="dot"></span><h3>General Manager</h3></div>
      <div id="coachesTableWrap_general_manager"></div>

      <div class="coach-role-head role-head_coach"><span class="dot"></span><h3>Head Coaches</h3></div>
      <div id="coachesTableWrap_head_coach"></div>

      <div class="coach-role-head role-coach"><span class="dot"></span><h3>Coaches</h3></div>
      <div id="coachesTableWrap_coach"></div>

      <div class="coach-role-head role-volunteer"><span class="dot"></span><h3>Volunteers</h3></div>
      <div id="coachesTableWrap_volunteer"></div>
    </div><!-- /section-coaches -->

    <div id="section-data" class="hidden">
    <div class="panel-tools"><button type="button" class="panel-tool" data-panels="expand">Expand all</button><button type="button" class="panel-tool" data-panels="collapse">Collapse all</button></div>

    <details class="panel" open>
      <summary><span class="panel-title">Monthly Report</span><span class="panel-hint">PDF report, emailed on the 1st</span><span class="panel-chev" aria-hidden="true"></span></summary>
      <div class="panel-body">
      <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">A full PDF dashboard report — roster counts, Season Overview, Final Net Revenue, one-time payments, business charges, and current coaches — is emailed automatically on the 1st of each month for the month that just ended. Use the buttons below to preview the current month any time, or to resend/send early.</p>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
        <a class="btn-export" href="#" id="downloadMonthlyReportLink">Download This Month's PDF</a>
        <button type="button" class="btn-add" id="sendMonthlyReportBtn">Email Me This Month's Report Now</button>
      </div>
      <span class="pricing-saved" id="monthlyReportStatus"></span>

      </div>
    </details>

    <details class="panel">
      <summary><span class="panel-title">Monthly Snapshots</span><span class="panel-hint">Saved roster and revenue, month by month</span><span class="panel-chev" aria-hidden="true"></span></summary>
      <div class="panel-body">
        <div class="panel-actions"><button type="button" class="btn-add" id="generateSnapshotBtn">Generate This Month's Snapshot</button></div>      <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">A snapshot of the roster + estimated revenue, charges, and net income is saved automatically on the 1st of each month for the month that just ended. Revenue is estimated from each active player's current monthly rate minus their discount — it's a projection from the roster, not a reconciliation against actual settled Stripe payments, which Stripe's own dashboard remains the source of truth for.</p>
      <div id="snapshotsTableWrap"></div>

      </div>
    </details>

    <details class="panel">
      <summary><span class="panel-title">Signed Agreements</span><span class="panel-hint">E-signed PDFs on file</span><span class="panel-chev" aria-hidden="true"></span></summary>
      <div class="panel-body">
      <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">Use <b>Send Agreement</b> on a registration or roster row to email the family an e-sign link. Once they fill in the form and sign, the signed PDF is stored here and a copy is emailed to them and to you.</p>
      <div id="agreementsTableWrap"></div>

      </div>
    </details>

    <details class="panel">
      <summary><span class="panel-title">Unsubscribed Players</span><span class="panel-hint">Archived players who quit</span><span class="panel-chev" aria-hidden="true"></span></summary>
      <div class="panel-body">
      <p style="color:#666; font-size:0.85rem; margin:-6px 0 14px;">Players who quit. Cancel their billing first (from the Players Roster), then Unsubscribe them here to archive them off the active roster.</p>
      <div id="archivedTableWrap"></div>

      </div>
    </details>

    <details class="panel">
      <summary><span class="panel-title">Exports</span><span class="panel-hint">CSV downloads</span><span class="panel-chev" aria-hidden="true"></span></summary>
      <div class="panel-body">
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <a class="btn-export" href="#" id="exportRosterLink">Download Roster CSV</a>
      </div>

      </div>
    </details>
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
    <input type="text" data-datemask id="apDob">
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
    <label for="apSibling">Sibling discount</label>
    <select id="apSibling">
      <option value="0">None</option>
      <option value="15">15% (3 siblings)</option>
      <option value="20">20% (4 siblings)</option>
    </select>
    <label for="apDiscount">Manual discount ($) — leave at 0 to use the sibling % automatically</label>
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
    <input type="text" data-datemask id="epDob">
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
    <label for="epSibling">Sibling discount</label>
    <select id="epSibling">
      <option value="0">None</option>
      <option value="15">15% (3 siblings)</option>
      <option value="20">20% (4 siblings)</option>
    </select>
    <label for="epDiscount">Manual discount ($) — leave at 0 to use the sibling % automatically</label>
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
    <label for="coachCategory">Category</label>
    <select id="coachCategory">
      <option value="general_manager">General Manager</option>
      <option value="head_coach">Head Coach</option>
      <option value="coach">Coach</option>
      <option value="volunteer">Volunteer</option>
    </select>
    <div class="two-col">
      <div><label for="coachFirstName">First Name</label><input type="text" id="coachFirstName"></div>
      <div><label for="coachLastName">Last Name</label><input type="text" id="coachLastName"></div>
    </div>
    <div class="two-col">
      <div><label for="coachEmail">Email</label><input type="email" id="coachEmail"></div>
      <div><label for="coachPhone">Phone</label><input type="text" id="coachPhone"></div>
    </div>
    <div class="two-col">
      <div><label for="coachDegree">Degree</label><input type="text" id="coachDegree" placeholder="e.g. B.S. Kinesiology"></div>
      <div>
        <label for="coachEmploymentType">Full-Time / Part-Time</label>
        <select id="coachEmploymentType">
          <option value="full_time">Full-Time</option>
          <option value="part_time">Part-Time</option>
        </select>
      </div>
    </div>
    <label for="coachQualifications">Qualifications</label>
    <input type="text" id="coachQualifications" placeholder="e.g. 5 years youth coaching, former college player">
    <label for="coachCertificates">Certificates</label>
    <input type="text" id="coachCertificates" placeholder="e.g. USSF D License, CPR/First Aid">
    <div class="two-col">
      <div><label for="coachFixedSalary">Fixed Salary ($)</label><input type="number" id="coachFixedSalary" min="0" step="0.01" value="0"></div>
      <div><label for="coachReferralRate">Referral Salary — $ per player brought</label><input type="number" id="coachReferralRate" min="0" step="0.01" value="0"></div>
    </div>
    <label for="coachPlayersReferred">Players Referred</label>
    <input type="number" id="coachPlayersReferred" min="0" step="1" value="0">
    <p style="color:#666; font-size:0.8rem; margin:-6px 0 14px;">Fixed Salary and Referral Salary (rate x players referred) are automatically added to the Charges list as recurring charges — no need to enter them there separately.</p>
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
    <label for="moveSibling">Sibling discount</label>
    <select id="moveSibling">
      <option value="0">None</option>
      <option value="15">15% (3 siblings)</option>
      <option value="20">20% (4 siblings)</option>
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
    <input type="text" data-datemask id="seasonEndInput">
    <label for="siblingDiscountSelect">Sibling discount (monthly fee only)</label>
    <select id="siblingDiscountSelect">
      <option value="0">None</option>
      <option value="15">15% off — 3 siblings</option>
      <option value="20">20% off — 4 siblings</option>
    </select>
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
    <input type="text" data-datemask id="resumeDateInput">
    <p class="modal-error" id="pauseModalError"></p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" id="pauseModalCancel">Cancel</button>
      <button type="button" class="btn-send" id="pauseModalSend">Pause</button>
    </div>
  </div>
</div>

<div class="modal-overlay hidden" id="sendLinkModal">
  <div class="modal" style="max-width:520px;">
    <h3>Send Payment Link</h3>

    <div id="sendLinkStep1">
      <label for="slTitleInput">Title</label>
      <input type="text" id="slTitleInput" placeholder="e.g. Tournament fee">
      <label for="slDescInput">Description (optional)</label>
      <input type="text" id="slDescInput" placeholder="Shown to the family on the payment page">
      <label for="slAmountInput">Amount ($)</label>
      <input type="number" id="slAmountInput" min="0.01" step="0.01">

      <label for="slScopeSelect">Send to</label>
      <select id="slScopeSelect"></select>

      <div id="slIndividualWrap" class="hidden">
        <label for="slIndividualSearch">Search player</label>
        <input type="text" id="slIndividualSearch" placeholder="Type a player or parent name…">
        <label for="slIndividualSelect">Player</label>
        <select id="slIndividualSelect"></select>
      </div>

      <p class="modal-error" id="sendLinkStep1Error"></p>
      <div class="modal-actions">
        <button type="button" class="btn-cancel" id="sendLinkCancel1">Cancel</button>
        <button type="button" class="btn-send" id="sendLinkPreviewBtn">Preview Recipients</button>
      </div>
    </div>

    <div id="sendLinkStep2" class="hidden">
      <p class="modal-sub" id="sendLinkSummary"></p>
      <div id="sendLinkRecipientsList" style="max-height:240px; overflow-y:auto; border:1px solid #eee; border-radius:6px; padding:10px 12px; margin-bottom:6px; font-size:0.85rem;"></div>
      <p class="modal-error" id="sendLinkStep2Error"></p>
      <div class="modal-actions">
        <button type="button" class="btn-cancel" id="sendLinkBackBtn">Back</button>
        <button type="button" class="btn-send" id="sendLinkConfirmBtn">Send</button>
      </div>
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
    <input type="text" data-datemask id="asDob">
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
      <div><label for="ajDob">DOB</label><input type="text" data-datemask id="ajDob"></div>
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

  // ---- Typed dates: MM/DD/YYYY (no pop-up calendar) ----
  // Any <input data-datemask> becomes a typed field that auto-inserts the
  // slashes. Its .value still reads and writes ISO (YYYY-MM-DD), so every
  // existing save/load path keeps working; an incomplete or impossible date
  // reads as '' so the usual "please enter a date" checks fire.
  (function(){
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    function pad(n){ return n < 10 ? '0' + n : String(n); }
    function toIso(txt){
      var d = String(txt || '').replace(/[^0-9]/g, '');
      if (d.length !== 8) return '';
      var m = +d.slice(0, 2), day = +d.slice(2, 4), y = +d.slice(4, 8);
      if (y < 1900 || y > 2100 || m < 1 || m > 12 || day < 1) return '';
      if (day > new Date(y, m, 0).getDate()) return '';
      return y + '-' + pad(m) + '-' + pad(day);
    }
    function fromIso(v){
      var p = String(v || '').slice(0, 10).split('-');
      return (p.length === 3 && p[0].length === 4) ? p[1] + '/' + p[2] + '/' + p[0] : '';
    }
    function mask(raw){
      if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(raw)) return fromIso(raw);
      var d = raw.replace(/[^0-9]/g, '').slice(0, 8);
      if (d.length > 4) return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
      if (d.length > 2) return d.slice(0, 2) + '/' + d.slice(2);
      return d;
    }
    function setup(el){
      if (el.__dateMask) return;
      el.__dateMask = true;
      el.type = 'text';
      el.setAttribute('inputmode', 'numeric');
      el.setAttribute('maxlength', '10');
      el.setAttribute('autocomplete', 'off');
      el.setAttribute('placeholder', 'MM/DD/YYYY');
      Object.defineProperty(el, 'value', {
        configurable: true,
        get: function(){ return toIso(proto.get.call(el)); },
        set: function(v){ proto.set.call(el, fromIso(v)); el.setCustomValidity(''); el.classList.remove('date-bad'); },
      });
      el.addEventListener('input', function(){
        var cur = proto.get.call(el), m = mask(cur);
        if (m !== cur) proto.set.call(el, m);
        el.setCustomValidity('');
        el.classList.remove('date-bad');
      });
      el.addEventListener('blur', function(){
        var raw = proto.get.call(el);
        if (raw && !toIso(raw)) {
          el.setCustomValidity('Enter a real date as MM/DD/YYYY');
          el.classList.add('date-bad');
        }
      });
    }
    document.querySelectorAll('input[data-datemask]').forEach(setup);
  })();


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
      html += '<tr' + (opts.ridPrefix ? ' data-rid="' + opts.ridPrefix + row[opts.idKey || 'id'] + '"' : '') + '>' + columns.map(c => \`<td>\${row[c.key] ?? ''}</td>\`).join('');
      if (hasActions) {
        html += '<td style="display:flex; gap:6px; flex-wrap:wrap;">';
        if (opts.onMoveToRoster) {
          const label = (row[opts.labelKey] ?? '').toString().replace(/"/g, '&quot;');
          html += \`<button type="button" class="btn-move-to-roster" data-id="\${row[opts.idKey || 'id']}" data-label="\${label}">Move to Roster</button>\`;
          html += \`<button type="button" class="btn-send-agreement" data-id="\${row[opts.idKey || 'id']}" data-label="\${label}">Send Agreement</button>\`;
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
    document.getElementById('moveSibling').value = String(row.sibling_discount || 0);
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
      siblingDiscount: Number(document.getElementById('moveSibling').value) || 0,
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

  function wireAgreementButtons(wrapId, registrationType, onSent){
    const wrap = document.getElementById(wrapId);
    wrap.querySelectorAll('.btn-send-agreement').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const label = btn.getAttribute('data-label') || 'this family';
        if (!confirm('Email the Training Agreement e-sign link for ' + label + ' to their parent now?')) return;
        const orig = btn.textContent;
        btn.disabled = true; btn.textContent = 'Sending…';
        try {
          const r = await api('/api/admin/agreements/send', { method: 'POST', body: JSON.stringify({ registrationType, registrationId: Number(btn.getAttribute('data-id')) }) });
          if (r.error) { alert(r.error); }
          else { alert('Agreement sent. Track it under Data → Signed Agreements.'); if (typeof loadAgreements === 'function') loadAgreements(); if (onSent) await onSent(); }
        } catch (e) {
          alert('Could not send the agreement. Please try again.');
        } finally {
          btn.disabled = false; btn.textContent = orig;
        }
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
        const sibling = btn.getAttribute('data-sibling') || '0';
        openPaymentModal(registrationType, id, label, onSent, sessionType, sibling);
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
    const sibPct = Number(document.getElementById('siblingDiscountSelect').value) || 0;
    const discounted = Math.round(tier.monthly * (100 - sibPct) / 100);
    const monthlyText = sibPct
      ? '<s>$' + (tier.monthly / 100).toFixed(2) + '</s> <b>$' + (discounted / 100).toFixed(2) + '/mo</b> (' + sibPct + '% sibling discount)'
      : '$' + (tier.monthly / 100).toFixed(2) + '/mo';
    const includeKit = document.getElementById('includeKitFee').checked;
    const kitText = includeKit ? 'Kit fee (one-time): $' + (PAYMENT_PRICING.kitFeeCents / 100).toFixed(2) + '<br>' : '';
    document.getElementById('modalAmounts').innerHTML =
      kitText + 'Full monthly rate: ' + monthlyText +
      '<br><span style="color:#888;">First charge is prorated automatically for the Tue/Thu practices left this month.</span>';
  }

  function openPaymentModal(registrationType, id, label, onSent, sessionType, sibling){
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
    document.getElementById('siblingDiscountSelect').value = (sibling === '15' || sibling === '20') ? sibling : '0';
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
  document.getElementById('siblingDiscountSelect').addEventListener('change', updateModalAmounts);
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
    const sibPct = Number(document.getElementById('siblingDiscountSelect').value) || 0;
    const monthlyAmount = Math.round(tier.monthly * (100 - sibPct) / 100);
    const tierLabel = tier.label + ' — ' + SEASON_LABELS[seasonKey] + (sibPct ? ' (' + sibPct + '% sibling discount)' : '');
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
          monthlyAmount,
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
      // Rows auto-generated from a coach's Fixed/Referral Salary fields
      // (coachCharges.js) are read-only here — deleting one would just be
      // recreated (or drift out of sync) the next time that coach is saved,
      // so they're edited from the Coaches tab instead.
      const isAuto = !!c.auto_tag;
      html += '<tr>' +
        '<td>' + escapeHtml(c.description) + (isAuto ? ' <span style="color:#999; font-size:0.8rem;">(auto — edit via Coaches tab)</span>' : '') + '</td>' +
        '<td>$' + (c.amount_cents / 100).toFixed(2) + '</td>' +
        '<td>' + (c.kind === 'recurring' ? 'Recurring' : 'One-time') + '</td>' +
        '<td>' + (c.charge_month ? String(c.charge_month).slice(0, 10) : '—') + '</td>' +
        '<td>' + (isAuto ? '' : '<button type="button" class="btn-delete-row" data-id="' + c.id + '">Delete</button>') + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  async function loadCharges(){
    const rows = await api('/api/admin/charges');
    const wrap = document.getElementById('chargesTableWrap');
    wrap.innerHTML = renderChargesTable(rows);
    // Keep the Finances tab's Pricing & Revenue "Final Net Revenue" figure in
    // sync whenever a charge is added/edited/deleted, even without a full
    // page reload.
    lastChargesCents = currentMonthChargesCents(rows);
    if (lastOverview) {
      document.getElementById('revenueTableWrap').innerHTML = renderRevenueTable(lastOverview, currentPricing, lastChargesCents);
    }
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

  const COACH_ROLE_LABELS = {
    general_manager: 'General Manager', head_coach: 'Head Coach', coach: 'Coach', volunteer: 'Volunteer',
  };
  const COACH_ROLES = ['general_manager', 'head_coach', 'coach', 'volunteer'];

  // Renders a long text field as a collapsed "Details ▾" dropdown instead of
  // inline text, so a long qualifications/certificates/notes entry doesn't
  // blow out the row height — the table stays compact until clicked open.
  function collapsibleCell(text){
    if (!text) return '—';
    return '<details><summary>Details</summary><div class="cell-wrap" style="margin-top:6px;">' + escapeHtml(text) + '</div></details>';
  }

  function renderCoachesTable(rows){
    if (!rows.length) return '<div class="empty">None yet.</div>';
    const money = (c) => '$' + ((c || 0) / 100).toFixed(2);
    let html = '<div class="coach-grid">';
    rows.forEach((c) => {
      const role = c.role || 'coach';
      const initials = String(c.name || '?').trim().split(/\\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
      const grades = (c.grades || []).map((g) => '<span class="cc-chip">' + escapeHtml(ALL_GRADE_LABELS[g] || g) + '</span>').join('');
      const referred = c.players_referred || 0;
      const referralRate = (c.referral_rate_cents || 0) / 100;
      const contact = [c.email, c.phone].filter(Boolean).map(escapeHtml).join('<br>');
      html += '<div class="coach-card role-' + role + '"><div class="cc-inner">' +
        '<div class="cc-top"><span class="cc-stage">' + (c.employment_type === 'full_time' ? 'Full-Time' : 'Part-Time') + '</span>' +
          '<span class="cc-name">' + escapeHtml(c.name) + '</span>' +
          '<span class="cc-hp">Salary<br><b>' + money(c.fixed_salary_cents) + '</b></span></div>' +
        '<div class="cc-art"><span class="cc-initials">' + escapeHtml(initials) + '</span>' +
          '<span class="cc-role">' + (COACH_ROLE_LABELS[role] || role) + '</span>' +
          (c.sultans ? '<span class="cc-star">★ SULTANS</span>' : '') + '</div>' +
        '<div class="cc-info">' + (c.degree ? escapeHtml(c.degree) : 'No degree listed') + '</div>' +
        '<div class="cc-move"><span class="cc-cost">GRADES</span><div class="txt">' + (grades ? '<div class="cc-chips">' + grades + '</div>' : '<span class="txt">None assigned</span>') + '</div></div>' +
        '<div class="cc-move"><span class="cc-cost">REFER</span><div><b>Referral bonus</b><span class="txt">' +
          (referralRate > 0 ? '$' + referralRate.toFixed(2) + ' × ' + referred + ' = $' + (referralRate * referred).toFixed(2) : '—') + '</span></div></div>' +
        (c.qualifications ? '<details class="cc-card-details"><summary>Qualifications</summary><div>' + escapeHtml(c.qualifications) + '</div></details>' : '') +
        (c.certificates ? '<details class="cc-card-details"><summary>Certificates</summary><div>' + escapeHtml(c.certificates) + '</div></details>' : '') +
        (c.notes ? '<details class="cc-card-details"><summary>Notes</summary><div>' + escapeHtml(c.notes) + '</div></details>' : '') +
        '<div class="cc-foot"><div class="cc-contact">' + (contact || '&nbsp;') + '</div>' +
          '<div class="cc-actions">' +
            '<button type="button" class="btn-edit-row" data-id="' + c.id + '">Edit</button>' +
            '<button type="button" class="btn-delete-row" data-id="' + c.id + '">Delete</button>' +
          '</div></div>' +
        '</div></div>';
    });
    html += '</div>';
    return html;
  }

  let coachRows = [];
  let editCoachId = null;

  async function loadCoaches(){
    coachRows = await api('/api/admin/coaches');
    COACH_ROLES.forEach((role) => {
      const wrap = document.getElementById('coachesTableWrap_' + role);
      if (!wrap) return;
      const rowsForRole = coachRows.filter((c) => (c.role || 'coach') === role);
      wrap.innerHTML = renderCoachesTable(rowsForRole);
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
    });
  }

  function openCoachModal(coach){
    editCoachId = coach ? coach.id : null;
    document.getElementById('coachModalTitle').textContent = coach ? 'Edit Coach' : 'Add Coach';
    document.getElementById('coachCategory').value = coach ? (coach.role || 'coach') : 'coach';
    document.getElementById('coachFirstName').value = coach ? (coach.first_name || '') : '';
    document.getElementById('coachLastName').value = coach ? (coach.last_name || '') : '';
    document.getElementById('coachEmail').value = coach ? (coach.email || '') : '';
    document.getElementById('coachPhone').value = coach ? (coach.phone || '') : '';
    document.getElementById('coachDegree').value = coach ? (coach.degree || '') : '';
    document.getElementById('coachEmploymentType').value = coach ? (coach.employment_type || 'part_time') : 'part_time';
    document.getElementById('coachQualifications').value = coach ? (coach.qualifications || '') : '';
    document.getElementById('coachCertificates').value = coach ? (coach.certificates || '') : '';
    document.getElementById('coachFixedSalary').value = coach ? ((coach.fixed_salary_cents || 0) / 100).toFixed(2) : '0';
    document.getElementById('coachReferralRate').value = coach ? ((coach.referral_rate_cents || 0) / 100).toFixed(2) : '0';
    document.getElementById('coachPlayersReferred').value = coach ? (coach.players_referred || 0) : '0';
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
    const firstName = document.getElementById('coachFirstName').value.trim();
    const lastName = document.getElementById('coachLastName').value.trim();
    if (!firstName || !lastName) { errEl.textContent = "Please enter the coach's first and last name."; return; }
    const grades = GRADES.filter((g) => document.getElementById('coachGrade_' + g) && document.getElementById('coachGrade_' + g).checked);
    const payload = {
      firstName,
      lastName,
      role: document.getElementById('coachCategory').value,
      email: document.getElementById('coachEmail').value.trim(),
      phone: document.getElementById('coachPhone').value.trim(),
      degree: document.getElementById('coachDegree').value.trim(),
      employmentType: document.getElementById('coachEmploymentType').value,
      qualifications: document.getElementById('coachQualifications').value.trim(),
      certificates: document.getElementById('coachCertificates').value.trim(),
      fixedSalaryCents: Math.round(parseFloat(document.getElementById('coachFixedSalary').value || '0') * 100),
      referralRateCents: Math.round(parseFloat(document.getElementById('coachReferralRate').value || '0') * 100),
      playersReferred: parseInt(document.getElementById('coachPlayersReferred').value || '0', 10),
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
        // Fixed/Referral Salary auto-sync into Charges server-side — refresh
        // that tab's table too if it's already been opened this session.
        if (chargesLoaded) { await loadCharges(); }
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

  document.getElementById('downloadMonthlyReportLink').addEventListener('click', (e) => {
    e.preventDefault();
    window.open(API_BASE + '/api/admin/monthly-report/current/pdf?token=' + encodeURIComponent(getToken()));
  });

  document.getElementById('sendMonthlyReportBtn').addEventListener('click', async () => {
    const btn = document.getElementById('sendMonthlyReportBtn');
    const status = document.getElementById('monthlyReportStatus');
    btn.disabled = true;
    status.textContent = 'Generating and sending…';
    try {
      const result = await api('/api/admin/monthly-report/send', { method: 'POST', body: JSON.stringify({}) });
      if (result.error) {
        status.textContent = '';
        alert(result.error);
      } else {
        status.textContent = 'Sent!';
        setTimeout(() => { status.textContent = ''; }, 3000);
      }
    } catch (e) {
      status.textContent = '';
      alert('Could not send the report. Please try again.');
    } finally {
      btn.disabled = false;
    }
  });

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

  function fmtDate(v){
    if (!v) return '';
    return new Date(v).toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  async function loadAgreements(){
    const wrap = document.getElementById('agreementsTableWrap');
    const rows = await api('/api/admin/agreements');
    if (!Array.isArray(rows) || !rows.length) { wrap.innerHTML = '<div class="empty">No agreements sent yet.</div>'; return; }
    let html = '<table><thead><tr><th>Player</th><th>Parent</th><th>Program</th><th>Sent</th><th>Status</th><th></th></tr></thead><tbody>';
    rows.forEach((r) => {
      const signed = !!r.signed_at;
      html += '<tr>' +
        '<td>' + escapeHtml(r.player_name) + '</td>' +
        '<td>' + escapeHtml(r.parent_name || '') + '<br><span style="color:#888;font-size:0.8rem;">' + escapeHtml(r.parent_email || '') + '</span></td>' +
        '<td>' + escapeHtml(r.program_label || '') + '</td>' +
        '<td>' + escapeHtml(fmtDate(r.sent_at)) + '</td>' +
        '<td>' + (signed ? '<span class="status-badge status-paid">Signed ' + escapeHtml(fmtDate(r.signed_at)) + '</span>' : '<span class="status-badge status-pending">Awaiting signature</span>') + '</td>' +
        '<td>' + (signed
          ? '<a class="btn-export" href="#" data-pdf="' + r.id + '">Download PDF</a>'
          : '<button type="button" class="btn-payment-link" data-resend-type="' + escapeHtml(r.registration_type) + '" data-resend-id="' + r.registration_id + '">Resend</button> <button type="button" class="btn-delete-row" data-del="' + r.id + '">Delete</button>') + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
    wrap.querySelectorAll('a[data-pdf]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(API_BASE + '/api/admin/agreements/' + a.getAttribute('data-pdf') + '/pdf?token=' + encodeURIComponent(getToken()));
      });
    });
    wrap.querySelectorAll('[data-resend-id]').forEach((b) => {
      b.addEventListener('click', async () => {
        b.disabled = true;
        try {
          const r = await api('/api/admin/agreements/send', { method: 'POST', body: JSON.stringify({ registrationType: b.getAttribute('data-resend-type'), registrationId: Number(b.getAttribute('data-resend-id')) }) });
          alert(r.error ? r.error : 'Agreement link re-sent.');
        } catch (e) { alert('Could not resend. Please try again.'); }
        b.disabled = false;
      });
    });
    wrap.querySelectorAll('[data-del]').forEach((b) => {
      b.addEventListener('click', async () => {
        if (!confirm('Delete this unsigned agreement request? The family\\'s link will stop working.')) return;
        await api('/api/admin/agreements/' + b.getAttribute('data-del'), { method: 'DELETE' });
        loadAgreements();
      });
    });
  }

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
    const card = (n, l) => '<div class="card"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>';
    document.getElementById('summary').innerHTML =
      '<div class="sum-group sum-reg"><h3 class="sum-title">Registrations</h3><div class="sum-cards">' +
        card(s.potentialRchCount ?? 0, 'Potential RCH') + card(s.potentialSultansCount ?? 0, 'Potential Sultans') +
      '</div></div>' +
      '<div class="sum-group sum-rch"><h3 class="sum-title">RCH Training</h3><div class="sum-cards">' +
        card(s.skillsTrainingCount ?? 0, 'Skills Training') +
      '</div></div>' +
      '<div class="sum-group sum-sul"><h3 class="sum-title">Sultans</h3><div class="sum-cards">' +
        groups.map(g => card(counts[g], groupLabels[g])).join('') +
      '</div></div>';
  }

  function paymentLabel(row){
    if (row.payment_status === 'completed') {
      if (row.paused_until && new Date(row.paused_until) > new Date()) {
        return 'Paused until ' + String(row.paused_until).slice(0, 10);
      }
      if (row.last_payment_status === 'failed') return 'Declined';
      return 'Paid';
    }
    if (row.paid_otherwise_at) return 'Paid otherwise';
    if (row.payment_status === 'canceled') return 'Canceled';
    if (row.payment_status === 'pending') return 'Pending';
    return 'Not sent';
  }

  function paymentLabelClass(row){
    const label = paymentLabel(row);
    if (label === 'Paid' || label === 'Paid otherwise') return 'status-paid';
    if (label === 'Declined') return 'status-declined';
    if (label === 'Pending') return 'status-pending';
    return 'status-neutral';
  }

  // Email as a small dropdown: keeps the table narrow, and the address stays
  // selectable (one click selects it all) with a Copy button as well.
  function emailDropdown(email){
    if (!email) return '—';
    const e = escapeHtml(email);
    return '<details class="email-dd"><summary>Email</summary>' +
      '<div class="email-dd-body"><span class="email-dd-text">' + e + '</span>' +
      '<button type="button" class="btn-copy-email" data-copy="' + e + '">Copy</button></div></details>';
  }
  function fmtDay(v){ const p = String(v || '').slice(0, 10).split('-'); return p.length === 3 ? p[1] + '/' + p[2] + '/' + p[0] : ''; }
  function addSiblingLabel(r){ return { ...r, sibling_label: r.sibling_discount ? r.sibling_discount + '% sibling' : '—' }; }

  async function loadSkills(){
    const rows = (await api('/api/admin/skills-registrations')).map(addSiblingLabel);
    document.getElementById('skillsTableWrap').innerHTML = renderTable(rows.map(r => ({ ...r, email: emailDropdown(r.email), dob: fmtDay(r.dob), submitted_at: fmtDate(r.submitted_at) })), [
      { key:'jersey_number', label:'#' },
      { key:'full_name', label:'Name' },
      { key:'dob', label:'DOB' },
      { key:'email', label:'Email' },
      { key:'phone', label:'Phone' },
      { key:'team', label:'Team' },
      { key:'sibling_label', label:'Sibling' },
      { key:'experience', label:'Experience' },
      { key:'submitted_at', label:'Submitted' },
    ], { onDelete: true, onMoveToRoster: true, labelKey: 'full_name', ridPrefix: 'skills-' });
    wireDeleteButtons('skillsTableWrap', async (id) => {
      await api('/api/admin/skills-registrations/' + id, { method: 'DELETE' });
      await Promise.all([loadSummary(), loadSkills()]);
    });
    wireAgreementButtons('skillsTableWrap', 'skills');
    wireMoveToRosterButtons('skillsTableWrap', 'skills', rows, async () => { await Promise.all([loadSummary(), loadSkills()]); });
  }

  const GRADE_LABELS = {
    'pre-k':'Pre-K', 'kindergarten':'Kindergarten', '1st-grade':'1st Grade', '2nd-grade':'2nd Grade',
    '3rd-grade':'3rd Grade', '4th-grade':'4th Grade', '5th-grade':'5th Grade', '6th-grade':'6th Grade',
  };

  async function loadJoin(){
    const ageGroup = document.getElementById('ageGroupFilter').value;
    const rows = (await api('/api/admin/join-registrations' + (ageGroup ? '?ageGroup=' + encodeURIComponent(ageGroup) : ''))).map(addSiblingLabel);
    const displayRows = rows.map(r => ({ ...r, email: emailDropdown(r.email), age_group: GRADE_LABELS[r.age_group] || r.age_group, dob: fmtDay(r.dob), submitted_at: fmtDate(r.submitted_at) }));
    document.getElementById('joinTableWrap').innerHTML = renderTable(displayRows, [
      { key:'jersey_number', label:'#' },
      { key:'age_group', label:'Grade' },
      { key:'child_name', label:'Player' },
      { key:'dob', label:'DOB' },
      { key:'parent_name', label:'Parent' },
      { key:'email', label:'Email' },
      { key:'phone', label:'Phone' },
      { key:'availability', label:'Availability' },
      { key:'sibling_label', label:'Sibling' },
      { key:'submitted_at', label:'Submitted' },
    ], { onDelete: true, onMoveToRoster: true, labelKey: 'child_name', ridPrefix: 'join-' });
    wireDeleteButtons('joinTableWrap', async (id) => {
      await api('/api/admin/join-registrations/' + id, { method: 'DELETE' });
      await Promise.all([loadSummary(), loadJoin()]);
    });
    wireAgreementButtons('joinTableWrap', 'join');
    wireMoveToRosterButtons('joinTableWrap', 'join', rows, async () => { await Promise.all([loadSummary(), loadJoin()]); });
  }

  // ---- Players Roster, Season Overview, Pricing & Revenue ----

  const GRADES = ['pre-k','kindergarten','1st-grade','2nd-grade','3rd-grade','4th-grade','5th-grade','6th-grade'];
  let currentPricing = { priceOneCents: 6000, priceTwoCents: 10000, priceOnlineCents: 3120 };
  let lastOverview = null;
  let lastChargesCents = 0;

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Closes any open row-action "⋯" menus — called before opening a new one,
  // and on any click outside a menu, so at most one stays open at a time.
  function closeAllRowMenus(){
    document.querySelectorAll('.row-menu').forEach((m) => m.classList.add('hidden'));
  }
  document.addEventListener('click', closeAllRowMenus);
  window.addEventListener('scroll', closeAllRowMenus, { passive: true });
  window.addEventListener('resize', closeAllRowMenus);

  // Agreement column on the roster: signed ✓, or sent/not sent with a button
  // to (re)send the e-sign link right from the row.
  function agreementCell(r, label){
    if (r.agreement_signed_at) {
      return '<span class="status-badge status-paid">Signed ✓</span>';
    }
    const sent = !!r.agreement_sent_at;
    return '<span class="status-badge ' + (sent ? 'status-pending' : 'status-neutral') + '">' + (sent ? 'Awaiting signature' : 'Not sent') + '</span>';
  }

  function renderRosterTable(rows){
    if (!rows.length) return '<div class="empty">No players yet.</div>';
    let html = '<table><thead><tr>' +
      '<th>Name</th><th>DOB</th><th>Parent</th><th>Phone</th><th>Email</th>' +
      '<th>Sessions</th><th>RCH</th><th>Sultans</th><th>Discount</th><th>Sibling</th><th>Payment Status</th><th>Agreement</th><th></th>' +
      '</tr></thead><tbody>';
    rows.forEach((r) => {
      const label = escapeHtml(r.player_name);
      html += '<tr data-rid="player-' + r.id + '">' +
        '<td>' + escapeHtml(r.player_name) + '</td>' +
        '<td>' + escapeHtml(fmtDay(r.dob)) + '</td>' +
        '<td>' + escapeHtml(r.parent_name || '') + '</td>' +
        '<td>' + escapeHtml(r.parent_phone || '') + '</td>' +
        '<td>' + emailDropdown(r.parent_email) + '</td>' +
        '<td>' + (r.session_type === 'two' ? 'Two' : r.session_type === 'online' ? 'Online' : 'One') + '</td>' +
        '<td>' + (r.rch ? '✓' : '—') + '</td>' +
        '<td>' + (r.sultans ? '✓' : '—') + '</td>' +
        '<td>$' + ((r.effective_discount_cents != null ? r.effective_discount_cents : r.discount_cents) / 100).toFixed(2) + (r.effective_discount_cents > 0 ? (r.discount_is_manual ? ' <span style="color:#888; font-size:0.72rem;">(manual)</span>' : ' <span style="color:#888; font-size:0.72rem;">(sibling)</span>') : '') + '</td>' +
        '<td>' + (r.sibling_discount ? r.sibling_discount + '%' : '—') + '</td>' +
        '<td><span class="status-badge ' + paymentLabelClass(r) + '">' + escapeHtml(paymentLabel(r)) + '</span></td>' +
        '<td>' + agreementCell(r, label) + '</td>' +
        '<td>' +
          '<div class="row-actions">' +
            '<button type="button" class="btn-payment-link" data-id="' + r.id + '" data-label="' + label + '" data-session="' + (r.session_type || 'one') + '" data-sibling="' + (r.sibling_discount || 0) + '">Send Payment Link</button>' +
            '<button type="button" class="btn-kebab" aria-label="More actions">⋯</button>' +
            '<div class="row-menu hidden">' +
              (r.agreement_signed_at
                ? '<button type="button" class="btn-dl-agreement" data-agreement="' + r.agreement_id + '">Download Signed Agreement</button>'
                : '<button type="button" class="btn-send-agreement" data-id="' + r.id + '" data-label="' + label + '">' + (r.agreement_sent_at ? 'Resend Agreement' : 'Send Agreement') + '</button>') +
              '<button type="button" class="btn-paid-other" data-id="' + r.id + '" data-paid="' + (r.paid_otherwise_at ? '1' : '0') + '">' + (r.paid_otherwise_at ? 'Undo Paid Otherwise' : 'Paid Otherwise') + '</button>' +
              (r.payment_status === 'completed' && !r.stripe_subscription_id
                ? '<button type="button" class="btn-start-billing" data-id="' + r.id + '" data-label="' + label + '">Start Monthly Billing</button>' : '') +
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
    document.getElementById('epSessions').value = (player.session_type === 'two' || player.session_type === 'online') ? player.session_type : 'one';
    document.getElementById('epRch').checked = !!player.rch;
    document.getElementById('epSultans').checked = !!player.sultans;
    document.getElementById('epDiscount').value = (player.discount_cents / 100).toFixed(2);
    document.getElementById('epSibling').value = String(player.sibling_discount || 0);
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
      siblingDiscount: Number(document.getElementById('epSibling').value) || 0,
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
    wrap.querySelectorAll('.btn-paid-other').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const undo = btn.getAttribute('data-paid') === '1';
        btn.disabled = true;
        try {
          await api('/api/admin/players/' + btn.getAttribute('data-id') + '/paid-otherwise', {
            method: 'PUT',
            body: JSON.stringify({ paid: !undo }),
          });
          await loadRoster();
        } catch (e) {
          alert('Could not update this player. Please try again.');
          btn.disabled = false;
        }
      });
    });
    wireAgreementButtons('rosterTableWrap', 'player', loadRoster);
    wrap.querySelectorAll('.btn-start-billing').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const label = btn.getAttribute('data-label') || 'this family';
        if (!confirm('This family paid but has no monthly billing in Stripe. Start their monthly subscription now (charged to their saved card, first charge at the next billing date)? ' + label)) return;
        btn.disabled = true;
        try {
          const r = await api('/api/admin/payment-links/start-billing', { method: 'POST', body: JSON.stringify({ registrationType: 'player', registrationId: Number(btn.getAttribute('data-id')) }) });
          if (r.error) { alert(r.error); btn.disabled = false; }
          else { alert('Monthly billing started.'); await loadRoster(); }
        } catch (e) { alert('Could not start billing. Please try again.'); btn.disabled = false; }
      });
    });
    wrap.querySelectorAll('.btn-dl-agreement').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(API_BASE + '/api/admin/agreements/' + a.getAttribute('data-agreement') + '/pdf?token=' + encodeURIComponent(getToken()));
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
        if (wasHidden) {
          menu.classList.remove('hidden');
          // The menu is position:fixed so the table's own scroll box can't clip it.
          const r = btn.getBoundingClientRect();
          menu.style.top = (r.bottom + 4) + 'px';
          menu.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
          menu.style.left = 'auto';
        }
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
      '<th>Total Sultans</th><th>Total Both</th><th>Total One Session</th><th>Total Two Session</th><th>Total Online</th></tr></thead><tbody>';
    const grand = { players:0, rch:0, sultans:0, both:0, one:0, two:0, online:0 };
    GRADES.forEach((g) => {
      const o = overview[g] || { totalPlayers:0, totalRch:0, totalSultans:0, totalBoth:0, totalOne:0, totalTwo:0, totalOnline:0 };
      grand.players += o.totalPlayers; grand.rch += o.totalRch; grand.sultans += o.totalSultans;
      grand.both += o.totalBoth; grand.one += o.totalOne; grand.two += o.totalTwo; grand.online += (o.totalOnline || 0);
      html += '<tr><td>' + GRADE_LABELS[g] + '</td><td>' + o.totalPlayers + '</td><td>' + o.totalRch + '</td>' +
        '<td>' + o.totalSultans + '</td><td>' + o.totalBoth + '</td><td>' + o.totalOne + '</td><td>' + o.totalTwo + '</td><td>' + (o.totalOnline || 0) + '</td></tr>';
    });
    html += '<tr class="grand-total"><td>GRAND TOTAL</td><td>' + grand.players + '</td><td>' + grand.rch + '</td>' +
      '<td>' + grand.sultans + '</td><td>' + grand.both + '</td><td>' + grand.one + '</td><td>' + grand.two + '</td><td>' + grand.online + '</td></tr>';
    html += '</tbody></table>';
    return html;
  }

  // This account's actual confirmed rates (checked in Stripe Settings ->
  // Plans and fees, Oct 2026):
  //   - Payments (standard domestic card): 2.9% + $0.30 per successful charge
  //   - Billing (subscriptions/invoices):  0.7% of billing volume, ON TOP of
  //     the payments fee above
  // Every charge in this table is the ongoing MONTHLY subscription amount,
  // which runs through Stripe Billing (stripe.subscriptions.create in
  // payments.js) — so both fees apply to it. This is still an estimate:
  // actual per-charge fees can differ slightly (international cards, Amex,
  // disputes, etc.); Stripe's own "Balance" / "Payouts" reports are the
  // source of truth for what was actually deducted.
  const STRIPE_PCT = 0.029;
  const STRIPE_BILLING_PCT = 0.007;
  const STRIPE_FIXED_CENTS = 30;

  function stripeFeeCents(amountCents, transactionCount){
    return Math.round(amountCents * (STRIPE_PCT + STRIPE_BILLING_PCT)) + (transactionCount * STRIPE_FIXED_CENTS);
  }

  // Sums this calendar month's business charges/expenses (not Stripe fees) —
  // every "recurring" charge applies every month, plus any "one_time" charge
  // whose charge_month is this month. Mirrors the WHERE clause the server
  // uses when building a monthly snapshot (reports.js generateSnapshot), but
  // computed live here from whatever /api/admin/charges returns right now.
  function currentMonthChargesCents(charges){
    const now = new Date();
    const monthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    return (charges || []).reduce((sum, c) => {
      if (c.kind === 'recurring') return sum + c.amount_cents;
      if (c.kind === 'one_time' && c.charge_month && String(c.charge_month).slice(0, 7) === monthKey) {
        return sum + c.amount_cents;
      }
      return sum;
    }, 0);
  }

  function renderRevenueTable(overview, pricing, chargesCents){
    let html = '<table><thead><tr><th>Grade</th><th>One-Session Players</th><th>Two-Session Players</th><th>Online Players</th>' +
      '<th>Revenue (One)</th><th>Revenue (Two)</th><th>Revenue (Online)</th><th>Discounts</th><th>Total Revenue</th>' +
      '<th>Est. Stripe Fees</th><th>Net After Stripe</th></tr></thead><tbody>';
    const totals = { one:0, two:0, online:0, revOne:0, revTwo:0, revOnline:0, disc:0, total:0, fee:0, net:0 };
    const money = (c) => '$' + (c/100).toFixed(2);
    GRADES.forEach((g) => {
      const o = overview[g] || { totalOne:0, totalTwo:0, totalOnline:0, totalDiscountCents:0 };
      const online = o.totalOnline || 0;
      const revOne = o.totalOne * pricing.priceOneCents;
      const revTwo = o.totalTwo * pricing.priceTwoCents;
      const revOnline = online * (pricing.priceOnlineCents || 0);
      const disc = o.totalDiscountCents || 0;
      const total = revOne + revTwo + revOnline - disc;
      // Each player is charged separately (its own subscription), so the
      // $0.30 fixed fee applies per player, not once per grade.
      const fee = stripeFeeCents(total, o.totalOne + o.totalTwo + online);
      const net = total - fee;
      totals.one += o.totalOne; totals.two += o.totalTwo; totals.online += online;
      totals.revOne += revOne; totals.revTwo += revTwo; totals.revOnline += revOnline;
      totals.disc += disc; totals.total += total; totals.fee += fee; totals.net += net;
      html += '<tr><td>' + GRADE_LABELS[g] + '</td><td>' + o.totalOne + '</td><td>' + o.totalTwo + '</td><td>' + online + '</td>' +
        '<td>' + money(revOne) + '</td><td>' + money(revTwo) + '</td><td>' + money(revOnline) + '</td>' +
        '<td>' + money(disc) + '</td><td>' + money(total) + '</td>' +
        '<td>' + money(fee) + '</td><td>' + money(net) + '</td></tr>';
    });
    html += '<tr class="grand-total"><td>TOTAL WON (Revenue)</td><td>' + totals.one + '</td><td>' + totals.two + '</td><td>' + totals.online + '</td>' +
      '<td>' + money(totals.revOne) + '</td><td>' + money(totals.revTwo) + '</td><td>' + money(totals.revOnline) + '</td>' +
      '<td>' + money(totals.disc) + '</td><td>' + money(totals.total) + '</td>' +
      '<td>' + money(totals.fee) + '</td><td>' + money(totals.net) + '</td></tr>';
    html += '</tbody></table>';

    const charges = chargesCents || 0;
    const finalNet = totals.net - charges;
    html += '<table style="margin-top:14px;"><tbody>' +
      '<tr><td>Total Revenue (gross)</td><td>$' + (totals.total/100).toFixed(2) + '</td></tr>' +
      '<tr><td>Est. Stripe Fees</td><td>-$' + (totals.fee/100).toFixed(2) + '</td></tr>' +
      '<tr><td>Business Charges This Month</td><td>-$' + (charges/100).toFixed(2) + '</td></tr>' +
      '<tr class="grand-total"><td>Final Net Revenue</td><td>$' + (finalNet/100).toFixed(2) + '</td></tr>' +
      '</tbody></table>';
    html += '<p style="color:#666; font-size:0.8rem; margin-top:8px;">Stripe fees are estimated at 2.9% + $0.30 per player charge (standard payments rate) plus 0.7% billing fee on subscriptions — actual fees may vary slightly. Business Charges This Month pulls live from the Charges list below: every Recurring charge, plus any One-time charge dated this month.</p>';
    return html;
  }

  async function loadOverviewAndRevenue(){
    const [overview, charges] = await Promise.all([
      api('/api/admin/players-overview'),
      api('/api/admin/charges'),
    ]);
    lastOverview = overview;
    lastChargesCents = currentMonthChargesCents(charges);
    document.getElementById('overviewTableWrap').innerHTML = renderOverviewTable(overview);
    document.getElementById('revenueTableWrap').innerHTML = renderRevenueTable(overview, currentPricing, lastChargesCents);
  }

  async function loadPricing(){
    const p = await api('/api/admin/pricing');
    currentPricing = p;
  }

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
      await loadPricing();
      await loadOverviewAndRevenue();
      await loadRoster();
    } catch (e) {
      alert('Could not save payment amounts. Please try again.');
    } finally {
      btn.disabled = false;
    }
  });

  // ---- Reset Payment Status (start of a new billing month) ----

  async function loadResetInfo(){
    try {
      const { lastResetAt } = await api('/api/admin/reset-payment-status');
      document.getElementById('resetPaymentInfo').textContent = lastResetAt
        ? 'Last reset: ' + new Date(lastResetAt).toLocaleString()
        : 'Never reset yet.';
    } catch (e) { /* non-critical */ }
  }

  document.getElementById('resetPaymentStatusBtn').addEventListener('click', async () => {
    if (!confirm('Reset payment status for EVERYONE?\\n\\nEvery player goes back to "Not sent", unpaid links are cancelled, and "Paid otherwise" marks are cleared. Do this only once last month\\'s links have expired and you are ready to send new ones.')) return;
    const typed = prompt('Second check: type RESET (all capitals) to confirm.');
    if (typed !== 'RESET') {
      if (typed !== null) alert('Not reset — the word did not match.');
      return;
    }
    const btn = document.getElementById('resetPaymentStatusBtn');
    btn.disabled = true;
    try {
      const r = await api('/api/admin/reset-payment-status', {
        method: 'POST',
        body: JSON.stringify({ confirm: 'RESET' }),
      });
      if (r && r.error) { alert(r.error); btn.disabled = false; return; }
      alert('Done. Everyone is back to "Not sent".\\nUnpaid links cancelled: ' + r.cancelledLinks + '\\nPaid-otherwise marks cleared: ' + r.clearedPaidOtherwise);
      await Promise.all([loadRoster(), loadResetInfo()]);
    } catch (e) {
      alert('Could not reset payment status. Please try again.');
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
    let html = '<table><thead><tr><th>Title</th><th>Description</th><th>Sent To</th><th>Amount</th><th>Status</th><th>Link</th><th></th></tr></thead><tbody>';
    rows.forEach((p) => {
      const sentTo = p.recipient_name
        ? escapeHtml(p.recipient_name) + (p.email ? ' <span style="color:#888;">(' + escapeHtml(p.email) + ')</span>' : '')
        : '<span style="color:#888;">— (ad hoc link)</span>';
      html += '<tr>' +
        '<td>' + escapeHtml(p.title) + '</td>' +
        '<td>' + escapeHtml(p.description || '—') + '</td>' +
        '<td>' + sentTo + '</td>' +
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

  // ---- Send Link (targeted bulk one-time payment to a roster audience) ----
  //
  // Each matching family gets its OWN payment_link row/token (see backend
  // comment) so their paid/pending status tracks independently — not one
  // link shared across everyone.

  function populateSendLinkScopeOptions(){
    const sel = document.getElementById('slScopeSelect');
    let html = '<option value="all">All Players</option>' +
      '<option value="all_rch">All RCH Elite Training</option>' +
      '<option value="all_sultans">All Sultans FC</option>';
    html += '<optgroup label="A Specific Grade (any program)">';
    GRADES.forEach((g) => { html += '<option value="grade:' + g + '">' + GRADE_LABELS[g] + '</option>'; });
    html += '</optgroup><optgroup label="RCH — Specific Grade">';
    GRADES.forEach((g) => { html += '<option value="rch_grade:' + g + '">' + GRADE_LABELS[g] + '</option>'; });
    html += '</optgroup><optgroup label="Sultans — Specific Grade">';
    GRADES.forEach((g) => { html += '<option value="sultans_grade:' + g + '">' + GRADE_LABELS[g] + '</option>'; });
    html += '</optgroup><option value="individual">Individual player…</option>';
    sel.innerHTML = html;
  }

  let sendLinkAllPlayers = [];

  function renderSendLinkIndividualOptions(filterText){
    const sel = document.getElementById('slIndividualSelect');
    const q = (filterText || '').trim().toLowerCase();
    const matches = !q ? sendLinkAllPlayers : sendLinkAllPlayers.filter((p) =>
      (p.player_name || '').toLowerCase().indexOf(q) !== -1 ||
      (p.parent_name || '').toLowerCase().indexOf(q) !== -1
    );
    if (!matches.length) {
      sel.innerHTML = '<option value="">No players match "' + escapeHtml(filterText || '') + '"</option>';
      return;
    }
    sel.innerHTML = matches.map((p) =>
      '<option value="' + p.id + '">' + escapeHtml(p.player_name) + ' — ' + (GRADE_LABELS[p.grade] || p.grade) +
      (p.parent_name ? ' (' + escapeHtml(p.parent_name) + ')' : '') + '</option>'
    ).join('');
  }

  async function populateSendLinkIndividualSelect(){
    const sel = document.getElementById('slIndividualSelect');
    document.getElementById('slIndividualSearch').value = '';
    sel.innerHTML = '<option value="">Loading…</option>';
    try {
      sendLinkAllPlayers = await api('/api/admin/players');
      if (!sendLinkAllPlayers.length) {
        sel.innerHTML = '<option value="">No active players on the roster</option>';
        return;
      }
      renderSendLinkIndividualOptions('');
    } catch (e) {
      sendLinkAllPlayers = [];
      sel.innerHTML = '<option value="">Could not load players</option>';
    }
  }

  document.getElementById('slIndividualSearch').addEventListener('input', (e) => {
    renderSendLinkIndividualOptions(e.target.value);
  });

  function parseSendLinkScopeValue(value){
    if (value.indexOf('grade:') === 0) return { scope: 'grade', grade: value.slice(6) };
    if (value.indexOf('rch_grade:') === 0) return { scope: 'rch_grade', grade: value.slice(10) };
    if (value.indexOf('sultans_grade:') === 0) return { scope: 'sultans_grade', grade: value.slice(14) };
    return { scope: value, grade: null };
  }

  document.getElementById('slScopeSelect').addEventListener('change', () => {
    const isIndividual = document.getElementById('slScopeSelect').value === 'individual';
    document.getElementById('slIndividualWrap').classList.toggle('hidden', !isIndividual);
  });

  function closeSendLinkModal(){
    document.getElementById('sendLinkModal').classList.add('hidden');
  }

  document.getElementById('openSendLinkBtn').addEventListener('click', async () => {
    document.getElementById('slTitleInput').value = '';
    document.getElementById('slDescInput').value = '';
    document.getElementById('slAmountInput').value = '';
    populateSendLinkScopeOptions();
    document.getElementById('slScopeSelect').value = 'all';
    document.getElementById('slIndividualWrap').classList.add('hidden');
    document.getElementById('sendLinkStep1Error').textContent = '';
    document.getElementById('sendLinkStep2Error').textContent = '';
    document.getElementById('sendLinkStep1').classList.remove('hidden');
    document.getElementById('sendLinkStep2').classList.add('hidden');
    const confirmBtn = document.getElementById('sendLinkConfirmBtn');
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Send';
    document.getElementById('sendLinkModal').classList.remove('hidden');
    await populateSendLinkIndividualSelect();
  });
  document.getElementById('sendLinkCancel1').addEventListener('click', closeSendLinkModal);

  let sendLinkCtx = null;

  function renderSendLinkPreview(result){
    const { recipients, sendableCount, skipped } = result;
    const summaryEl = document.getElementById('sendLinkSummary');
    if (!recipients.length) {
      summaryEl.textContent = 'No players match this selection.';
    } else {
      summaryEl.textContent = 'This will email ' + sendableCount + ' ' + (sendableCount === 1 ? 'family' : 'families') +
        (skipped.length ? ' — ' + skipped.length + ' skipped (no email on file)' : '') + '.';
    }
    const listEl = document.getElementById('sendLinkRecipientsList');
    if (!recipients.length) {
      listEl.innerHTML = '<div style="color:#888;">Nothing to show.</div>';
    } else {
      listEl.innerHTML = recipients.map((r) => {
        const gradeLabel = GRADE_LABELS[r.grade] || r.grade;
        if (r.email) {
          return '<div style="padding:4px 0; border-bottom:1px solid #f2f2f2;">' + escapeHtml(r.playerName) + ' — ' + gradeLabel +
            ' <span style="color:#888;">(' + escapeHtml(r.email) + ')</span></div>';
        }
        return '<div style="padding:4px 0; border-bottom:1px solid #f2f2f2; color:#b5482f;">' + escapeHtml(r.playerName) + ' — ' + gradeLabel +
          ' — no parent email on file, will be skipped</div>';
      }).join('');
    }
    document.getElementById('sendLinkConfirmBtn').disabled = sendableCount === 0;
  }

  document.getElementById('sendLinkPreviewBtn').addEventListener('click', async () => {
    const errEl = document.getElementById('sendLinkStep1Error');
    errEl.textContent = '';
    const title = document.getElementById('slTitleInput').value.trim();
    const description = document.getElementById('slDescInput').value.trim();
    const amountCents = Math.round(parseFloat(document.getElementById('slAmountInput').value || '0') * 100);
    const scopeValue = document.getElementById('slScopeSelect').value;
    const { scope, grade } = parseSendLinkScopeValue(scopeValue);
    const playerId = scope === 'individual' ? document.getElementById('slIndividualSelect').value : null;

    if (!title) { errEl.textContent = 'Please enter a title.'; return; }
    if (!amountCents || amountCents <= 0) { errEl.textContent = 'Please enter an amount greater than $0.'; return; }
    if (scope === 'individual' && !playerId) { errEl.textContent = 'Please choose a player.'; return; }

    const btn = document.getElementById('sendLinkPreviewBtn');
    btn.disabled = true;
    btn.textContent = 'Loading…';
    try {
      const params = new URLSearchParams({ scope });
      if (grade) params.set('grade', grade);
      if (playerId) params.set('playerId', playerId);
      const result = await api('/api/admin/one-time-payments/recipients?' + params.toString());
      if (result.error) {
        errEl.textContent = result.error;
        return;
      }
      sendLinkCtx = { title, description, amountCents, scope, grade, playerId };
      renderSendLinkPreview(result);
      document.getElementById('sendLinkStep1').classList.add('hidden');
      document.getElementById('sendLinkStep2').classList.remove('hidden');
    } catch (e) {
      errEl.textContent = 'Could not load recipients. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Preview Recipients';
    }
  });

  document.getElementById('sendLinkBackBtn').addEventListener('click', () => {
    document.getElementById('sendLinkStep2').classList.add('hidden');
    document.getElementById('sendLinkStep1').classList.remove('hidden');
  });

  document.getElementById('sendLinkConfirmBtn').addEventListener('click', async () => {
    if (!sendLinkCtx) return;
    const errEl = document.getElementById('sendLinkStep2Error');
    errEl.textContent = '';
    const btn = document.getElementById('sendLinkConfirmBtn');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const result = await api('/api/admin/one-time-payments/send', {
        method: 'POST',
        body: JSON.stringify(sendLinkCtx),
      });
      if (result.error) {
        errEl.textContent = result.error;
        btn.disabled = false;
        btn.textContent = 'Send';
        return;
      }
      closeSendLinkModal();
      let msg = 'Sent to ' + result.sentCount + ' ' + (result.sentCount === 1 ? 'family' : 'families') + '.';
      if (result.skipped && result.skipped.length) msg += '\\n\\nSkipped (no email on file): ' + result.skipped.join(', ');
      if (result.failed && result.failed.length) msg += '\\n\\nFailed to send (please retry for these): ' + result.failed.join(', ');
      alert(msg);
      await loadOneTimePayments();
    } catch (e) {
      errEl.textContent = 'Could not send. Please try again.';
      btn.disabled = false;
      btn.textContent = 'Send';
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
    document.getElementById('apSibling').value = '0';
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
      siblingDiscount: Number(document.getElementById('apSibling').value) || 0,
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
    // The count cards belong to the dashboard (Registrations) only.
    document.getElementById('summary').classList.toggle('hidden', name !== 'registrations');
    SECTION_IDS.forEach((id) => {
      document.getElementById('section-' + id).classList.toggle('hidden', id !== name);
    });
  }
  document.getElementById('sectionNav').addEventListener('change', async (e) => {
    const name = e.target.value;
    showSection(name);
    if (name === 'finances') await loadFinancesExtras();
    if (name === 'charges' && !chargesLoaded) { chargesLoaded = true; await loadCharges(); }
    if (name === 'coaches' && !coachesLoaded) { coachesLoaded = true; await loadCoaches(); }
    if (name === 'data') { await Promise.all([loadSnapshots(), loadArchivedPlayers(), loadAgreements()]); }
  });
  let chargesLoaded = false;
  let coachesLoaded = false;

  // Join Sultans FC registration can be open/closed per grade, so the toggle
  // tracks whichever grade is currently selected in the ageGroupFilter
  // dropdown — switching grades re-reads that grade's own on/off state.
  let joinOpenByGrade = {};

  // Skills Training: "All grades" controls the whole page; picking a grade
  // controls only that grade's option on the public form.
  let skillsWholeOpen = true;
  let skillsOpenByGrade = {};
  function applySkillsToggle(){
    const grade = document.getElementById('skillsGradeFilter').value;
    const toggle = document.getElementById('skillsOpenToggle');
    const label = document.getElementById('skillsOpenLabel');
    const gl = document.getElementById('skillsOpenGradeLabel');
    const open = grade ? skillsOpenByGrade[grade] !== false : skillsWholeOpen;
    toggle.checked = open;
    label.textContent = open ? 'Registration open' : 'Registration closed';
    if (gl) gl.textContent = grade ? '(' + (GRADE_LABELS[grade] || grade) + ')' : '(whole page)';
  }

  async function loadSkillsToggle(){
    const s = await api('/api/admin/settings');
    const toggle = document.getElementById('skillsOpenToggle');
    const label = document.getElementById('skillsOpenLabel');
    skillsWholeOpen = !!s.skillsTrainingOpen;
    skillsOpenByGrade = s.skillsOpenByGrade || {};
    applySkillsToggle();

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

  document.getElementById('skillsGradeFilter').addEventListener('change', applySkillsToggle);
  document.getElementById('skillsOpenToggle').addEventListener('change', async (e) => {
    const toggle = e.target;
    const grade = document.getElementById('skillsGradeFilter').value;
    const desiredState = toggle.checked;
    toggle.disabled = true;
    try {
      if (grade) {
        const result = await api('/api/admin/settings/skills-grade', {
          method: 'POST',
          body: JSON.stringify({ open: desiredState, grade }),
        });
        skillsOpenByGrade[grade] = !!result.open;
      } else {
        const result = await api('/api/admin/settings/skills-training', {
          method: 'POST',
          body: JSON.stringify({ open: desiredState }),
        });
        skillsWholeOpen = !!result.skillsTrainingOpen;
      }
    } catch (err) {
      alert('Could not update the Skills Training toggle. Please try again.');
    } finally {
      toggle.disabled = false;
      applySkillsToggle();
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

  // Everything the first screen needs loads at once. Pricing is needed before
  // the revenue table can draw, so that single dependency runs second. The
  // Finances-only panels (proration mode, reset info, one-time payments) wait
  // until you actually open the Finances tab.
  let financesLoaded = false;
  async function loadFinancesExtras(){
    if (financesLoaded) return;
    financesLoaded = true;
    await Promise.all([loadProrationMode(), loadResetInfo(), loadOneTimePayments()]);
  }

  async function loadAll(){
    financesLoaded = false;
    await Promise.all([
      loadSummary(), loadSkills(), loadJoin(), loadSkillsToggle(), loadRoster(),
      loadPricing(), loadPaymentPricing(),
    ]);
    await loadOverviewAndRevenue();
  }

  // ---- Expand / collapse all panels (Finances + Data) ----
  document.querySelectorAll('.panel-tool').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('data-panels') === 'expand';
      btn.closest('[id^="section-"]').querySelectorAll('details.panel').forEach((d) => { d.open = open; });
    });
  });

  // ---- Copy-email buttons (works on every table) ----
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-copy-email');
    if (!btn) return;
    const text = btn.getAttribute('data-copy') || '';
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Older/locked-down browsers: select the text and use the legacy copy command.
      const span = btn.parentElement.querySelector('.email-dd-text');
      const range = document.createRange(); range.selectNodeContents(span);
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      try { document.execCommand('copy'); } catch (e2) { /* the text is selected; Ctrl+C still works */ }
    }
    const old = btn.textContent;
    btn.textContent = 'Copied ✓';
    setTimeout(() => { btn.textContent = old; }, 1400);
  });

  // ---- Logo -> dashboard ----
  function goDashboard(e){
    if (e) e.preventDefault();
    document.getElementById('sectionNav').value = 'registrations';
    showSection('registrations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.getElementById('logoHome').addEventListener('click', goDashboard);

  // ---- Global search ----
  const searchInput = document.getElementById('globalSearch');
  const searchBox = document.getElementById('searchResults');
  let searchSeq = 0, searchTimer = null, searchItems = [], searchActive = -1;
  const TYPE_LABEL = { player: 'Roster', skills: 'Skills', join: 'Sultans' };

  function closeSearch(){ searchBox.classList.add('hidden'); searchActive = -1; }

  function renderSearch(results, q){
    searchItems = results;
    searchActive = results.length ? 0 : -1;
    if (!results.length) {
      searchBox.innerHTML = '<div class="sr-empty">No matches for "' + escapeHtml(q) + '".</div>';
    } else {
      searchBox.innerHTML = results.map((r, i) => {
        const dim = (r.moved || r.archived);
        const sess = r.sessionType === 'two' ? 'Two sessions' : r.sessionType === 'online' ? 'Online' : r.sessionType === 'one' ? 'One session' : '';
        const tag = r.archived ? 'Archived' : r.moved ? 'Moved to roster' : (r.sibling ? r.sibling + '% sibling' : '');
        return '<div class="sr-item' + (dim ? ' sr-dim' : '') + (i === 0 ? ' active' : '') + '" data-i="' + i + '" role="option">' +
          '<span class="sr-type t-' + r.type + '">' + TYPE_LABEL[r.type] + '</span>' +
          '<span class="sr-name">' + escapeHtml(r.name) + '</span>' +
          '<span class="sr-tag">' + escapeHtml(tag) + '</span>' +
          '<span class="sr-meta">' + [GRADE_LABELS[r.grade] || r.grade, sess, r.parent, r.email, r.phone].filter(Boolean).map(escapeHtml).join(' · ') + '</span>' +
          '</div>';
      }).join('');
    }
    searchBox.classList.remove('hidden');
  }

  function setSearchActive(i){
    const items = searchBox.querySelectorAll('.sr-item');
    if (!items.length) return;
    searchActive = (i + items.length) % items.length;
    items.forEach((el, n) => el.classList.toggle('active', n === searchActive));
    items[searchActive].scrollIntoView({ block: 'nearest' });
  }

  function flashRow(rid){
    const tr = document.querySelector('tr[data-rid="' + rid + '"]');
    if (!tr) return false;
    tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    tr.classList.remove('row-flash'); void tr.offsetWidth; tr.classList.add('row-flash');
    return true;
  }

  async function openSearchResult(r){
    if (!r || r.moved || r.archived) {
      if (r && r.archived) { document.getElementById('sectionNav').value = 'data'; showSection('data'); await Promise.all([loadSnapshots(), loadArchivedPlayers(), loadAgreements()]); closeSearch(); }
      return;
    }
    closeSearch();
    searchInput.blur();
    document.getElementById('sectionNav').value = 'registrations';
    showSection('registrations');
    if (r.type === 'player') {
      const sel = document.getElementById('rosterGradeFilter');
      if (sel.value !== r.grade) { sel.value = r.grade; await loadRoster(); }
      flashRow('player-' + r.id);
    } else if (r.type === 'join') {
      const sel = document.getElementById('ageGroupFilter');
      if (sel.value && sel.value !== r.grade) { sel.value = r.grade; applyJoinToggleForSelectedGrade(); await loadJoin(); }
      flashRow('join-' + r.id);
    } else {
      flashRow('skills-' + r.id);
    }
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = searchInput.value.trim();
    if (q.length < 2) { searchSeq++; closeSearch(); return; }
    searchTimer = setTimeout(async () => {
      const seq = ++searchSeq;
      try {
        const data = await api('/api/admin/search?q=' + encodeURIComponent(q));
        if (seq !== searchSeq) return; // a newer keystroke already replaced this
        renderSearch(data.results || [], q);
      } catch (e) { /* login redirect handled in api() */ }
    }, 220);
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSearchActive(searchActive + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSearchActive(searchActive - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (searchActive >= 0) openSearchResult(searchItems[searchActive]); }
    else if (e.key === 'Escape') { closeSearch(); searchInput.blur(); }
  });
  searchInput.addEventListener('focus', () => { if (searchInput.value.trim().length >= 2 && searchBox.innerHTML) searchBox.classList.remove('hidden'); });
  searchBox.addEventListener('click', (e) => {
    const el = e.target.closest('.sr-item');
    if (el) openSearchResult(searchItems[Number(el.getAttribute('data-i'))]);
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.search-wrap')) closeSearch(); });
  document.addEventListener('keydown', (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag) && !appView.classList.contains('hidden')) { e.preventDefault(); searchInput.focus(); searchInput.select(); }
  });

  wireExportLinks();
  if (getToken()) showApp(); else showLogin();
</script>
</body>
</html>
`;
