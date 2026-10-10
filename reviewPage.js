module.exports = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>RCH Elite Training — Your Feedback</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{ --pitch-deep:#0c2a1c; --pitch:#164a30; --gold:#d9a441; --chalk:#f6f2e7; }
  *{ box-sizing:border-box; }
  body{ margin:0; font-family:-apple-system,Segoe UI,Roboto,sans-serif; background:linear-gradient(160deg,#0c2a1c,#122f20 60%,#164a30); color:var(--chalk); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
  .card{ background:#fff; color:#1c2a20; max-width:480px; width:100%; border-radius:12px; padding:34px 30px; box-shadow:0 20px 60px rgba(0,0,0,.35); }
  .logo{ display:block; max-width:200px; width:100%; margin:0 auto 18px; background:var(--pitch-deep); padding:14px 18px; border-radius:8px; }
  h1{ font-size:1.35rem; margin:0 0 8px; }
  p.sub{ color:#555; font-size:.95rem; margin:0 0 20px; line-height:1.5; }
  .stars{ display:flex; gap:6px; justify-content:center; margin:6px 0 18px; }
  .stars button{ background:none; border:none; font-size:2.4rem; line-height:1; cursor:pointer; color:#cfcfcf; padding:2px; width:auto; margin:0; }
  .stars button.on{ color:var(--gold); }
  label{ display:block; font-weight:600; font-size:.85rem; margin-bottom:6px; }
  textarea{ width:100%; min-height:120px; padding:12px; border:1px solid #ccc; border-radius:8px; font:inherit; resize:vertical; }
  .go{ width:100%; margin-top:18px; padding:14px; background:var(--pitch); color:#fff; border:none; border-radius:8px; font-size:1rem; font-weight:700; cursor:pointer; }
  .go:disabled{ opacity:.6; cursor:default; }
  .err{ color:#b5482f; font-size:.88rem; margin-top:10px; min-height:1.2em; }
  .done{ text-align:center; }
  .hidden{ display:none; }
</style>
</head>
<body>
<div class="card">
  <img class="logo" src="/assets/logo.png" alt="RCH Elite Training">
  <div id="loading" class="sub">Loading…</div>
  <div id="form" class="hidden">
    <h1 id="title"></h1>
    <p class="sub" id="intro"></p>
    <div id="starsWrap" class="hidden">
      <div class="stars" id="stars" role="radiogroup" aria-label="Star rating"></div>
    </div>
    <label for="comment" id="commentLabel">Comment</label>
    <textarea id="comment" maxlength="4000"></textarea>
    <button class="go" id="submitBtn">Submit</button>
    <div class="err" id="err"></div>
  </div>
  <div id="thanks" class="done hidden">
    <h1>Thank you!</h1>
    <p class="sub" id="thanksText">We really appreciate you taking the time.</p>
  </div>
  <div id="bad" class="done hidden"><h1>Link not available</h1><p class="sub" id="badText">This link is not valid.</p></div>
</div>
<script>
(function(){
  var token = location.pathname.split('/').filter(Boolean).pop();
  var rating = 0, kind = '';
  function $(id){ return document.getElementById(id); }
  function show(id){ ['loading','form','thanks','bad'].forEach(function(x){ $(x).classList.toggle('hidden', x !== id); }); }
  function drawStars(){
    var box = $('stars'); box.innerHTML = '';
    for (var i = 1; i <= 5; i++) {
      (function(n){
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = '\\u2605'; b.setAttribute('aria-label', n + ' star' + (n > 1 ? 's' : ''));
        if (n <= rating) b.className = 'on';
        b.addEventListener('click', function(){ rating = n; drawStars(); });
        box.appendChild(b);
      })(i);
    }
  }
  fetch('/api/outreach/' + encodeURIComponent(token)).then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); }).then(function(x){
    if (!x.ok) { $('badText').textContent = x.j.error || 'This link is not valid.'; show('bad'); return; }
    if (x.j.done) { $('thanksText').textContent = 'We already received your answer. Thank you!'; show('thanks'); return; }
    kind = x.j.kind;
    var kids = x.j.childNames || 'your child';
    if (kind === 'review') {
      $('title').textContent = 'How are we doing?';
      $('intro').textContent = 'Thank you for trusting us with ' + kids + '. Please rate your experience and tell us what you think.';
      $('starsWrap').classList.remove('hidden'); drawStars();
      $('commentLabel').textContent = 'Your comment (optional)';
    } else {
      $('title').textContent = 'What can we change?';
      $('intro').textContent = 'We want RCH Elite Training to be the best it can be for ' + kids + ' and every family. What should we change, add, or do differently?';
      $('commentLabel').textContent = 'Your feedback';
    }
    show('form');
  }).catch(function(){ $('badText').textContent = 'Something went wrong. Please try again later.'; show('bad'); });
  $('submitBtn').addEventListener('click', function(){
    $('err').textContent = '';
    if (kind === 'review' && !rating) { $('err').textContent = 'Please choose 1 to 5 stars.'; return; }
    var comment = $('comment').value.trim();
    if (kind === 'feedback' && !comment) { $('err').textContent = 'Please tell us what we could change.'; return; }
    var btn = $('submitBtn'); btn.disabled = true; btn.textContent = 'Sending…';
    fetch('/api/outreach/' + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: rating, comment: comment }) })
      .then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); })
      .then(function(x){
        if (!x.ok) { $('err').textContent = x.j.error || 'Could not send. Please try again.'; btn.disabled = false; btn.textContent = 'Submit'; return; }
        show('thanks');
      }).catch(function(){ $('err').textContent = 'Could not send. Please try again.'; btn.disabled = false; btn.textContent = 'Submit'; });
  });
})();
</script>
</body>
</html>`;
