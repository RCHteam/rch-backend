const logo = require('./logo');

module.exports = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>RCH Elite Training — Payment</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  .logo{ display:block; max-width:220px; width:100%; height:auto; margin:0 auto 20px; }
  :root{ --pitch-deep:#0c2a1c; --pitch:#164a30; --gold:#d9a441; --turf:#3fcf7a; --chalk:#f6f2e7; }
  *{ box-sizing:border-box; }
  body{
    margin:0; font-family:-apple-system,Segoe UI,Roboto,sans-serif;
    background:radial-gradient(circle at 15% -10%, rgba(63,207,122,0.25), transparent 55%), linear-gradient(160deg,#0c2a1c,#122f20 60%,#164a30);
    color:var(--chalk); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
  }
  .card{ background:#fff; color:#1c2a20; max-width:440px; width:100%; border-radius:12px; padding:36px 32px; box-shadow:0 20px 60px rgba(0,0,0,0.35); }
  .kicker{ color:var(--pitch); font-family:'Space Mono',monospace; font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:8px; }
  h1{ font-size:1.4rem; margin:0 0 6px; }
  .sub{ color:#666; font-size:0.92rem; margin-bottom:24px; }
  .line{ display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #eee; font-size:0.94rem; }
  .line:last-of-type{ border-bottom:none; }
  .line .label{ color:#555; }
  .line .amt{ font-weight:700; }
  .total-note{ font-size:0.78rem; color:#888; margin-top:10px; }
  button{ width:100%; margin-top:26px; padding:14px; background:var(--pitch); color:#fff; border:none; border-radius:8px; font-size:1rem; font-weight:700; cursor:pointer; transition:background .2s ease; }
  button:hover{ background:var(--pitch-deep); }
  button:disabled{ opacity:0.6; cursor:default; }
  .error, .used, .success{ text-align:center; padding:10px 0; }
  .error h1, .used h1, .success h1{ font-size:1.3rem; }
  .hidden{ display:none; }
  #loading{ text-align:center; color:#888; padding:20px 0; }
  #err-text{ color:#b5482f; font-size:0.9rem; margin-top:14px; min-height:1.2em; text-align:center; }
</style>
</head>
<body>

<div class="card">
  <img class="logo" src="${logo}" alt="RCH Elite Training">
  <div id="loading">Loading…</div>

  <div id="pay-view" class="hidden">
    <div class="kicker">RCH Elite Training</div>
    <h1>Complete your registration</h1>
    <p class="sub" id="child-sub"></p>
    <div class="line"><span class="label">Registration &amp; kit fee (one-time)</span><span class="amt" id="one-time-amt"></span></div>
    <div class="line"><span class="label">Monthly season fee</span><span class="amt" id="monthly-amt"></span></div>
    <p class="total-note" id="season-note"></p>
    <button id="payBtn">Proceed to Payment</button>
    <p id="err-text"></p>
  </div>

  <div id="used-view" class="hidden used">
    <h1>Already completed</h1>
    <p>This payment link has already been used. If you think this is a mistake, please contact RCH Elite Training directly.</p>
  </div>

  <div id="invalid-view" class="hidden error">
    <h1>Link not found</h1>
    <p>This payment link is invalid or has expired. Please contact RCH Elite Training for a new link.</p>
  </div>

  <div id="success-view" class="hidden success">
    <h1>You're all set!</h1>
    <p>Payment received — welcome to the team. A coordinator will be in touch with next steps.</p>
  </div>
</div>

<script>
  function centsToStr(c){ return '$' + (c/100).toFixed(2); }

  const parts = window.location.pathname.split('/').filter(Boolean); // ['pay', token] or ['pay', token, 'success']
  const token = parts[1];
  const isSuccess = parts[2] === 'success';

  function show(id){
    ['loading','pay-view','used-view','invalid-view','success-view'].forEach(x => {
      document.getElementById(x).classList.toggle('hidden', x !== id);
    });
  }

  async function init(){
    if (isSuccess) { show('success-view'); return; }
    try {
      const res = await fetch('/api/pay/' + token);
      if (res.status === 404) { show('invalid-view'); return; }
      const data = await res.json();
      if (data.status === 'completed') { show('used-view'); return; }

      const prettyDate = new Date(data.seasonEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

      document.getElementById('child-sub').textContent = data.programLabel + ' — ' + data.childName;
      document.getElementById('one-time-amt').textContent = centsToStr(data.oneTimeAmount);
      document.getElementById('monthly-amt').textContent = centsToStr(data.monthlyAmount) + '/mo';
      document.getElementById('season-note').textContent = 'Your monthly payment will be charged automatically each month and will end on ' + prettyDate + ' — no action needed on your part.';
      show('pay-view');
    } catch (e) {
      show('invalid-view');
    }
  }

  document.getElementById('payBtn').addEventListener('click', async () => {
    const btn = document.getElementById('payBtn');
    const errText = document.getElementById('err-text');
    errText.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Redirecting…';
    try {
      const res = await fetch('/api/pay/' + token + '/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      errText.textContent = data.error || 'Something went wrong. Please try again.';
    } catch (e) {
      errText.textContent = 'Could not reach the server. Please try again.';
    }
    btn.disabled = false;
    btn.textContent = 'Proceed to Payment';
  });

  init();
</script>
</body>
</html>
`;
