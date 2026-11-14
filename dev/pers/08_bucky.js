/* ---- Phase 4b: The Unauthorized Visitor ----
   A small grey cat, drawn (never photographed), who occasionally sits on decorative space and leaves again.
   Purely visual: the layer ignores pointer input; a tiny hit area (tail-flick only) exists solely where nothing
   interactive lies underneath. He never appears over forms, sheets, dialogs, celebrations, stories, Tempo Play,
   the calendar (where the black cat lives) or during a workout session, and he never speaks (Tempo does, roughly one visit in three). */
const BK = { body: '#8d939c', dark: '#6f7680', light: '#b9bec5', belly: '#c9cdd3', eye: '#e3a82b', nose: '#c98d93', ear: '#b99aa0' };
const BK_REMARKS = ["I don't remember hiring him.", "He's not on the payroll.", "I'd like it noted that I did not authorize this.", "Please don't ask me how he got in.", 'He appears to be doing a very important job.'];
const BK_AMBITIOUS = ["He's claimed another card. I'm told this is how occupations begin.", 'He has annexed the dashboard. I\'ve asked for a statement.'];
const BK_SIMPLE = ['away', 'blink', 'knead', 'yawn', 'wash', 'pawtest'];
const BK_HABITS = ['contort', 'headturn', 'sprawl', 'nudge', 'inconvenient'];

function bkEyes(cx, cy, o) {
  o = o || {};
  const dx = o.dx || 0, open = o.eyes !== 'closed';
  const eye = x => '<ellipse cx="' + (x + dx) + '" cy="' + cy + '" rx="2.7" ry="' + (o.eyes === 'half' ? 1.4 : 2.9) + '" fill="' + BK.eye + '"/><ellipse cx="' + (x + dx + (o.look || 0)) + '" cy="' + cy + '" rx="1" ry="' + (o.eyes === 'half' ? 1.1 : 2.3) + '" fill="#2b2730"/>';
  const lid = x => '<path d="M' + (x + dx - 3) + ' ' + cy + ' q3 2.6 6 0" fill="none" stroke="#2b2730" stroke-width="1.2" stroke-linecap="round"/>';
  if (!open) return '<g class="bk-eyes">' + lid(cx - 6.5) + lid(cx + 6.5) + '</g>';
  return '<g class="bk-open">' + eye(cx - 6.5) + eye(cx + 6.5) + '</g><g class="bk-lid">' + lid(cx - 6.5) + lid(cx + 6.5) + '</g>';
}
function bkHead(cx, cy, o) {
  o = o || {};
  const dx = o.dx || 0;
  let g = '<g class="bk-head">';
  g += '<polygon points="' + (cx - 14) + ',' + (cy - 7) + ' ' + (cx - 11) + ',' + (cy - 21) + ' ' + (cx - 3) + ',' + (cy - 12) + '" fill="' + BK.body + '"/>';
  g += '<polygon points="' + (cx + 14) + ',' + (cy - 7) + ' ' + (cx + 11) + ',' + (cy - 21) + ' ' + (cx + 3) + ',' + (cy - 12) + '" fill="' + BK.body + '"/>';
  g += '<polygon points="' + (cx - 11.5) + ',' + (cy - 10) + ' ' + (cx - 10.5) + ',' + (cy - 17) + ' ' + (cx - 6) + ',' + (cy - 12) + '" fill="' + BK.ear + '"/><polygon points="' + (cx + 11.5) + ',' + (cy - 10) + ' ' + (cx + 10.5) + ',' + (cy - 17) + ' ' + (cx + 6) + ',' + (cy - 12) + '" fill="' + BK.ear + '"/>';
  g += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="17" ry="14.5" fill="' + BK.body + '"/>';
  g += '<circle cx="' + (cx - 9) + '" cy="' + (cy + 5) + '" r="7.5" fill="' + BK.body + '"/><circle cx="' + (cx + 9) + '" cy="' + (cy + 5) + '" r="7.5" fill="' + BK.body + '"/>';
  g += bkEyes(cx, cy - 1, o);
  g += '<path d="M' + (cx - 2 + dx) + ' ' + (cy + 3.5) + ' h4 l-2 2.6 z" fill="' + BK.nose + '"/>';
  if (o.mouth) g += '<ellipse cx="' + (cx + dx) + '" cy="' + (cy + 10) + '" rx="3.6" ry="4.6" fill="#7b4a52"/>';
  else g += '<path d="M' + (cx + dx) + ' ' + (cy + 6) + ' q-2.6 3.4 -5 1.4 M' + (cx + dx) + ' ' + (cy + 6) + ' q2.6 3.4 5 1.4" fill="none" stroke="#4a3f45" stroke-width=".9" stroke-linecap="round"/>';
  g += '<g stroke="' + BK.light + '" stroke-width=".7" opacity=".9"><path d="M' + (cx - 9) + ' ' + (cy + 6) + ' l-9 -2 M' + (cx - 9) + ' ' + (cy + 8) + ' l-9 2 M' + (cx + 9) + ' ' + (cy + 6) + ' l9 -2 M' + (cx + 9) + ' ' + (cy + 8) + ' l9 2"/></g>';
  return g + '</g>';
}
const bkTail = (d, cls) => '<path class="bk-tail ' + (cls || '') + '" d="' + d + '" fill="none" stroke="' + BK.body + '" stroke-width="8" stroke-linecap="round"/>';
const bkPaw = (x, y, cls, rot) => '<ellipse class="bk-paw ' + (cls || '') + '" cx="' + x + '" cy="' + y + '" rx="6.2" ry="4.4" fill="' + BK.light + '"' + (rot ? ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"' : '') + '/>';
const bkLoaf = (rx) => '<ellipse cx="62" cy="54" rx="' + (rx || 36) + '" ry="17" fill="' + BK.body + '"/><ellipse cx="62" cy="49" rx="' + ((rx || 36) - 8) + '" ry="10" fill="' + BK.dark + '" opacity=".25"/>';

function bkArt(pose) {
  const W = 130, H = 76; let g = '';
  switch (pose) {
    case 'away':
      g = bkTail('M96 62 q18 2 14 -14', 'sw') + bkLoaf() + bkPaw(36, 66) + bkPaw(50, 67) + bkHead(52, 34, { dx: 5, look: 1.4 }); break;
    case 'blink':
      g = bkTail('M96 62 q18 2 14 -14') + bkLoaf() + bkPaw(36, 66) + bkPaw(50, 67) + bkHead(50, 34, {}); break;
    case 'knead':
      g = bkTail('M96 62 q18 2 14 -14') + bkLoaf() + bkHead(46, 36, { eyes: 'half' }) + bkPaw(32, 68, 'kn1') + bkPaw(48, 68, 'kn2'); break;
    case 'yawn':
      g = bkTail('M104 60 q16 0 14 -12') + bkLoaf(38) + bkPaw(20, 66, '', 0) + bkHead(46, 33, { mouth: true, eyes: 'closed' }); break;
    case 'chin':
      g = bkTail('M104 60 q16 0 14 -12') + bkLoaf(38) + bkPaw(22, 68) + bkPaw(38, 69) + bkHead(34, 48, { eyes: 'half' }); break;
    case 'wash':
      g = bkTail('M96 62 q18 2 14 -14') + bkLoaf() + bkPaw(52, 68) + bkHead(48, 34, { eyes: 'half' }) + bkPaw(56, 44, 'wp'); break;
    case 'pawtest':
      g = bkTail('M96 62 q18 2 14 -14') + bkLoaf() + bkPaw(36, 66) + bkHead(46, 36, { dx: 2, look: 1.2 }) +
        '<ellipse class="bk-paw pt" cx="76" cy="73" rx="4.4" ry="6.2" fill="' + BK.light + '"/>'; break;
    case 'contort':
      g = bkTail('M100 40 q16 -4 12 -20', 'sw') + '<ellipse cx="62" cy="44" rx="34" ry="16" fill="' + BK.belly + '"/><ellipse cx="62" cy="42" rx="22" ry="8" fill="#e1e3e6" opacity=".7"/>' +
        '<ellipse cx="94" cy="30" rx="5" ry="12" transform="rotate(-24 94 30)" fill="' + BK.body + '"/><ellipse cx="86" cy="26" rx="5" ry="11" transform="rotate(-8 86 26)" fill="' + BK.body + '"/>' +
        '<ellipse cx="30" cy="62" rx="5" ry="10" transform="rotate(70 30 62)" fill="' + BK.body + '"/><ellipse cx="36" cy="66" rx="5" ry="10" transform="rotate(95 36 66)" fill="' + BK.body + '"/>' +
        '<g transform="rotate(168 36 40)">' + bkHead(36, 40, { eyes: 'half' }) + '</g>'; break;
    case 'headturn':
      g = bkTail('M92 62 q-30 8 -50 4', 'sw') + bkLoaf() + bkPaw(30, 66) + bkPaw(44, 67) + bkHead(98, 36, { dx: -5, look: -1.4 }); break;
    case 'sprawl':
      g = bkTail('M98 66 q14 8 8 18', 'sw') + '<ellipse cx="64" cy="48" rx="44" ry="11" fill="' + BK.body + '"/>' +
        '<ellipse cx="26" cy="60" rx="5" ry="10" transform="rotate(14 26 60)" fill="' + BK.body + '"/><ellipse cx="38" cy="62" rx="5" ry="10" fill="' + BK.body + '"/>' +
        '<ellipse cx="92" cy="62" rx="5" ry="10" fill="' + BK.body + '"/><ellipse cx="104" cy="58" rx="5" ry="10" transform="rotate(-16 104 58)" fill="' + BK.body + '"/>' +
        '<g transform="rotate(-8 56 32)">' + bkHead(56, 32, { eyes: 'closed' }) + '</g>'; break;
    case 'nudge':
      g = bkTail('M92 62 q18 2 14 -14', 'sw') + bkLoaf() + bkPaw(36, 66) + bkHead(46, 34, { look: 1.4, dx: 1 }) + '<ellipse class="bk-paw nd" cx="74" cy="56" rx="7.4" ry="3.8" fill="' + BK.light + '"/>'; break;
    case 'inconvenient':
      g = bkTail('M96 62 q18 2 14 -14') + bkLoaf(38) + bkPaw(34, 66) + bkHead(48, 38, { eyes: 'closed' }) + '<text class="bk-z" x="82" y="22" font-size="11" fill="' + BK.dark + '" opacity=".7">z</text>'; break;
    case 'leave':
      g = '<ellipse cx="60" cy="50" rx="30" ry="13" fill="' + BK.body + '"/>' + ['38', '48', '70', '80'].map((x, i) => '<rect class="bk-leg l' + (i % 2) + '" x="' + (x - 3) + '" y="56" width="6" height="14" rx="3" fill="' + BK.dark + '"/>').join('') +
        bkHead(28, 40, { dx: -3, look: -1.2 }) + bkTail('M90 46 q22 -6 30 -26', 'last'); break;
    default: /* sit */
      g = bkTail('M96 62 q18 2 14 -14', 'sw') + bkLoaf() + bkPaw(36, 66) + bkPaw(50, 67) + bkHead(48, 34, {});
  }
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true">' + g + '</svg>';
}

const Bucky = {
  el: null, hit: null, timer: null, watch: null, last: null, pose: null,
  P: 0.045,                                /* chance that a given app open is a visitor open: a few times a season */
  OK_PAGES: ['Records', 'Workouts', 'Insights'],
  keyboardUp() { try { return window.visualViewport && window.visualViewport.height < window.innerHeight - 120; } catch (e) { return false; } },
  typing() { const a = document.activeElement; return !!a && (/^(input|textarea|select)$/i.test(a.tagName) || a.isContentEditable); },
  draftOn() { const m = Store.state.meta; return !!(m && m.workoutDraft); },
  spot() {
    if (Voice.overlayUp() || Sheet.current || this.typing() || this.keyboardUp() || this.draftOn()) return null;
    const top = Pages.stack[Pages.stack.length - 1];
    if (top) {
      if (this.OK_PAGES.indexOf(top.opts.title) < 0) return null;
      if (top.page.querySelector('input:not([type=hidden]),textarea,.plhero,.cal-cat')) return null;
    }
    return top ? top.page.querySelector('.page-body') : document.getElementById('app');
  },
  anchors(host, pose) {
    const vh = window.innerHeight, out = [];
    const vis = e => { const r = e.getBoundingClientRect(); return r.width >= 160 && r.top >= 70 && r.top <= vh - 150 && r.height >= 40; };
    const q = s => [...host.querySelectorAll(s)].filter(vis);
    const cards = q('.card'), rows = q('.btnrow'), ring = [...host.querySelectorAll('.ring-wrap')].filter(e => { const r = e.getBoundingClientRect(); return r.top >= 70 && r.top <= vh - 150; });
    const hdr = host.id === 'app' ? [...document.querySelectorAll('#dash-topbar .topbar')].filter(e => e.getBoundingClientRect().height > 20) : [];
    const lists = host.id === 'app' ? [] : q('.list');
    let pool;
    if (pose === 'sprawl' || pose === 'contort' || pose === 'headturn' || pose === 'nudge') pool = cards.concat(lists);
    else if (pose === 'inconvenient') pool = hdr.concat(rows);
    else pool = cards.concat(lists, rows, ring, hdr);
    pool.forEach(e => out.push(e));
    return out;
  },
  stay() { return 10000 + Math.random() * 15000; },
  choose() {
    const ep = Eggs.st.ep, last = ep.buckyLast;
    let b = Math.random() < 0.25 ? 'sit' : rnd(BK_SIMPLE.concat(BK_HABITS));
    if (b === last) b = rnd(BK_SIMPLE.concat(BK_HABITS, ['sit']).filter(x => x !== last));
    return b;
  },
  /* the one entry point: opts.force skips the dice and day rules (used by tests only) */
  start(opts) {
    opts = opts || {};
    if (!PERSONALITY_ON || this.el) return false;
    const ep = Eggs.st.ep, today = Voice.today();
    if (!opts.force && ep.buckyDay === today) return false;
    const host = this.spot(); if (!host) return false;
    const pose = opts.pose || this.choose(), list = this.anchors(host, pose);
    if (!list.length) return false;
    const anchor = opts.anchor || rnd(list);
    this.place(host, anchor, pose);
    ep.buckyDay = today; ep.buckyLast = pose; Eggs.st.cnt.bucky = (Eggs.st.cnt.bucky || 0) + 1;
    persDisc('visitor'); Eggs.save();
    return pose;
  },
  place(host, anchor, pose) {
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const hr = host.getBoundingClientRect(), ar = anchor.getBoundingClientRect(), reduced = REDUCED();
    const el = document.createElement('div');
    el.className = 'bk' + (reduced ? ' bk-still' : '');
    el.setAttribute('data-notr', '1'); el.setAttribute('aria-hidden', 'true');
    const w = 130, h = 76, fromLeft = Math.random() < .5;
    const x = Math.max(6, Math.min(ar.width - w - 6, ar.width * (0.15 + Math.random() * 0.6)));
    const edge = pose === 'sprawl' ? ar.top + 14 : pose === 'inconvenient' ? ar.bottom - 30 : ar.top + 8;
    const left = ar.left - hr.left + host.scrollLeft + x, top = edge - hr.top + host.scrollTop - h + (pose === 'inconvenient' ? 20 : 0);
    el.style.cssText = 'position:absolute;pointer-events:none;z-index:3;width:' + w + 'px;height:' + h + 'px;left:' + left + 'px;top:' + top + 'px;';
    el.dataset.dir = fromLeft ? 'l' : 'r';
    host.appendChild(el); this.el = el; this.host = host; this.anchor = anchor; this.pose = pose;
    this.setPose(pose);
    if (!reduced) { el.classList.add(fromLeft ? 'bk-from-l' : 'bk-from-r'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('bk-in'))); }
    else requestAnimationFrame(() => el.classList.add('bk-in'));
    /* the second half of a stretch: chin on the button */
    if (pose === 'yawn') this.timer = setTimeout(() => this.setPose('chin'), 4200);
    if (pose === 'nudge') this.dot(el);
    this.remark(pose);
    this.stayT = setTimeout(() => this.leave(), this.stay());
    this.watch = setInterval(() => this.guard(), 400);
    this.hitT = setTimeout(() => this.makeHit(), 900);
  },
  setPose(p) {
    this.pose = p; if (!this.el) return;
    let a = this.el.querySelector('.bk-art');
    if (!a) { a = document.createElement('div'); a.className = 'bk-art'; this.el.insertBefore(a, this.el.firstChild); }
    a.innerHTML = bkArt(p); this.el.dataset.pose = p; this.el.classList.toggle('bk-blinking', p === 'blink');
  },
  dot(el) {
    const d = document.createElement('div'); d.className = 'bk-dot'; d.innerHTML = '<svg viewBox="0 0 12 12" width="12" height="12"><circle cx="6" cy="6" r="3.2" fill="#E3B79F" fill-opacity=".85"/></svg>';
    d.style.cssText = 'position:absolute;pointer-events:none;left:112px;top:38px;'; el.appendChild(d);
    this.timer = setTimeout(() => { d.classList.add('bk-wob'); const a = el.querySelector('.bk-art svg'); if (a) a.classList.add('bk-glance'); }, 2600);
  },
  remark(pose) {
    if (Math.random() >= 1 / 3 || Voice.blocked()) return;
    const ep = Eggs.st.ep, pool = pose === 'sprawl' ? BK_AMBITIOUS : BK_REMARKS;
    const i = rnd(pool.map((x, k) => k).filter(k => k !== ep['bkR' + (pose === 'sprawl' ? 'a' : 'n')])); ep['bkR' + (pose === 'sprawl' ? 'a' : 'n')] = i;
    const c = document.createElement('div'); c.className = 'bk-cap'; c.setAttribute('data-notr', '1'); c.textContent = pool[i];
    c.style.cssText = 'position:absolute;pointer-events:none;left:' + (this.el.offsetLeft) + 'px;top:' + (this.el.offsetTop + 78) + 'px;max-width:230px';
    this.host.appendChild(c); this.cap = c; Voice.spentUntil = Date.now() + 1500;
    setTimeout(() => c.classList.add('in'), 1800);
  },
  /* a tail-flick-only hit area, created only where nothing interactive lies underneath (5 x 5 sample) */
  makeHit() {
    if (!this.el) return; this.dropHit();
    const r = this.el.getBoundingClientRect(), bx = r.left + r.width * .2, by = r.top + r.height * .35, bw = r.width * .6, bh = r.height * .6;
    const sel = 'a,button,input,select,textarea,label,summary,[data-act],[data-lab],[data-pa],[data-sens],[data-pw],[data-ts],[role="button"],[tabindex]:not([tabindex="-1"])';
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const x = bx + bw * (i + .5) / 5, y = by + bh * (j + .5) / 5;
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return;
      const stack = document.elementsFromPoint(x, y);
      /* the tap would reach the first element that is not ours */
      const top = stack.find(e => !this.el.contains(e) && !(this.cap && this.cap.contains(e)) && !(this.hit && this.hit.contains(e)));
      if (top && top.closest && top.closest(sel)) return;
    }
    const h = document.createElement('div'); h.className = 'bk-hit';
    h.style.cssText = 'position:absolute;z-index:4;left:' + (this.el.offsetLeft + this.el.offsetWidth * .2) + 'px;top:' + (this.el.offsetTop + this.el.offsetHeight * .35) + 'px;width:' + bw + 'px;height:' + bh + 'px;background:transparent;pointer-events:auto;touch-action:manipulation';
    h.setAttribute('data-notr', '1'); h.setAttribute('aria-hidden', 'true');
    h.addEventListener('click', e => { e.stopPropagation(); if (this.pose === 'sit' || !this.el) return; const t = this.el.querySelector('.bk-tail'); if (t) { t.classList.remove('bk-flick'); void t.getBoundingClientRect(); t.classList.add('bk-flick'); } });
    this.host.appendChild(h); this.hit = h;
  },
  dropHit() { if (this.hit) { this.hit.remove(); this.hit = null; } },
  /* leave at once if anything she might need appears */
  guard() {
    if (!this.el) return;
    if (!this.el.isConnected || Voice.overlayUp() || Sheet.current || this.typing() || this.keyboardUp() || this.draftOn() || this.spot() !== this.host) return this.end(true);
    const top = Pages.stack[Pages.stack.length - 1];
    if (top && top.page.querySelector('input:not([type=hidden]),textarea,.plhero,.cal-cat')) return this.end(true);
    this.tick = (this.tick || 0) + 1; if (this.tick % 5 === 0) this.makeHit();
  },
  leave() {
    if (!this.el) return;
    clearTimeout(this.timer); this.dropHit();
    if (this.cap) this.cap.classList.remove('in');
    if (REDUCED()) return this.end(false);
    this.setPose('leave'); this.el.classList.remove('bk-in'); this.el.classList.add('bk-out', this.el.dataset.dir === 'l' ? 'bk-to-r' : 'bk-to-l');
    setTimeout(() => this.end(false), 2600);
  },
  end() {
    clearTimeout(this.timer); clearTimeout(this.stayT); clearTimeout(this.hitT); clearInterval(this.watch);
    this.dropHit();
    if (this.el) this.el.remove(); if (this.cap) this.cap.remove();
    this.el = this.cap = this.host = this.anchor = null;
  },
  /* an open is a visitor open only now and then; he never comes in the first minute */
  init() {
    if (!PERSONALITY_ON || Math.random() >= this.P) return;
    const tries = { n: 0 };
    const attempt = () => {
      if (this.el || tries.n++ > 24) return;
      if (document.hidden || !this.start()) return setTimeout(attempt, 20000);
    };
    setTimeout(attempt, 65000 + Math.random() * 120000);
  }
};
Bucky.init();
