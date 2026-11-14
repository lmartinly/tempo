/* ---- Phase 2b: six Micro-Surprises (wordless except Perfect Match; nothing here is ever saved except the date it was first met) ---- */
const REDUCED = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function persDisc(id) { if (!PERSONALITY_ON) return; const d = Eggs.st.disc; if (!d[id]) { d[id] = dateKey(new Date()); Eggs.save(); } }
function fxLayer() { return Fx.ensure(); }

/* ---------- 1. Coffee Ring (Planner theme, five quick taps on an empty stretch of page) ---------- */
const Coffee = { taps: [], n: 0 };
function coffeeEmptySpot(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY) || e.target;
  if (!el || !el.closest) return null;
  if (el.closest('button,a,input,select,textarea,label,summary,svg,[data-act],[data-lab],[data-pa],[data-sens],[data-pw],[data-ts],[role="button"],.row,.chip,.sheet-wrap,.dlg-wrap,#celebrate,#story,#toasts,#fx,.pers-note,.pers-cap')) return null;
  for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return null;
  return el;
}
const COFFEE_SHAPES = [
  '<circle cx="42" cy="42" r="30" fill="none" stroke="#7a4b2a" stroke-width="3.2" stroke-dasharray="150 40"/><circle cx="42" cy="42" r="27" fill="none" stroke="#7a4b2a" stroke-width="1" opacity=".5"/>',
  '<circle cx="40" cy="42" r="30" fill="none" stroke="#7a4b2a" stroke-width="2.6"/><circle cx="46" cy="40" r="25" fill="none" stroke="#7a4b2a" stroke-width="2" opacity=".6" stroke-dasharray="120 30"/>',
  '<circle cx="42" cy="38" r="28" fill="none" stroke="#7a4b2a" stroke-width="3" stroke-dasharray="160 20"/><path d="M52 64 q2 8 0 13 q-3 1 -3 -4 z" fill="#7a4b2a" opacity=".7"/>',
  '<path d="M16 46 A28 28 0 0 1 66 28" fill="none" stroke="#7a4b2a" stroke-width="3.4" stroke-linecap="round"/><path d="M20 56 A28 28 0 0 0 60 66" fill="none" stroke="#7a4b2a" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>'
];
function coffeePlace(e, el) {
  const host = el.closest('.page-body') || document.getElementById('root'); if (!host) return;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const r = host.getBoundingClientRect(), x = e.clientX - r.left + host.scrollLeft, y = e.clientY - r.top + host.scrollTop;
  const rot = Math.round(Math.random() * 360), shape = COFFEE_SHAPES[Coffee.n % COFFEE_SHAPES.length]; Coffee.n++;
  const s = document.createElement('div');
  s.className = 'coffee-ring'; s.setAttribute('aria-hidden', 'true'); s.setAttribute('data-notr', '1');
  s.style.cssText = 'position:absolute;pointer-events:none;width:84px;height:84px;left:' + (x - 42) + 'px;top:' + (y - 42) + 'px;transform:rotate(' + rot + 'deg);opacity:0;mix-blend-mode:multiply;z-index:1;' + (REDUCED() ? '' : 'transition:opacity 1.8s ease');
  s.innerHTML = '<svg viewBox="0 0 84 84" width="84" height="84" style="filter:blur(.4px)">' + shape + '</svg>';
  host.appendChild(s);
  requestAnimationFrame(() => requestAnimationFrame(() => { s.style.opacity = '.3'; }));
  persDisc('coffee');
}
document.addEventListener('click', e => {
  try {
    if (!PERSONALITY_ON || document.documentElement.getAttribute('data-theme') !== 'planner') { Coffee.taps = []; return; }
    const el = coffeeEmptySpot(e);
    if (!el) { Coffee.taps = []; return; }
    const now = Date.now();
    Coffee.taps = Coffee.taps.filter(t => now - t.t < 3500 && Math.hypot(t.x - e.clientX, t.y - e.clientY) < 90);
    Coffee.taps.push({ t: now, x: e.clientX, y: e.clientY });
    if (Coffee.taps.length >= 5) { Coffee.taps = []; coffeePlace(e, el); }
  } catch (err) {}
}, false);

/* ---------- 2. A Day in Five Swatches (preview only: her own theme is never changed) ---------- */
const SUN_ORDER = ['classic', 'planner', 'sage', 'sunset', 'midnight'];
const Swatch = { seq: [], running: null };
function swatchWouldComplete(id) {
  const q = Swatch.seq.concat([{ id, t: Date.now() }]).slice(-5);
  return q.length === 5 && q.every((x, i) => x.id === SUN_ORDER[i]) && (q[4].t - q[0].t) <= 10000;
}
function swatchRun(orig) {
  const fx = fxLayer(), reduced = REDUCED();
  if (Swatch.running) Swatch.running.cancel(false);
  const el = document.createElement('div');
  el.className = 'sw-day' + (reduced ? ' sw-reduced' : '');
  el.setAttribute('data-notr', '1');
  const cols = SUN_ORDER.map(id => (THEMES.find(t => t.id === id) || THEMES[0]));
  const meta = document.querySelector('meta[name="theme-color"]');
  let timers = [];
  if (reduced) {
    el.innerHTML = '';
    fx.appendChild(el);
    cols.forEach((t, i) => timers.push(setTimeout(() => { el.style.backgroundColor = t.color; el.style.opacity = '.55'; if (meta) meta.setAttribute('content', t.color); }, i * 400)));
    timers.push(setTimeout(() => finish(true), 2000));
  } else {
    const grad = 'linear-gradient(100deg,' + cols.map((t, i) => t.sw[0] + ' ' + (i * 20) + '%, ' + t.sw[2] + ' ' + (i * 20 + 10) + '%').join(',') + ')';
    let stars = ''; for (let i = 0; i < 14; i++) stars += '<i style="left:' + (6 + Math.round(Math.random() * 88)) + '%;top:' + (4 + Math.round(Math.random() * 40)) + '%;animation-delay:' + (3000 + i * 60) + 'ms"></i>';
    el.innerHTML = '<div class="sw-band" style="background:' + grad + '"></div><div class="sw-sun"></div><div class="sw-glow"></div><div class="sw-stars">' + stars + '</div><div class="sw-shoot"></div>';
    fx.appendChild(el);
    cols.forEach((t, i) => timers.push(setTimeout(() => { if (meta) meta.setAttribute('content', t.color); }, i * 900)));
    timers.push(setTimeout(() => finish(true), 5200));
  }
  function finish(restore) {
    timers.forEach(clearTimeout); timers = [];
    el.remove(); Swatch.running = null;
    applyTheme();                                              /* theme-color + data-theme back to what settings say */
    if (restore && orig && (Store.state.settings.theme || 'classic') !== orig) Actions.patchSettings({ theme: orig });   /* her own theme comes back, silently */
  }
  Swatch.running = { cancel: restore => finish(!!restore) };
  persDisc('swatches');
}
(function () {
  const o = Handlers['set-theme'];
  Handlers['set-theme'] = function (el) {
    const id = el.dataset.themeId, prev = Store.state.settings.theme || 'classic';
    if (Swatch.running) Swatch.running.cancel(false);          /* a new choice always wins over the animation */
    const hit = PERSONALITY_ON && swatchWouldComplete(id);
    const r = o.apply(this, arguments);
    if (PERSONALITY_ON) {
      const now = Date.now();
      Swatch.seq = Swatch.seq.filter(x => now - x.t < 10000);
      if (!Swatch.seq.length) Swatch.first = prev;
      Swatch.seq.push({ id, t: now });
      Swatch.seq = Swatch.seq.slice(-5);
      if (hit) { const orig = Swatch.first; Swatch.seq = []; setTimeout(() => swatchRun(orig), 350); }
    }
    return r;
  };
})();

/* ---------- 3. Twin Numbers (saved workout details only) ---------- */
function twinDecorate(root) {
  if (!PERSONALITY_ON || !root) return;
  root.querySelectorAll('.kv b').forEach(b => {
    const walker = document.createTreeWalker(b, 4, null); const nodes = []; let n; while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(tn => {
      const re = /(^|[^\d,.])(\d+(?:[.,]\d+)?)×(\d+(?:[.,]\d+)?)(?![\d])/g, txt = tn.textContent;
      let m, last = 0, frag = null;
      while ((m = re.exec(txt))) {
        if (m[2] !== m[3]) continue;
        frag = frag || document.createDocumentFragment();
        const start = m.index + m[1].length;
        frag.appendChild(document.createTextNode(txt.slice(last, start)));
        const sp = document.createElement('span'); sp.className = 'twin'; sp.setAttribute('data-notr', '1');
        sp.innerHTML = '<i>' + m[2] + '</i>×<i>' + m[3] + '</i>';
        frag.appendChild(sp); last = start + m[2].length + 1 + m[3].length;
      }
      if (frag) { frag.appendChild(document.createTextNode(txt.slice(last))); tn.parentNode.replaceChild(frag, tn); }
    });
  });
}
document.addEventListener('click', e => {
  try {
    const sp = e.target.closest && e.target.closest('.twin'); if (!sp || sp.classList.contains('hop')) return;
    persDisc('twins');
    sp.classList.add('hop'); setTimeout(() => sp.classList.remove('hop'), 900);
  } catch (err) {}
}, false);
const _openWorkoutDetailSheet = openWorkoutDetailSheet;
openWorkoutDetailSheet = function () {
  const r = _openWorkoutDetailSheet.apply(this, arguments);
  if (PERSONALITY_ON) setTimeout(() => { try { twinDecorate(Sheet.current && Sheet.current.el ? Sheet.current.el : document.querySelector('.sheet-wrap')); } catch (e) {} }, 60);
  return r;
};

/* ---------- 4. The Wave (Heatmap legend, lightest to darkest) ---------- */
const Wave = { seq: [] };
document.addEventListener('click', e => {
  try {
    if (!PERSONALITY_ON) return;
    const sq = e.target.closest && e.target.closest('.heat-legend i.hc'); if (!sq) { return; }
    const lv = ['l0', 'l1', 'l2', 'l3', 'l4'].findIndex(c => sq.classList.contains(c)); if (lv < 0) return;
    const now = Date.now(); if (Wave.seq.length && now - Wave.seq[0].t > 10000) Wave.seq = [];
    if (lv === Wave.seq.length) Wave.seq.push({ lv, t: now }); else Wave.seq = lv === 0 ? [{ lv, t: now }] : [];
    if (Wave.seq.length === 5) { Wave.seq = []; waveRun(); }
  } catch (err) {}
}, false);
function waveRun() {
  const grid = document.querySelector('.heat-grid'); if (!grid) return;
  persDisc('wave');
  const trained = new Set(workoutDayKeys());
  let big = null, bv = 0; Store.state.workouts.forEach(w => { const v = workoutVolume(w); if (v > bv) { bv = v; big = dateKey(w.dateTime); } });
  const cols = [...grid.querySelectorAll('.heat-col')], reduced = REDUCED();
  cols.forEach((col, i) => {
    [...col.querySelectorAll('.hc:not(.off)')].forEach(c => {
      const warm = trained.has(c.dataset.k), isBig = c.dataset.k === big;
      const cls = reduced ? (warm ? 'wv-still' : null) : ('wv' + (warm ? ' wv-warm' : '') + (isBig ? ' wv-big' : ''));
      if (!cls) return;
      const delay = reduced ? 0 : i * 45;
      c.style.animationDelay = delay + 'ms';
      cls.split(' ').forEach(k => c.classList.add(k));
      setTimeout(() => { cls.split(' ').forEach(k => c.classList.remove(k)); c.style.animationDelay = ''; }, delay + (isBig ? 2600 : 1500));
    });
  });
}

/* ---------- 5. The Cat of the 13th (the date alone decides; nothing she logged matters) ---------- */
const CAT_SVG = '<svg viewBox="0 0 26 24" width="26" height="24" aria-hidden="true"><path class="cat-tail" d="M19 20 C25 20 26 12 22 11" fill="none" stroke="#14110f" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="13" cy="17" rx="7.5" ry="5.6" fill="#14110f"/><g class="cat-head"><circle cx="11" cy="9.5" r="5" fill="#14110f"/><path d="M6.6 6.6 L7.4 1.8 L10.6 5Z M11.6 5 L14.8 1.8 L15.4 6.4Z" fill="#14110f"/><g class="cat-eyes"><ellipse cx="9.2" cy="9.4" rx="1.1" ry="1.3" fill="#d6cf4a"/><ellipse cx="12.9" cy="9.4" rx="1.1" ry="1.3" fill="#d6cf4a"/></g></g><ellipse class="cat-paw" cx="7.6" cy="21.6" rx="2" ry="1.3" fill="#14110f"/></svg>';
const CAT_MOVES = ['trot', 'wash', 'stare', 'nudge', 'sleep', 'header'];
const CatSession = {};                                            /* date key -> behaviour for this calendar session */
function persCatHtml(c, k) {
  if (!PERSONALITY_ON || !c || c.getDay() !== 5 || c.getDate() !== 13) return '';
  let mv = CatSession[k];
  if (!mv) {
    const st = Eggs.st; st.cnt.cat = (st.cnt.cat || 0) + 1;
    if (st.cnt.cat === 1) mv = 'first';
    else { const pool = CAT_MOVES.filter(x => x !== st.ep.catLast); mv = pool[Math.floor(Math.random() * pool.length)]; }
    st.ep.catLast = mv; CatSession[k] = mv; persDisc('cat'); Eggs.save();
  }
  setTimeout(persCatAfterRender, 80);
  return '<span class="cal-cat cat-' + mv + '" data-notr data-mv="' + mv + '">' + CAT_SVG + '</span>';
}
function persCatAfterRender() {
  if (!PERSONALITY_ON) return;
  document.querySelectorAll('.cal-cat[data-mv="header"]').forEach(cat => {
    if (cat.dataset.placed) return; cat.dataset.placed = '1';
    const cell = cat.closest('.cal-cell'), hd = cell && cell.parentNode.querySelectorAll('.cal-dow')[4];
    if (!cell || !hd) return;
    const a = cell.getBoundingClientRect(), b = hd.getBoundingClientRect();
    cat.style.setProperty('--cdx', (b.left + b.width / 2 - a.left - a.width / 2) + 'px');
    cat.style.setProperty('--cdy', (b.top - a.top - 4) + 'px');
  });
}

/* ---------- 6. Perfect Match (the same variable on both sides of the Lab, three times) ---------- */
const Match = { was: false };
function persLabSame(s) {
  if (!PERSONALITY_ON) return;
  if (Match.was) return;                                          /* still the same selection: not another time */
  Match.was = true;
  const st = Eggs.st; st.cnt.pm = (st.cnt.pm || 0) + 1; Eggs.save();
  if (st.cnt.pm >= 3 && !st.disc.match) setTimeout(() => matchCard(s), 160);
}
function persLabDiff() { Match.was = false; }
function matchCard(s) {
  if (document.getElementById('pm-card')) return;
  const nm = esc(labVarName(s.a, s.gran));
  const el = document.createElement('div'); el.id = 'pm-card'; el.setAttribute('data-notr', '1');
  let hearts = ''; for (let i = 0; i < 12; i++) hearts += '<i class="pm-h" style="left:' + (4 + i * 8) + '%;animation-delay:' + (i * 0.35).toFixed(2) + 's">♥</i>';
  el.innerHTML = hearts + '<div class="pm-in"><div class="pm-pair"><div class="pm-c">' + nm + '</div><div class="pm-c">' + nm + '</div></div>' +
    '<div class="pm-t">It\'s a match!</div><div class="pm-s">' + nm + ' and ' + nm + '</div>' +
    '<div class="pm-p">Compatibility: 100%. Shared interests: everything. Dealbreakers: none.</div>' +
    '<button class="btn btn-primary" id="pm-back" style="margin-top:22px">Back to serious statistics</button></div>';
  document.body.appendChild(el);
  persDisc('match');
  $('#pm-back', el).addEventListener('click', () => el.remove());
}
