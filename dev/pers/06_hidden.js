/* ---- Phase 3b: Tired Logo, Also Considered, Sixth Beam, Campsite, Archive of Small Things ---- */
const logoSrc = () => (document.querySelector('link[rel="apple-touch-icon"]') || { href: '' }).href;
const rnd = a => a[Math.floor(Math.random() * a.length)];
function fxAdd(el, ms) { const fx = fxLayer(); fx.appendChild(el); if (ms) setTimeout(() => el.remove(), ms); return el; }

/* ---------- 1. The Tired Logo (seven taps on seven... on different days) ---------- */
const TL_LINES = {
  2: ['Hello, you. Again.', 'Hello, you. I was just getting comfortable.', 'Hello, you. Do you do this to the other apps?'],
  3: ["Seven taps. I counted every one, and I'm not sure why you'd come back for more.", 'Is there something on my face? Besides the logo.', "This is technically my job. It's still a lot."],
  4: ['Fine. Over here, then.', "I moved. You followed. We're both committed now.", null]
};
const TL_FINAL = "Okay, you win. Since you've earned it: thanks for using me. Genuinely. Now let me lie here a minute.";
const TL_GREETING = { emoji: '🫧', kicker: 'Psst', title: 'Hello, you.', sub: 'A few small things hide around Tempo. This was one of them.' };
let tlTaps = [];

function tlBubble(text) {
  if (!text) return;
  const b = document.createElement('div');
  b.className = 'tl-bubble'; b.setAttribute('data-notr', '1'); b.textContent = text;
  fxAdd(b, 5600);
  requestAnimationFrame(() => b.classList.add('in'));
  setTimeout(() => b.classList.remove('in'), 4800);
  Voice.spentUntil = Date.now() + 1500;
}
function tlLogo() { return document.querySelector('#dash-topbar .logo-wrap') || document.querySelector('.logo-wrap'); }
function tlPickLine(visit) {
  const pool = TL_LINES[visit], ep = Eggs.st.ep, last = ep['tl' + visit];
  const idx = pool.map((x, i) => i).filter(i => i !== last);
  const i = rnd(idx); ep['tl' + visit] = i; Eggs.save();
  return pool[i];
}
function tlMove(visit) {
  const el = tlLogo(); if (!el) return;
  if (REDUCED()) return;
  const title = el.parentElement, bar = title && title.parentElement;
  const dx = bar ? Math.max(40, bar.getBoundingClientRect().right - el.getBoundingClientRect().right - 70) : 120;
  if (visit === 2) el.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg)', offset: .55 }, { transform: 'rotate(0)' }], { duration: 1600, easing: 'ease-in-out' });
  else if (visit === 3) el.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(4px) rotate(-8deg)', offset: .3 }, { transform: 'translateY(4px) rotate(-8deg)', offset: .75 }, { transform: 'translateY(0) rotate(0)' }], { duration: 3600, easing: 'ease-in-out' });
  else if (visit === 4) {
    const behind = Math.random() < .25, span = behind ? Math.max(30, (title.querySelector('span') || { offsetWidth: 50 }).offsetWidth * .7) : dx;
    const prevZ = el.style.zIndex, t = title.querySelector('span');
    if (behind && t) { t.style.position = 'relative'; t.style.zIndex = '2'; el.style.zIndex = '0'; }
    const a = el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + span + 'px)', offset: .22 }, { transform: 'translateX(' + span + 'px)', offset: .7 }, { transform: 'translateX(0)' }], { duration: 4200, easing: 'ease-in-out' });
    a.onfinish = a.oncancel = () => { el.style.zIndex = prevZ; if (t) { t.style.position = ''; t.style.zIndex = ''; } };
  }
}
function tlSleepTalk() {
  const st = Eggs.st, d = st.disc, ep = st.ep, today = Voice.today();
  const pool = ['...no, the other treadmill...', "...it was a Friday. It's always a Friday..."];
  if (d.cat) pool.push('...put the cat back on the calendar...');
  if (d.visitor) pool.push('...not on the keyboard...');
  if (d.review) pool.push("...the review isn't finished...");
  if (d.beam2) pool.push('...is it morning?');
  const thanksOk = !ep.thanksAt || daysBetween(keyDate(ep.thanksAt), keyDate(today)) >= 7;
  if (Math.random() < .28) {
    if (thanksOk && Math.random() < .12) { ep.thanksAt = today; Eggs.save(); return '...thanks for coming today.'; }
    return rnd(pool);
  }
  return '';
}
function tlScene(sincere) {
  const old = document.querySelector('.tl-scene'); if (old) old.remove();
  const talk = sincere ? '' : tlSleepTalk(), blanket = !!Eggs.st.disc.camp && Math.random() < .3;
  const s = document.createElement('div');
  s.className = 'tl-scene' + (REDUCED() ? ' still' : '') + (blanket ? ' blanket' : '');
  s.setAttribute('data-notr', '1'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = '<div class="tl-panel"><div class="tl-lg"><img src="' + esc(logoSrc()) + '" alt=""><i class="tl-bl"></i></div><span class="tl-z z1">z</span><span class="tl-z z2">z</span><span class="tl-z z3">Z</span>' +
    (sincere ? '<div class="tl-say">' + esc(TL_FINAL) + '</div>' : (talk ? '<div class="tl-talk">' + esc(talk) + '</div>' : '')) + '</div>';
  fxAdd(s);
  requestAnimationFrame(() => s.classList.add('in'));
  const ms = sincere ? 7600 : 4800;
  const close = () => { s.classList.remove('in'); setTimeout(() => s.remove(), 700); document.removeEventListener('pointerdown', onTap, true); clearTimeout(tm); };
  const onTap = () => close();
  const tm = setTimeout(close, ms);
  setTimeout(() => document.addEventListener('pointerdown', onTap, true), 400);
  persDisc('logo'); Voice.spentUntil = Date.now() + 1500;
}
function tlVisit() {
  const st = Eggs.st, today = Voice.today();
  let n;
  if (st.ep.logoDay === today && st.logo >= 1) n = st.logo;
  else { st.logo++; st.ep.logoDay = today; n = st.logo; }
  Eggs.save();
  if (n === 1) { Celebrate.show([TL_GREETING]); return; }
  if (n <= 4) { tlMove(n); const l = tlPickLine(n); if (l) tlBubble(l); return; }
  const first = !st.ep.logoSincere;
  if (first) { st.ep.logoSincere = 1; Eggs.save(); }
  tlScene(first);
}
logoTap = function () {
  if (!PERSONALITY_ON) { const t = Date.now(); logoTaps = logoTaps.filter(x => t - x < 2500); logoTaps.push(t); if (logoTaps.length >= 7) { logoTaps = []; Celebrate.show([TL_GREETING]); } return; }
  const t = Date.now(); tlTaps = tlTaps.filter(x => t - x < 2500); tlTaps.push(t);
  if (tlTaps.length >= 7) { tlTaps = []; tlVisit(); }
};

/* ---------- 3. Also Considered (Week / Month Wrapped: tap the persona emoji three times) ---------- */
const AC_REASONS = {
  'Steady State': ["Qualified, as it always does. It's the fallback, and nobody cheers for the fallback.", 'Showed up by default and left by default.'],
  'Full Ledger': ["Six days out of seven. {Day} left a blank, and I'm not saying whose fault that is.", "One day short of perfect. I've been thinking about it all afternoon."],
  'Target Practice': ['Needed {need} days at your target and got {have}. I counted twice.', 'Close enough to hear it, not close enough to count.'],
  'Floor Time': ['Two training days. It needed three, and it took the news badly.', 'Missed the cutoff by one session and has gone to sit in the car.'],
  'Strong Finish': ['Needed the weekend to beat the weekdays by 15 percent. It managed {x}. A good finish, just not that good.'],
  'Deep Reserve': ['Needed an average of 8:00. You averaged {hm}. {m} minutes. I can see the finish line from here.'],
  'Personal Best': ["Lost to week {n}, which I'm told was something."],
  'Tape Week': ['Qualified because you measured, then lost on seniority. Rules are rules, even the unfair ones.'],
  'Airplane Mode': ['Hoped for a quiet week. You gave it {n} check-ins and ruined everything.'],
  'Long Game': ['Needed 85 percent of the days, got {x}. Mathematically out, emotionally close.']
};
function persAlt(slide, persona, st, scope, ctx) {
  if (slide && persona) slide._pa = { persona, st, scope, ctx: ctx || {} };
  return slide;
}
function acRunners(pa) {
  const st = pa.st, scope = pa.scope, prior = pa.ctx.prior || [], target = +Store.state.settings.proteinTarget || 0;
  const cand = personaList(st, Object.assign({ scope }, pa.ctx)).map(p => p.name);
  const win = pa.persona.name, have = new Set(cand), out = [];
  const ret = (name, vars) => out.push({ name, vars: vars || {} });
  const hm = h => { const m = Math.round(h * 60); return Math.floor(m / 60) + ':' + pad2(m % 60); };
  /* rule true, ranked lower */
  ['Steady State', 'Tape Week'].forEach(n => { if (have.has(n) && n !== win && (n !== 'Tape Week' || scope === 'week')) ret(n); });
  /* missed by a small margin (the real rule is quoted in the reason) */
  const near = [];
  if (scope === 'week') {
    if (st.ciDays === 6 && !have.has('Full Ledger')) { const miss = st.keys.find(k => !st.cis.some(c => c.dateKey === k)); near.push(['Full Ledger', { Day: miss ? WEEKDAY_NAMES[keyDate(miss).getDay()] : 'one day' }]); }
    if (target > 0 && st.proteinN >= 4 && !have.has('Target Practice')) { const need = Math.ceil(st.proteinN * .8); if (need - st.proteinDaysHit === 1) near.push(['Target Practice', { need: String(need), have: String(st.proteinDaysHit) }]); }
    if (trainingDays(st) === 2 && !have.has('Floor Time')) near.push(['Floor Time', {}]);
    if (st.proteinEarly != null && !have.has('Strong Finish') && st.proteinLate > st.proteinEarly * 1.05) near.push(['Strong Finish', { x: Math.round((st.proteinLate / st.proteinEarly - 1) * 100) + ' percent' }]);
    if (st.sleepN >= 4 && st.sleep < 8 && st.sleep >= 7.5 && !have.has('Deep Reserve')) near.push(['Deep Reserve', { hm: hm(st.sleep), m: String(Math.round((8 - st.sleep) * 60)) }]);
    if (st.proteinN >= 3 && prior.length) {
      const pp = prior.map((p, i) => ({ v: p.proteinN >= 3 ? p.protein : null, i })).filter(x => x.v != null);
      if (pp.length >= 2) { const b = pp.reduce((m, x) => x.v > m.v ? x : m); if (st.protein <= b.v && st.protein >= b.v * .9 && !have.has('Personal Best')) near.push(['Personal Best', { n: String(b.i + 1) }]); }
    }
    if (st.ciDays === 3 && !st.meas.length && !have.has('Airplane Mode')) near.push(['Airplane Mode', { n: '3' }]);
  } else if (scope === 'month') {
    const pct = st.n ? st.ciDays / st.n : 0;
    if (pct < .85 && pct >= .7 && !have.has('Long Game')) near.push(['Long Game', { x: Math.round(pct * 100) + ' percent' }]);
  }
  near.forEach(x => { if (x[0] !== win) ret(x[0], x[1]); });
  return out.filter(r => r.name !== win && AC_REASONS[r.name]).slice(0, 2);
}
function acReason(r) {
  const ep = Eggs.st.ep, key = 'ac' + r.name, pool = AC_REASONS[r.name], vars = r.vars;
  let ok = pool.map((t, i) => i).filter(i => Voice.fill(pool[i], vars).indexOf('{') < 0);
  if (!ok.length) ok = [0];
  const last = ep[key], nxt = ok.find(i => i > (last == null ? -1 : last)) != null ? ok.find(i => i > (last == null ? -1 : last)) : ok[0];
  ep[key] = nxt; return Voice.fill(pool[nxt], vars);
}
function acHtml(sl) {
  const run = acRunners(sl._pa);
  let h = '<div class="ac-h">Also considered:</div>';
  if (!run.length) h += '<div class="ac-i">No runners-up this ' + (sl._pa.scope === 'month' ? 'month' : 'week') + ". The winner didn't beat the field. It walked in unopposed.</div>";
  else run.forEach(r => { h += '<div class="ac-i"><b>' + esc(r.name) + '</b><span>' + esc(acReason(r)) + '</span></div>'; });
  Eggs.save();
  return h;
}
const _storyRender = Story.render;
Story.render = function () {
  _storyRender.apply(this, arguments);
  try {
    if (!PERSONALITY_ON || !this.el) return;
    const sl = this.slides[this.i]; if (!sl || !sl._pa) return;
    const card = this.el.querySelector('.st-card'), em = card && card.querySelector('.st-emoji'); if (!em) return;
    em.classList.add('ac-em');
    if (sl._flip) {
      card.classList.add('ac-flip');
      const taps = card.querySelectorAll('.st-tap');
      card.innerHTML = '<div class="st-emoji ac-em">' + sl.emoji + '</div><div class="ac-card" data-notr>' + sl._flipHtml + '</div>';
      taps.forEach(t => card.appendChild(t));
      card.querySelector('.st-emoji').addEventListener('click', () => acTap(sl, true));
    } else em.addEventListener('click', () => acTap(sl, false));
  } catch (e) {}
};
function acTap(sl, flipped) {
  const t = Date.now(); sl._taps = (sl._taps || []).filter(x => t - x < 3000); sl._taps.push(t);
  if (flipped) { sl._flip = false; sl._taps = []; Story.render(); return; }
  if (sl._taps.length >= 3) { sl._taps = []; sl._flip = true; sl._flipHtml = acHtml(sl); Story.render(); }
}

/* ---------- 4. The Sixth Beam (PRISM: seven taps on the prism's apex) ---------- */
const Beam = { taps: [], stage: 0 };
const _prismWorldSVG = prismWorldSVG;
prismWorldSVG = function (s, hub) {
  let svg = _prismWorldSVG.apply(this, arguments);
  if (!PERSONALITY_ON) return svg;
  let extra = '<circle class="pb-apex" cx="180" cy="58" r="17" fill="transparent" style="cursor:default"/>';
  if (hub && Camp.shown) extra += campSVG();
  return svg.replace('</svg>', extra + '</svg>');
};
function recordFirstKey() { return trackingStartKey(); }
function beamDate(k) { const d = keyDate(k); return MONTH_LONG[d.getMonth()] + ' ' + d.getDate(); }
function beamRun(svg) {
  const first = recordFirstKey(); if (!first) return;
  const NS = 'http://www.w3.org/2000/svg', today = dateKey(new Date()), made = String(Store.state.meta.createdAt || '').slice(0, 10);
  const span = Math.max(1, daysBetween(keyDate(first), keyDate(today)));
  const xOf = k => 28 + 304 * Math.min(1, Math.max(0, daysBetween(keyDate(first), keyDate(k)) / span));
  const same = !made || made <= first;
  const old = svg.querySelector('.pb-beam'); if (old) old.remove();
  const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'pb-beam');
  g.innerHTML = '<line x1="24" y1="284" x2="336" y2="284" stroke="#F1E9DC" stroke-opacity=".16"/>' +
    '<path class="pb-ray" d="M180 56 C 170 150, 90 230, 28 284" fill="none" stroke="#F1E9DC" stroke-opacity=".30" stroke-width="1.1"/>' +
    '<circle class="pb-d1" cx="28" cy="284" r="3.4" fill="#F1E9DC" fill-opacity=".85"/><circle class="pb-hit1" cx="28" cy="284" r="15" fill="transparent"/>';
  svg.appendChild(g);
  let cap = svg.parentElement.querySelector('.pb-cap');
  if (!cap) { cap = document.createElement('div'); cap.className = 'pb-cap'; cap.setAttribute('data-notr', '1'); svg.parentElement.appendChild(cap); }
  const first_line = same ? 'Day one. I was here for all of it.' : "The record starts here. I wasn't around yet, but I've read it.";
  cap.innerHTML = '<div class="pb-date">' + esc(beamDate(first)) + '</div><div class="pb-l1">' + esc(first_line) + '</div>';
  persDisc('beam'); Beam.stage = 1; Voice.spentUntil = Date.now() + 1500;
  if (same) return;
  const hit = g.querySelector('.pb-hit1');
  hit.addEventListener('click', function second() {
    if (Beam.stage !== 1) return; Beam.stage = 2; hit.removeEventListener('click', second);
    const x2 = xOf(made);
    const rn = document.createElementNS(NS, 'path'); rn.setAttribute('class', 'pb-ray2');
    rn.setAttribute('d', 'M28 284 L' + x2 + ' 284'); rn.setAttribute('stroke', '#F1E9DC'); rn.setAttribute('stroke-opacity', '.45'); rn.setAttribute('fill', 'none');
    const d2 = document.createElementNS(NS, 'circle'); d2.setAttribute('class', 'pb-d2'); d2.setAttribute('cx', x2); d2.setAttribute('cy', 284); d2.setAttribute('r', 3.4); d2.setAttribute('fill', '#F1E9DC');
    g.appendChild(rn); g.appendChild(d2);
    const talk = Eggs.st.disc.logo ? '<div class="pb-sleep">...is it morning?</div>' : '';
    setTimeout(() => {
      cap.innerHTML += '<div class="pb-date">' + esc(beamDate(made)) + '</div><div class="pb-l1 pb-l2">And this is where I was set up.</div>' + talk;
      beamGlow(); persDisc('beam2');
    }, REDUCED() ? 0 : 900);
  });
}
function beamGlow() {
  /* the app's own header is covered by the Play page, so the logo glows beside the page title as well */
  const els = [];
  const tb = document.querySelector('.page.in .topbar .title') || document.querySelector('.page .topbar .title');
  if (tb) { const i = document.createElement('img'); i.src = logoSrc(); i.alt = ''; i.className = 'pb-glow'; i.setAttribute('data-notr', '1'); tb.insertBefore(i, tb.firstChild); els.push(i); }
  const lg = tlLogo(); if (lg) { lg.classList.add('pb-glowing'); els.push(lg); }
  setTimeout(() => els.forEach(e => { if (e.tagName === 'IMG') e.remove(); else e.classList.remove('pb-glowing'); }), 3200);
}
document.addEventListener('click', e => {
  try {
    if (!PERSONALITY_ON) return;
    const ap = e.target.closest && e.target.closest('.pb-apex'); if (!ap) { return; }
    const t = Date.now(); Beam.taps = Beam.taps.filter(x => t - x < 6000); Beam.taps.push(t);
    if (Beam.taps.length >= 7) { Beam.taps = []; beamRun(ap.closest('svg')); }
  } catch (err) {}
}, false);

/* ---------- 5. The Campsite (Tempo Play, opened while offline) ---------- */
const Camp = { shown: false, night: null, entry: null };
function moonPhase() { const d = (Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000; return ((d % 29.530588) + 29.530588) % 29.530588 / 29.530588; }
function campNight() {
  const r = Math.random();
  if (r < .07) return { empty: true };
  if (r < .07 + .31) return { quiet: true, fire: 'steady', tent: 'shut' };
  return { fire: rnd(['steady', 'pop', 'smoke', 'ember']), tent: rnd(['open', 'shut', 'lantern']), item: rnd([null, 'boots', 'kettle', 'mug', 'chair']), sky: rnd(['star', 'clouds', 'flies', 'moon']) };
}
function campSVG() {
  const n = Camp.night || (Camp.night = campNight()), still = REDUCED();
  const moon = (() => { const p = moonPhase(), cx = 322, cy = 34, R = 11, k = Math.cos(p * 2 * Math.PI), rx = Math.abs(k) * R, waxing = p < .5;
    const lit = 'M' + cx + ' ' + (cy - R) + ' A' + R + ' ' + R + ' 0 0 ' + (waxing ? 1 : 0) + ' ' + cx + ' ' + (cy + R) + ' A' + rx.toFixed(2) + ' ' + R + ' 0 0 ' + ((k > 0) === waxing ? 0 : 1) + ' ' + cx + ' ' + (cy - R) + ' Z';
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#3a2f52" fill-opacity=".8"/><path d="' + lit + '" fill="#F1E9DC" fill-opacity=".85"/>'; })();
  let g = '<g class="pb-camp' + (still ? ' still' : '') + '" data-notr="1" pointer-events="none">';
  const out = n.empty;
  const sky = n.empty || n.quiet ? '' : ({
    star: '<line class="cp-star" x1="40" y1="30" x2="22" y2="38" stroke="#F1E9DC" stroke-width="1.2" stroke-linecap="round"/>',
    clouds: '<ellipse class="cp-cl" cx="90" cy="40" rx="30" ry="6" fill="#F1E9DC" fill-opacity=".07"/><ellipse class="cp-cl cp-cl2" cx="250" cy="24" rx="26" ry="5" fill="#F1E9DC" fill-opacity=".06"/>',
    flies: [0, 1, 2, 3].map(i => '<circle class="cp-fl cp-fl' + i + '" cx="' + (60 + i * 22) + '" cy="' + (236 - i * 6) + '" r="1.5" fill="#E9D98C"/>').join(''),
    moon: moon })[n.sky] || '';
  g += sky;
  /* tent */
  const tent = '<polygon points="22,284 52,236 82,284" fill="#6b5a86" stroke="#F1E9DC" stroke-opacity=".35"/>' +
    (n.tent === 'open' ? '<polygon points="52,236 42,284 62,284" fill="#241631"/>' : n.tent === 'lantern' ? '<polygon points="52,236 44,284 60,284" fill="#E9B96A" class="cp-lamp"/>' : '<line x1="52" y1="236" x2="52" y2="284" stroke="#F1E9DC" stroke-opacity=".4"/>');
  g += tent;
  /* fire */
  const fx = 112, fy = 284;
  if (out) g += '<circle cx="' + fx + '" cy="' + (fy - 2) + '" r="3" fill="#D9743A" fill-opacity=".55"/><circle cx="' + (fx + 7) + '" cy="' + (fy - 1) + '" r="2" fill="#D9743A" fill-opacity=".4"/>';
  else {
    const fl = '<path class="cp-fire" d="M' + (fx - 8) + ' ' + fy + ' Q' + (fx - 6) + ' ' + (fy - 14) + ' ' + fx + ' ' + (fy - 22) + ' Q' + (fx + 6) + ' ' + (fy - 14) + ' ' + (fx + 8) + ' ' + fy + ' Z" fill="#E98B3C"/><path class="cp-fire cp-in" d="M' + (fx - 4) + ' ' + fy + ' Q' + fx + ' ' + (fy - 12) + ' ' + (fx + 4) + ' ' + fy + ' Z" fill="#F6D27A"/>';
    g += '<line x1="' + (fx - 10) + '" y1="' + (fy + 1) + '" x2="' + (fx + 10) + '" y2="' + (fy - 1) + '" stroke="#5b3b25" stroke-width="2.4"/>';
    if (n.fire === 'ember') g += '<circle class="cp-ember" cx="' + fx + '" cy="' + (fy - 3) + '" r="3.4" fill="#E0642A"/>';
    else g += fl;
    if (n.fire === 'pop') g += [0, 1, 2].map(i => '<circle class="cp-spark cp-s' + i + '" cx="' + (fx - 4 + i * 4) + '" cy="' + (fy - 22) + '" r="1.1" fill="#F6D27A"/>').join('');
    if (n.fire === 'smoke') g += '<path class="cp-smoke" d="M' + fx + ' ' + (fy - 24) + ' q-8 -10 2 -18 q10 -8 -4 -18" fill="none" stroke="#F1E9DC" stroke-opacity=".25" stroke-width="2" stroke-linecap="round"/>';
  }
  if (n.item) g += ({
    boots: '<g class="cp-item"><rect x="86" y="276" width="6" height="8" rx="2" fill="#8a6a4a"/><rect x="94" y="276" width="6" height="8" rx="2" fill="#8a6a4a"/></g>',
    kettle: '<g class="cp-item"><path d="M' + (fx - 7) + ' ' + (fy - 8) + ' h14 l-2 -8 h-10 z" fill="#9aa2ad"/><path d="M' + (fx + 6) + ' ' + (fy - 14) + ' h5" stroke="#9aa2ad" stroke-width="1.6"/></g>',
    mug: '<g class="cp-item"><rect x="132" y="274" width="9" height="10" rx="2" fill="#E3B79F"/><path d="M136 270 q-2 -4 1 -7" fill="none" stroke="#F1E9DC" stroke-opacity=".4"/></g>',
    chair: '<g class="cp-item"><path d="M146 284 l4 -14 h12 l4 14 M150 270 l-2 -10" fill="none" stroke="#B9A6CC" stroke-width="1.6"/></g>' })[n.item] || '';
  return g + '</g>';
}
const _openPlayPage = openPlayPage;
openPlayPage = function () {
  Camp.shown = PERSONALITY_ON && navigator.onLine === false;
  if (Camp.shown) { Camp.night = campNight(); persDisc('camp'); }
  const r = _openPlayPage.apply(this, arguments);
  Camp.shown = false;
  return r;
};
window.addEventListener('online', () => {
  const c = document.querySelector('.pb-camp'); if (!c) return;
  c.classList.add('puff'); setTimeout(() => c.classList.add('gone'), 1500); setTimeout(() => c.remove(), 3000);
});

/* ---------- Archive of Small Things ---------- */
const ARCHIVE = [
  ['logo', 'Logo, resting. Cause of fatigue: you.', '<rect x="12" y="24" width="24" height="16" rx="5" fill="#B9A6CC"/><text x="30" y="16" font-size="9" fill="#8a7aa3">z</text>'],
  ['coffee', 'Coffee ring. Origin unknown. Purpose: none.', '<circle cx="24" cy="24" r="14" fill="none" stroke="#7a4b2a" stroke-width="3" stroke-dasharray="70 18" opacity=".7"/>'],
  ['swatches', 'Five swatches, one day.', ['#F1E9DC', '#F4E6C8', '#C9DABB', '#F2A982', '#241631'].map((c, i) => '<rect x="' + (3 + i * 8.6) + '" y="14" width="7" height="20" rx="2" fill="' + c + '" stroke="#999" stroke-opacity=".4"/>').join('')],
  ['match', 'A perfect match. Variable A and variable A.', '<path d="M16 30 C6 22 12 12 18 17 C21 12 28 13 24 20 Z" fill="#E87A9B"/><path d="M32 34 C22 26 28 16 34 21 C37 16 44 17 40 24 Z" fill="#E87A9B" opacity=".85"/>'],
  ['beam', 'Sixth beam. Source: the record.', '<line x1="6" y1="40" x2="42" y2="8" stroke="#D9CFE6" stroke-width="2" opacity=".7"/><circle cx="6" cy="40" r="2.6" fill="#B9A6CC"/>'],
  ['camp', 'Campsite. Occupants: not available.', '<polygon points="6,40 20,14 34,40" fill="#6b5a86"/><path d="M38 40 q-4 -9 0 -14 q4 5 0 14z" fill="#E98B3C"/>'],
  ['twins', 'A pair. It was an accident.', '<text x="4" y="30" font-size="16" fill="#7a6a58" font-weight="700">12</text><text x="26" y="30" font-size="16" fill="#7a6a58" font-weight="700">12</text><line x1="4" y1="34" x2="20" y2="34" stroke="#7a6a58"/><line x1="26" y1="34" x2="42" y2="34" stroke="#7a6a58"/>'],
  ['cat', 'Black cat. Appears on certain Fridays, mostly to make a point.', '<ellipse cx="24" cy="30" rx="12" ry="9" fill="#1c1a22"/><circle cx="24" cy="19" r="8" fill="#1c1a22"/><polygon points="17,14 18,7 22,12" fill="#1c1a22"/><polygon points="31,14 30,7 26,12" fill="#1c1a22"/>'],
  ['wave', 'Wave, partly observed.', '<path d="M4 28 q6 -12 12 0 t12 0 t12 0" fill="none" stroke="#8aa6b8" stroke-width="2.4"/>'],
  ['visitor', 'Visitor. Grey. Unbothered. Unauthorized.', '<ellipse cx="24" cy="32" rx="15" ry="8" fill="#9aa0a8"/><circle cx="14" cy="26" r="7" fill="#9aa0a8"/><polygon points="9,22 9,16 14,20" fill="#9aa0a8"/><polygon points="19,21 20,16 15,20" fill="#9aa0a8"/>']
];
function archiveFound() { const d = Eggs.st.disc; return ARCHIVE.filter(a => d[a[0]]).sort((a, b) => (d[a[0]] < d[b[0]] ? -1 : d[a[0]] > d[b[0]] ? 1 : 0)); }
function persArchiveRow() {
  if (!PERSONALITY_ON || !archiveFound().length) return '';
  return '<button class="kv arch-row" data-act="open-archive" data-notr><span>Archive of Small Things</span><b>' + ic('chevR', 15) + '</b></button>';
}
function openArchivePage() {
  if (!PERSONALITY_ON) return;
  Pages.push({
    title: 'Archive of Small Things', render(body) {
      const d = Eggs.st.disc, items = archiveFound();
      body.innerHTML = '<div class="arch" data-notr>' + items.map(a => '<div class="arch-i"><svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">' + a[2] + '</svg><div><div class="arch-l">' + esc(a[1]) +
        '</div><div class="arch-d">First met ' + esc(beamDate(d[a[0]]) + (keyDate(d[a[0]]).getFullYear() !== new Date().getFullYear() ? ', ' + keyDate(d[a[0]]).getFullYear() : '')) + '</div></div></div>').join('') + '</div>';
    }
  });
}
Handlers['open-archive'] = () => openArchivePage();
