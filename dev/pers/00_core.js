/* ===================== Personality layer (v2.2.0) =====================
   English-only. In Turkish mode (LANG === 'tr') none of this speaks, counts or stores anything.
   State lives in meta.eggs (separate from every health / workout record). */
const PERSONALITY_ON = (LANG !== 'tr');

function eggsObj(o) { return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {}; }
function eggsNum(o) { const r = {}; Object.keys(eggsObj(o)).forEach(k => { const n = +o[k]; if (isFinite(n)) r[k] = n; }); return r; }
function eggsNorm(e) {
  const o = eggsObj(e), cap = eggsObj(o.cap);
  const flags = x => { const r = {}; Object.keys(eggsObj(x)).forEach(k => { if (x[k]) r[k] = x[k]; }); return r; };
  return {
    v: 1, seeded: !!o.seeded,
    seed: flags(o.seed), seen: flags(o.seen), disc: flags(o.disc),
    cnt: eggsNum(o.cnt), logo: Math.max(0, Math.floor(+o.logo || 0)),
    cap: { day: typeof cap.day === 'string' ? cap.day : '', p3: Math.max(0, +cap.p3 || 0), p4: Math.max(0, +cap.p4 || 0) },
    ep: eggsObj(o.ep) === o.ep ? Object.assign({}, o.ep) : {}
  };
}

const Eggs = {
  conds: {},                       /* id -> () => boolean : one-time state conditions (seeded silently) */
  get st() { const m = Store.state.meta; if (!m.eggs || m.eggs.v !== 1) m.eggs = eggsNorm(m.eggs); return m.eggs; },
  save() { Store.persist(); },     /* persist only: personality state never triggers a Drive sync */
  mergeRestore(cur, inc) {
    const a = eggsNorm(cur), b = eggsNorm(inc), out = eggsNorm(b);
    ['seen', 'seed', 'disc', 'ep'].forEach(k => { out[k] = Object.assign({}, b[k], a[k]); });
    Object.keys(a.cnt).forEach(k => { out.cnt[k] = Math.max(a.cnt[k], out.cnt[k] || 0); });
    out.logo = Math.max(a.logo, b.logo);
    out.cap = a.cap.day ? a.cap : b.cap;
    out.seeded = a.seeded || b.seeded;
    return out;
  },
  /* conditions that are already true are recorded (not announced); they stay eligible for "retro" surfaces */
  reseed() {
    if (!PERSONALITY_ON) return;
    const st = this.st; let ch = !st.seeded;
    Object.keys(this.conds).forEach(id => {
      let v = false; try { v = !!this.conds[id](); } catch (e) {}
      if (v && !st.seed[id] && !st.seen[id]) { st.seed[id] = 1; ch = true; }
    });
    st.seeded = true;
    if (ch) this.save();
  },
  /* normal-use check: a condition that turned true since the last look speaks once */
  fresh() {
    if (!PERSONALITY_ON) return [];
    const st = this.st, out = [];
    Object.keys(this.conds).forEach(id => {
      let v = false; try { v = !!this.conds[id](); } catch (e) {}
      if (v && !st.seed[id] && !st.seen[id]) out.push(id);
    });
    return out;
  },
  init() { if (!PERSONALITY_ON) return; if (!this.st.seeded) this.reseed(); }
};

/* ---- the one voice ---- */
const LINES = {};                  /* id -> { t: string | (vars)=>string, p: 'p2'|'p3'|'p4'|'plain' } */
const POOLS = {};                  /* pool id -> [line ids] (rotate, never repeat a member) */
const Voice = {
  spentUntil: 0,
  overlayUp(story) { return !!(Celebrate.el || (!story && Story.el) || Dlg.current); },
  blocked(o) { return !PERSONALITY_ON || Date.now() < this.spentUntil || this.overlayUp(o && o.story); },
  capCache: {},                    /* inline captions stay put for the page session they were first shown in */
  today() { return dateKey(new Date()); },
  rollDay() { const c = Eggs.st.cap, d = this.today(); if (c.day !== d) { c.day = d; c.p3 = 0; c.p4 = 0; } },
  fill(t, v) { v = v || {}; return String(t).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m)); },
  /* decide whether this line may speak now; commits counters/seen only when it does */
  claim(id, vars, o) {
    if (!PERSONALITY_ON) return null;
    const L = LINES[id]; if (!L) return null;
    const st = Eggs.st;
    if (st.seen[id]) return null;
    if (this.blocked(o)) return null;
    this.rollDay();
    const cls = L.p;
    if (cls === 'p3' || cls === 'p4') {
      if (st.cap[cls] >= (cls === 'p3' ? 2 : 1)) return null;
      const k = cls === 'p3' ? 4 : 6;
      const n = (st.cnt[cls] = (st.cnt[cls] || 0) + 1);
      if ((n - 1) % k !== 0) { Eggs.save(); return null; }
      st.cap[cls]++;
    }
    st.seen[id] = this.today();
    this.spentUntil = Date.now() + 1500;
    Eggs.save();
    return this.fill(typeof L.t === 'function' ? L.t(vars || {}) : L.t, vars);
  },
  firstUnseen(ids) { const st = Eggs.st; return (ids || []).find(x => !st.seen[x]) || null; },
  /* several lines are eligible for one interaction: only the best (p2 > p3 > p4, then list order) is considered */
  pick(cands, o) {
    if (!PERSONALITY_ON) return null;
    const st = Eggs.st, rank = { p2: 0, p3: 1, p4: 2 };
    const ok = (cands || []).filter(c => c && c.id && LINES[c.id] && !st.seen[c.id]);
    if (!ok.length) return null;
    ok.sort((a, b) => rank[LINES[a.id].p] - rank[LINES[b.id].p]);
    const c = ok[0], t = this.claim(c.id, c.vars, o);
    return t ? { id: c.id, text: t, praise: !!LINES[c.id].praise } : null;
  },
  /* an inline caption (shown in a page, not as a toast): claimed once, then sticky for this page session */
  cap(id, vars) {
    if (!PERSONALITY_ON) return '';
    if (this.capCache[id] !== undefined) return this.capCache[id];
    const t = this.claim(id, vars);
    if (t) this.capCache[id] = t;
    return t || '';
  },
  capHtml(id, vars) { const t = this.cap(id, vars); return t ? '<div class="pers-cap" data-notr>' + esc(t) + '</div>' : ''; },
  /* pick the first line of a pool nobody has heard yet, then claim it */
  claimPool(pool, vars) {
    if (!PERSONALITY_ON) return null;
    const st = Eggs.st, ids = POOLS[pool] || [];
    const id = ids.find(x => !st.seen[x]);
    return id ? this.claim(id, vars) : null;
  },
  /* delivery: a quiet pill that lingers a little longer than a functional toast */
  show(text, o) {
    if (!text) return;
    o = o || {};
    const fire = () => {
      if (this.overlayUp(o.story)) return;
      const host = $('#toasts'); if (!host) return;
      const t = document.createElement('div');
      t.className = 'toast pers' + (o.praise ? ' praise' : '');
      t.setAttribute('data-notr', '1'); t.textContent = text;
      host.appendChild(t);
      requestAnimationFrame(() => t.classList.add('in'));
      setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, o.praise ? 6200 : 4800);
    };
    setTimeout(fire, o.delay != null ? o.delay : 900);
  },
  say(id, vars, o) { const t = this.claim(id, vars, o); if (t) this.show(t, Object.assign({ praise: LINES[id] && LINES[id].praise }, o)); return t; },
  sayPool(pool, vars, o) { const t = this.claimPool(pool, vars); if (t) this.show(t, o); return t; }
};

/* ---- one overlay layer for everything decorative (never intercepts input unless a child opts in) ---- */
const Fx = {
  el: null,
  ensure() {
    if (this.el && this.el.isConnected) return this.el;
    const d = document.createElement('div');
    d.id = 'fx'; d.setAttribute('aria-hidden', 'true'); d.setAttribute('data-notr', '1');
    document.body.appendChild(d); this.el = d; return d;
  }
};

/* ---- backup reminder (functional copy is always accurate; the personality voice is a first-display wrapper) ---- */
let backupBannerCache = null;
function backupBannerText(bk) {
  const drive = !!(Store.state.settings.drive && Store.state.settings.drive.enabled);
  let plain;
  if (bk.never) plain = drive ? 'Your data is stored on this device, and it hasn’t been backed up or synced to Google Drive yet.'
                              : 'Your data is stored only on this device, and you haven’t exported a backup yet.';
  else plain = drive ? 'Your data is stored on this device — your last backup or Google Drive sync was ' + bk.days + ' days ago.'
                     : 'Your data is stored on this device — your last backup was ' + bk.days + ' days ago.';
  if (!PERSONALITY_ON) return plain;
  const epId = bk.never ? 'never' : 'at' + bk.stamp;
  if (backupBannerCache && backupBannerCache.ep === epId) return backupBannerCache.text;
  const st = Eggs.st;
  if (st.ep.backup === epId) return plain;
  Voice.rollDay();
  if (st.cap.p3 >= 2) return plain;
  const n = (st.cnt.p3 = (st.cnt.p3 || 0) + 1);
  st.ep.backup = epId;
  let text = plain;
  if ((n - 1) % 4 === 0) {
    st.cap.p3++;
    const tail = " I'm not hurt. I'm slightly hurt. The " + (bk.never ? 'only' : 'newest') + " copy of everything you've logged is the one on this device, and a backup takes a few taps.";
    text = (bk.never ? "You haven't made a backup yet." : (drive ? 'Your last backup or sync was ' : 'Your last backup was ') + bk.days + ' days ago.') + tail;
  }
  backupBannerCache = { ep: epId, text };
  Eggs.save();
  return text;
}
function dashFootnoteText() {
  return (Store.state.settings.drive && Store.state.settings.drive.enabled
    ? 'Your data is stored on this device, with a synced copy in your Google Drive.'
    : 'Everything is stored on this device.') + ' This is a tracking tool, not medical advice.';
}
