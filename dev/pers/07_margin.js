/* ---- Phase 4a: Margin Notes (drag a finger down the left margin in Records or Insights) ----
   Faint pencil notes appear beside numbers the page really shows. Never beside weight, symptoms, check-in notes, mood,
   medication or any body measurement. Purely visual: pointer-events none, nothing is written to her records. */
const MN = { notes: [], timer: null };
const MN_FONT = '"Bradley Hand","Segoe Print","Noteworthy","Chalkboard SE","Comic Sans MS",cursive';
const MN_SAFE_LAB = ['sleep', 'protein', 'kcal', 'workoutDay', 'workoutSets', 'workoutVol'];
const MN_RECORD_OK = ['Heaviest lift', 'Biggest session', 'Longest check-in run', 'Current run', 'Longest protein-target run', 'Best protein day', 'Workout days', 'Longest training-week run'];
const WD3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function mnTopPage() { const e = Pages.stack[Pages.stack.length - 1]; return e ? e : null; }
function mnPageKind() {
  if (!PERSONALITY_ON || Voice.overlayUp() || Sheet.current) return null;
  const e = mnTopPage(); if (!e) return null;
  const t = e.opts && e.opts.title; return t === 'Records' ? 'records' : t === 'Insights' ? 'insights' : null;
}
function mnLabel(row) { const t = row.querySelector('.rtitle'); return t ? (t.childNodes[0] ? t.childNodes[0].textContent : t.textContent).trim() : ''; }
function mnLabSafe() { try { const s = labInit(); return [s.a, s.b, s.c].filter(Boolean).every(id => MN_SAFE_LAB.indexOf(id) >= 0); } catch (e) { return false; } }

function mnBiggestSets() {
  let best = null;
  Store.state.workouts.forEach(w => { const v = workoutVolume(w); if (v > 0 && (!best || v > best.v)) best = { v, w }; });
  return best ? strengthSetCount(best.w) : 0;
}
function mnSchedule() {
  const ws = Store.state.workouts; if (ws.length < 10) return null;
  const days = new Set(ws.map(w => new Date(w.dateTime).getDay()));
  if (days.size < 2 || days.size > 4) return null;
  const order = [1, 2, 3, 4, 5, 6, 0], used = order.filter(d => days.has(d)), unused = order.filter(d => !days.has(d));
  const nv = unused.indexOf(2) >= 0 ? 2 : unused[0];
  return { days: used.map(d => WD3[d]).join(', '), never: WEEKDAY_NAMES[nv] };
}
const mnPick = (arr, key) => { const ep = Eggs.st.ep, last = ep['mn' + key]; const idx = arr.map((x, i) => i).filter(i => i !== last); const i = rnd(idx.length ? idx : [0]); ep['mn' + key] = i; return arr[i]; };

/* candidates: { el, html } — one per anchor, built only from what the page is showing */
function mnCandidates(kind, body) {
  const out = [];
  const add = (el, html, w) => { if (el) out.push({ el, html, w: w || 1 }); };
  if (kind === 'records') {
    body.querySelectorAll('.list .row').forEach(row => {
      const t = row.querySelector('.rtitle'); if (!t) return;
      const label = mnLabel(row);
      if (MN_RECORD_OK.indexOf(label) < 0) return;
      const val = (row.querySelector('.rval') || {}).textContent || '', num = parseFloat(String(val).replace(',', '.')), isNew = !!row.querySelector('.badge-day');
      const anchor = row.querySelector('.rval') || row;
      if (isNew && label !== 'Workout days' && label !== 'Current run') { add(anchor, '<span class="mn-bang">!!!</span>', 3); return; }
      if (label === 'Biggest session') { const n = mnBiggestSets(); if (n >= 5) add(anchor, esc(mnPick(['{n} sets. {W}.'.replace('{n}', n).replace('{W}', numWords(n).toUpperCase()), n + ' sets. I lost count at lunch.'], 'big'))); }
      else if (label === 'Longest check-in run') { const n = Math.round(num); if (n >= 2) add(anchor, esc(mnPick(['(see: previous record holder)', n + ' days. I tried to find a gap. None. Rude.'], 'run'))); }
      else if (label === 'Heaviest lift') { if (isFinite(num)) add(anchor, '<span class="mn-star">☆</span> ' + esc(fmtW(num) + '. noted.')); }
      else if (label === 'Workout days') { const s = mnSchedule(); if (s) add(anchor, esc(s.days + '. never a ' + s.never + '. admirable. slightly suspicious.')); }
    });
  } else if (kind === 'insights' && mnLabSafe()) {
    body.querySelectorAll('.kv').forEach(kv => {
      const sp = kv.querySelector('span'), b = kv.querySelector('b'); if (!sp || !b) return;
      const label = sp.textContent.trim(), v = b.textContent;
      if (label === 'Overlapping observations') { const n = parseInt(v, 10); if (n < 15) add(b, 'needs more data. like everything.'); }
      else if (label === '95% range for r') {
        const m = v.replace(/,/g, '.').match(/(-?[\d.]+)\s*to\s*(-?[\d.]+)/);
        if (m) { const lo = parseFloat(m[1]), hi = parseFloat(m[2]); if (lo < 0 && hi > 0) add(b, 'could be a pattern. could be lunch.', 2); else if (hi - lo >= 1.0) add(b, 'wide. very wide.', 2); }
      }
    });
    body.querySelectorAll('.row').forEach(row => {
      const ld = row.querySelector('[data-lab="load"]'); if (!ld) return;
      const q = labSaved().find(x => x.id === ld.dataset.id);
      if (q && [q.cfg.a, q.cfg.b, q.cfg.c].filter(Boolean).every(id => MN_SAFE_LAB.indexOf(id) >= 0)) add(row, 're-run this next month.');
    });
  }
  /* anywhere: a crossed-out word, a plea to management, or (months later) a quiet remark */
  const okRow = e => { const row = e.closest('.row'); return !!row && MN_RECORD_OK.indexOf(mnLabel(row)) >= 0; };
  const nums = [...body.querySelectorAll('.rval, .kv b')].filter(e => !out.some(o => o.el === e) && (kind === 'records' ? okRow(e) : (mnLabSafe() && !!e.closest('.kv'))));
  if (nums.length) {
    const first = Eggs.st.ep.mnFirst, months = first && daysBetween(keyDate(first), new Date()) >= 60;
    const pool = ['<s>impressive</s> <s>adequate</s> impressive', '(please don\'t tell management)'];
    if (months) pool.push('still here. still reading.');
    add(rnd(nums), mnPick(pool, 'any'), 1);
  }
  return out;
}
function mnClear() { MN.notes.forEach(n => n.remove()); MN.notes = []; clearTimeout(MN.timer); }
function mnShow() {
  const kind = mnPageKind(); if (!kind) return false;
  const e = mnTopPage(), body = e.page.querySelector('.page-body'); if (!body) return false;
  const cands = mnCandidates(kind, body); if (!cands.length) return false;
  mnClear();
  const picks = [], pool = cands.slice();
  while (picks.length < 3 && pool.length) {
    const tot = pool.reduce((a, c) => a + c.w, 0); let r = Math.random() * tot, i = 0;
    for (; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) break; }
    const c = pool.splice(Math.min(i, pool.length - 1), 1)[0];
    if (!picks.some(p => p.el === c.el || p.el.contains(c.el) || c.el.contains(p.el))) picks.push(c);
  }
  if (getComputedStyle(body).position === 'static') body.style.position = 'relative';
  const br = body.getBoundingClientRect(), reduced = REDUCED();
  picks.forEach((c, i) => {
    const r = c.el.getBoundingClientRect(), n = document.createElement('div');
    n.className = 'mn-note'; n.setAttribute('data-notr', '1'); n.setAttribute('aria-hidden', 'true');
    n.innerHTML = c.html;
    const top = r.top - br.top + body.scrollTop + r.height + 1, right = Math.max(6, br.right - r.right);
    n.style.cssText = 'position:absolute;pointer-events:none;top:' + top + 'px;right:' + right + 'px;max-width:62%;font:italic 15.5px/1.25 ' + MN_FONT + ';transform:rotate(' + (-2.5 + i * 1.6) + 'deg);opacity:0;' + (reduced ? '' : 'transition:opacity 1.2s ease ' + (i * 0.35) + 's');
    body.appendChild(n); MN.notes.push(n);
    requestAnimationFrame(() => requestAnimationFrame(() => { n.style.opacity = '.72'; }));
  });
  if (!Eggs.st.ep.mnFirst) Eggs.st.ep.mnFirst = Voice.today();
  persDisc('margin'); Voice.spentUntil = Math.max(Voice.spentUntil, Date.now() + 1500);
  MN.timer = setTimeout(() => { MN.notes.forEach(n => { n.style.opacity = '0'; }); setTimeout(mnClear, 1400); }, 15000);
  return true;
}
/* gesture: touch (finger) and mouse (desktop); the band starts well inside the screen edge so the OS back-swipe is never touched */
(function () {
  let g = null;
  const inBand = x => x >= 24 && x <= Math.min(72, window.innerWidth * 0.18);
  const start = (x, y) => { g = (PERSONALITY_ON && inBand(x) && mnPageKind()) ? { x, y, done: false } : null; };
  const move = (x, y) => { if (!g || g.done) return; const dy = y - g.y, dx = Math.abs(x - g.x); if (dy >= 56 && dx <= dy * 0.7) { g.done = true; mnShow(); } };
  document.addEventListener('touchstart', e => { if (e.touches.length === 1) start(e.touches[0].clientX, e.touches[0].clientY); else g = null; }, { passive: true, capture: true });
  document.addEventListener('touchmove', e => { if (e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true, capture: true });
  document.addEventListener('touchend', () => { g = null; }, { passive: true, capture: true });
  document.addEventListener('mousedown', e => { if (e.button === 0) start(e.clientX, e.clientY); }, true);
  document.addEventListener('mousemove', e => { if (e.buttons & 1) move(e.clientX, e.clientY); }, true);
  document.addEventListener('mouseup', () => { g = null; }, true);
})();
