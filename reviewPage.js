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
  .sizewrap{ margin-top:6px; }
  .note{ background:#f6f2e7; border-left:4px solid #d9a441; padding:10px 12px; border-radius:6px; font-size:.9rem; margin:0 0 16px; line-height:1.45; }
  .kid{ border:1px solid #e3e3e3; border-radius:10px; padding:14px 14px 4px; margin-bottom:14px; }
  .kidname{ font-weight:700; font-size:1.05rem; margin-bottom:8px; }
  input.sz{ width:100%; padding:12px; border:1px solid #ccc; border-radius:8px; font:inherit; margin-bottom:12px; background:#fff; }
  select.sz{ width:100%; padding:12px; border:1px solid #ccc; border-radius:8px; font:inherit; margin-bottom:12px; background:#fff; }
  .size-chart{ margin:4px 0 8px; font-size:.82rem; } .size-chart summary{ cursor:pointer; text-decoration:underline; }
  .size-chart table{ width:100%; border-collapse:collapse; margin-top:8px; } .size-chart th,.size-chart td{ border:1px solid #ccc; padding:5px 8px; text-align:left; } .size-chart th{ background:#f3f3f3; } .size-chart p{ margin:6px 0 0; color:#666; }
  .anon{ margin-top:16px; }
  .anonq{ font-weight:700; margin-bottom:6px; }
  .opt{ display:flex; gap:8px; align-items:flex-start; margin:6px 0; font-weight:400; cursor:pointer; }
  .opt input{ margin-top:4px; }
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
    <div id="sizeWrap" class="sizewrap hidden">
      <div class="note">Please check each child's details below. <b>For the jersey size, base your answer on your child's current Sultans FC jersey, if they have one.</b></div>
      <div id="sizeRows"></div>
      <details class="size-chart" open><summary>Size chart</summary><table><thead><tr><th>Size</th><th>Fits</th><th>Chest (in)</th></tr></thead><tbody><tr><td>2T / 3T / 4T</td><td>Ages 1-4</td><td>26 / 28 / 30</td></tr><tr><td>Youth XS</td><td>U.S. 6/7</td><td>32</td></tr><tr><td>Youth S</td><td>U.S. 7/8</td><td>34</td></tr><tr><td>Youth M</td><td>U.S. 10/12</td><td>36</td></tr><tr><td>Youth L</td><td>U.S. 14/16</td><td>38</td></tr><tr><td>Youth XL</td><td>U.S. 18/20</td><td>40</td></tr><tr><td>Adult S</td><td></td><td>36</td></tr><tr><td>Adult M</td><td></td><td>40</td></tr><tr><td>Adult L</td><td></td><td>44</td></tr><tr><td>Adult XL</td><td></td><td>48</td></tr><tr><td>Adult 2XL / 3XL / 4XL</td><td></td><td>52 / 56 / 60</td></tr></tbody></table><p>Measure around the fullest part of the chest. Sizes are in inches.</p></details>
    </div>
    <div id="textWrap"><label for="comment" id="commentLabel">Comment</label>
    <textarea id="comment" maxlength="4000"></textarea></div>
    <div class="anon" id="anonWrap">
      <div class="anonq">How would you like to send this?</div>
      <label class="opt"><input type="radio" name="anon" value="no"> Share my name with my answer</label>
      <label class="opt"><input type="radio" name="anon" value="yes"> Stay anonymous &mdash; RCH will not see my name or email</label>
    </div>
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
  var rating = 0, kind = '', children = [];
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
    } else if (kind === 'size') {
      $('title').textContent = 'Update child information';
      $('intro').textContent = 'Please confirm the date of birth, current school grade and jersey size for ' + kids + '.';
      $('textWrap').classList.add('hidden'); $('anonWrap').classList.add('hidden');
      children = x.j.children || [];
      var opts = '<option value="">Select a size</option>' + (x.j.sizeGroups || []).map(function(g){ return '<optgroup label="' + g.label + '">' + g.sizes.map(function(s){ return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join('') + '</optgroup>'; }).join('');
      var esc = function(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
      var gl = { 'pre-k':'Pre-K', 'kindergarten':'Kindergarten', '1st-grade':'1st Grade', '2nd-grade':'2nd Grade', '3rd-grade':'3rd Grade', '4th-grade':'4th Grade', '5th-grade':'5th Grade', '6th-grade':'6th Grade' };
      $('sizeRows').innerHTML = children.map(function(c){
        var gopts = '<option value="">Select a grade</option>' + (x.j.grades || []).map(function(g){ return '<option value="' + g + '"' + (c.grade === g ? ' selected' : '') + '>' + (gl[g] || g) + '</option>'; }).join('');
        var sopts = opts.replace('value="' + c.size + '"', 'value="' + c.size + '" selected');
        return '<div class="kid"><div class="kidname">' + esc(c.name) + '</div>' +
          '<label for="dob' + c.id + '">Date of birth</label><input type="date" class="sz" id="dob' + c.id + '" value="' + esc(c.dob) + '">' +
          '<label for="gr' + c.id + '">Current school grade</label><select class="sz" id="gr' + c.id + '">' + gopts + '</select>' +
          '<label for="sz' + c.id + '">Jersey size</label><select class="sz" id="sz' + c.id + '">' + sopts + '</select></div>';
      }).join('');
      $('sizeWrap').classList.remove('hidden');
    } else {
      $('title').textContent = 'What can we change?';
      $('intro').textContent = 'We want RCH Elite Training to be the best it can be for ' + kids + ' and every family. What should we change, add, or do differently?';
      $('commentLabel').textContent = 'Your feedback';
    }
    show('form');
  }).catch(function(){ $('badText').textContent = 'Something went wrong. Please try again later.'; show('bad'); });
  $('submitBtn').addEventListener('click', function(){
    $('err').textContent = '';
    if (kind === 'size') {
      var picked = {}, missing = '';
      children.forEach(function(c){
        var v = { dob: $('dob' + c.id).value, grade: $('gr' + c.id).value, size: $('sz' + c.id).value };
        if ((!v.dob || !v.grade || !v.size) && !missing) missing = c.name;
        picked[c.id] = v;
      });
      if (missing) { $('err').textContent = 'Please fill in the date of birth, grade and jersey size for ' + missing + '.'; return; }
      var b2 = $('submitBtn'); b2.disabled = true; b2.textContent = 'Sending…';
      fetch('/api/outreach/' + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sizes: picked }) })
        .then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); })
        .then(function(x){
          if (!x.ok) { $('err').textContent = x.j.error || 'Could not send. Please try again.'; b2.disabled = false; b2.textContent = 'Submit'; return; }
          $('thanksText').textContent = 'Thank you! We received the information.'; show('thanks');
        }).catch(function(){ $('err').textContent = 'Could not send. Please try again.'; b2.disabled = false; b2.textContent = 'Submit'; });
      return;
    }
    if (kind === 'review' && !rating) { $('err').textContent = 'Please choose 1 to 5 stars.'; return; }
    var comment = $('comment').value.trim();
    if (kind === 'feedback' && !comment) { $('err').textContent = 'Please tell us what we could change.'; return; }
    var choice = document.querySelector('input[name=anon]:checked');
    if (!choice) { $('err').textContent = 'Please choose whether to share your name or stay anonymous.'; return; }
    var btn = $('submitBtn'); btn.disabled = true; btn.textContent = 'Sending…';
    fetch('/api/outreach/' + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: rating, comment: comment, anonymous: choice.value === 'yes' }) })
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
