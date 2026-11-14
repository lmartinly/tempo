/* ---- Phase 1: triggers (wrappers around existing functions; originals keep working unchanged) ---- */
const r1 = x => Math.round(x * 10) / 10;

/* significant personal best: >= 2 earlier sessions of the exercise, and est-1RM up by >= 15 % AND >= 2.5 kg.
   (Standard PR detection in finishWorkout is untouched and independent.) */
function isSignificantPB(histLen, beforeE1, nowE1) {
  if (histLen < 2 || !(beforeE1 > 0)) return false;
  const b = r1(beforeE1), n = r1(nowE1);
  return (n - b) >= 2.5 - 1e-9 && nowE1 >= beforeE1 * 1.15 - 1e-9;
}
function persWorkoutFacts(rec, saved, prs, isEdit) {
  if (!PERSONALITY_ON) return null;
  const f = { prs, sig: [], text: null };
  try {
    const dtMs = new Date(rec.dateTime).getTime();
    rec.entries.forEach(e => {
      if (!isStrength(e.kind)) return;
      const hist = exerciseHistory(e.name, dtMs, rec.id);
      if (!hist.length) return;
      const before = exerciseBest(hist), now = exerciseBest([{ e }]);
      if (now.e1 > before.e1 + 0.01 && isSignificantPB(hist.length, before.e1, now.e1)) f.sig.push(e.name);
    });
    if (isEdit) return f;                                         /* an edit of an old session never speaks */
    const cands = [], S = Store.state, w = saved;
    /* biggest session so far */
    const vol = workoutVolume(w), others = S.workouts.filter(x => x.id !== w.id && workoutVolume(x) > 0);
    if (vol > 0 && others.length >= 3 && others.every(x => workoutVolume(x) < vol))
      cands.push({ id: 'lp6', vars: { sets: strengthSetCount(w), tonnes: fmtW(vol / 1000) } });
    /* personal best voices */
    if (prs.length) {
      const ids = f.sig.length ? POOLS.pbsig.concat(POOLS.pb) : POOLS.pb;
      const id = Voice.firstUnseen(ids);
      if (id) cands.push({ id, vars: { exercise: f.sig[0] || prs[0].name } });
    }
    /* every planned day this week done (and it was not already) */
    if (weekPlanComplete(S.workouts) && !weekPlanComplete(S.workouts.filter(x => x.id !== w.id))) cands.push({ id: 'l13' });
    if (workoutFocus(w) === 'Full body') cands.push({ id: 'l11' });
    if (customOnly(w)) cands.push({ id: 'l14' });
    persTitleCands(w).forEach(c => cands.push(c));
    const pk = Voice.pick(cands);
    if (pk) f.text = pk;
  } catch (e) { f.err = String(e); }
  return f;
}
function weekPlanComplete(ws) {
  const plan = plannedWorkoutDays(); if (!plan.length) return false;
  const now = new Date(), mon = new Date(now); mon.setHours(0, 0, 0, 0); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  const done = new Set();
  ws.forEach(w => { const d = new Date(w.dateTime); if (d >= mon && d < new Date(mon.getTime() + 7 * DAY)) done.add(d.getDay()); });
  return plan.every(d => done.has(d));
}
function customOnly(w) {
  const lib = new Set(MOVE_LIBRARY.concat(EQUIPMENT_LIBRARY).map(x => normName(x[2])));
  Store.state.equipment.forEach(e => lib.add(normName(e.name)));
  const es = (w.entries || []); return es.length > 0 && es.every(e => !lib.has(normName(e.name)));
}
function persDecoratePR(items, f) {
  if (f && f.text && items.length) items[0].note = f.text.text;
  return items;
}
function persAfterWorkout(f, celebrated) {
  if (f && f.text && !celebrated) Voice.show(f.text.text, { praise: f.text.praise });
}

/* achievement cards: the one-time moments ride on the main card as a note */
function persDecorateAch(items) {
  if (!PERSONALITY_ON || !items || !items.length) return items;
  const k = items[0].key || '', m = k.match(/^bd:.*:(\d)$/);
  let id = null;
  if (k === 'card2') id = 'l22';
  else if (m && TIER_NAMES[+m[1]] === 'Gold') id = 'l23';
  else if (k.indexOf('rd:') === 0 && items[0].kicker === 'Goal reached') id = 'lp9';
  if (id) { const t = Voice.claim(id); if (t) items[0].note = t; }
  return items;
}

/* conditions that turn true during normal use (never ones that were already true when the layer first looked) */
(function () {
  const C = Eggs.conds;
  C.lp7 = () => Store.state.workouts.length >= 10;
  C.lp8 = () => { const sw = startWeight(), cur = currentWeight(), g = +Store.state.settings.goalKg || 0; return !!(cur && g > 0 && sw != null && sw > g && (sw - cur.kg) >= (sw - g) / 2); };
  C.lp9 = () => { const sw = startWeight(), cur = currentWeight(), g = +Store.state.settings.goalKg || 0; return !!(cur && g > 0 && sw != null && sw > g && cur.kg <= g); };
  C.lp10 = () => bingoCard2Unlocked() && bingoState(2).done >= 16;     /* Card One's completion has its own personalized moment (m7a) */
  C.lp12 = () => { const k = trackingStartKey(); return !!k && daysBetween(new Date(k + 'T12:00:00'), new Date()) >= 100; };
  C.l21 = () => bingoState(1).lines.length >= 1 || (bingoCard2Unlocked() && bingoState(2).lines.length >= 1);
})();
const PERS_CHECK_ORDER = ['lp9', 'lp8', 'lp12', 'lp7'];       /* lp10 / l21 live on the Bingo page */
function persCheck() {
  if (!PERSONALITY_ON) return;
  try {
    const fresh = Eggs.fresh();
    const pk = Voice.pick(PERS_CHECK_ORDER.filter(id => fresh.indexOf(id) >= 0).map(id => ({ id })));
    if (pk) Voice.show(pk.text, { praise: pk.praise });
  } catch (e) {}
}

/* a check-in was saved */
function persAfterCheckIn(rec, prev) {
  if (!PERSONALITY_ON || !rec || rec.dateKey !== dateKey(new Date())) return;
  const cands = [], target = +Store.state.settings.proteinTarget || 0;
  if (rec.nothingToReport && !checkInHasData(rec)) cands.push({ id: 'l1' });
  else {
    if (target > 0 && rec.proteinG != null && +rec.proteinG >= target && !(prev && prev.proteinG != null && +prev.proteinG >= target)) cands.push({ id: 'lp1', vars: { target } });
    const full = c => c && c.appetite != null && c.energy != null && c.proteinG != null && c.sleepHours != null;
    if (full(rec) && !full(prev)) cands.push({ id: 'l3' });
  }
  if (persEnergyFive(rec, Store.state.checkIns)) cands.push({ id: 'm8' });
  const pk = Voice.pick(cands);
  if (pk) Voice.show(pk.text, { praise: pk.praise });
}
const _saveCheckIn = Actions.saveCheckIn;
Actions.saveCheckIn = function (d) {
  const prevRaw = d.id ? Store.state.checkIns.find(x => x.id === d.id) : Store.state.checkIns.find(x => x.dateKey === d.dateKey);
  const prev = prevRaw ? JSON.parse(JSON.stringify(prevRaw)) : null;
  const r = _saveCheckIn.apply(this, arguments);
  persAfterCheckIn(r && r.dateKey ? r : d, prev);
  return r;
};

/* a weigh-in was saved */
const _saveWeight = Actions.saveWeight;
Actions.saveWeight = function (d) {
  const last = dailyWeightSeries().slice(-1)[0], lastKg = last ? last.kg : null, lastK = last ? last.k : null;
  const r = _saveWeight.apply(this, arguments);
  if (PERSONALITY_ON) {
    try {
      const cur = dailyWeightSeries().slice(-1)[0];
      if (lastKg != null && cur && cur.k >= lastK && cur.kg > lastKg + 0.04 && (r && new Date(r.dateTime).getTime() >= Date.now() - 2 * DAY)) {
        const t = Voice.claim('l4'); if (t) Voice.show(t);
      }
    } catch (e) {}
    setTimeout(persCheck, 1200);
  }
  return r;
};

/* the shot-day checklist */
const _toggleChecklist = Actions.toggleChecklist;
Actions.toggleChecklist = function (idx) {
  const before = checklistState().done.slice();
  const r = _toggleChecklist.apply(this, arguments);
  if (PERSONALITY_ON) {
    const c = checklistState(), n = Store.state.settings.checklistItems.length;
    if (n === 5 && c.done.length === 5 && c.done.every(Boolean) && !before.every(Boolean)) { const t = Voice.claim('l2'); if (t) Voice.show(t); }
  }
  return r;
};

/* a workout was started */
const _startFromDay = startWorkoutFromDay, _startEmpty = startEmptyWorkout;
startWorkoutFromDay = function () { const r = _startFromDay.apply(this, arguments); if (PERSONALITY_ON && Store.state.meta.workoutDraft) { const t = Voice.claim('l8'); if (t) Voice.show(t, { delay: 1400 }); } return r; };
startEmptyWorkout = function () { const r = _startEmpty.apply(this, arguments); if (PERSONALITY_ON && Store.state.meta.workoutDraft) { const t = Voice.claim('l8'); if (t) Voice.show(t, { delay: 1400 }); } return r; };

/* a backup was exported */
const _doExport = doExport;
doExport = async function () {
  const before = Store.state.meta.lastBackupAt;
  const r = await _doExport.apply(this, arguments);
  if (PERSONALITY_ON && Store.state.meta.lastBackupAt && Store.state.meta.lastBackupAt !== before) { const t = Voice.claim('lp2'); if (t) Voice.show(t, { praise: true, delay: 1200 }); }
  return r;
};

/* handler table */
(function () {
  const H = Handlers, wrap = (k, fn) => { const o = H[k]; H[k] = function (el) { const r = o.apply(this, arguments); try { fn(el); } catch (e) {} return r; }; };
  wrap('open-weekwrapped', () => { const t = Voice.claim('l19', null, { story: true }); if (t) Voice.show(t, { story: true, delay: 700 }); });
  wrap('open-monthwrapped', () => { const t = Voice.claim('l20', null, { story: true }); if (t) Voice.show(t, { story: true, delay: 700 }); });
  wrap('set-theme', el => { const id = el.dataset.themeId; if (swatchWouldComplete(id)) return; const line = id === 'midnight' ? 'l28' : id === 'sunset' ? 'l29' : null; if (line) { const t = Voice.claim(line); if (t) Voice.show(t, { delay: 1300 }); } });
  wrap('heat-day', el => {
    if (!PERSONALITY_ON) return;
    const d = el.closest('.page') && el.closest('.page').querySelector('#heat-detail');
    if (d && /nothing logged\s*$/.test(heatDetail(heatMetric, el.dataset.k))) { const h = Voice.capHtml('l30'); if (h) d.insertAdjacentHTML('beforeend', h); }
  });
  wrap('celebrate-close', () => setTimeout(persCheck, 500));
})();

/* ---- inline captions ---- */
function persRecordCap(r, cut) {
  if (!PERSONALITY_ON) return '';
  if (r.label === 'Heaviest lift') return Voice.capHtml('l10', { kg: String(r.value).replace(/\s*kg$/, '') });
  if (r.label === 'Longest check-in run' && r.k && r.k >= cut) return Voice.capHtml('l18');
  return '';
}
function persDraftLine(draft) {
  if (!PERSONALITY_ON || !draft) return '';
  const h = (Date.now() - new Date(draft.startedAt).getTime()) / 3600000;
  if (!(h >= 5)) return '';
  return Voice.capHtml('l6', { n: Math.floor(h) });
}
let persBingoNote = '';
function persBingoOpen() {
  persBingoNote = '';
  if (!PERSONALITY_ON) return;
  const st = Eggs.st, card = bingoCard2Unlocked() ? 2 : 1;
  persBingoNote = persBingoMoment(card);
  if (!persBingoNote && !st.seen.lp10 && Eggs.conds.lp10()) persBingoNote = Voice.claim('lp10') || '';
  if (!persBingoNote && !st.seen.l21 && Eggs.conds.l21()) persBingoNote = Voice.claim('l21') || '';
}
function persBingoHtml() { return persBingoNote ? '<div class="pers-note" data-notr>✉️ ' + esc(persBingoNote) + '</div>' : ''; }
const _openBingoPage = openBingoPage;
openBingoPage = function () { persBingoOpen(); return _openBingoPage.apply(this, arguments); };

/* Tempo Play */
function persPlayWhich(st, r) {
  if (!PERSONALITY_ON || r.demo) return '';
  if (st.persText === undefined) {
    st.persText = '';
    const c = Eggs.st.cnt, right = st.pick === r.answer;
    c.ww = right ? (c.ww || 0) + 1 : 0;
    const pk = Voice.pick(right ? (c.ww === 3 ? [{ id: 'lp11' }] : []) : [{ id: 'l25' }]);
    Eggs.save();
    if (pk) st.persText = pk.text;
  }
  return st.persText ? '<div class="pers-cap" data-notr style="margin-top:8px">' + esc(st.persText) + '</div>' : '';
}
function persPlayShuffle(st, right) {
  if (!PERSONALITY_ON || right !== 3) return '';
  if (st.persText === undefined) st.persText = Voice.claim('l26') || '';
  return st.persText ? '<div class="pers-cap" data-notr style="margin-top:8px">' + esc(st.persText) + '</div>' : '';
}
/* Lab */
function persLab15(ci) { return (PERSONALITY_ON && ci && ci[0] < 0 && ci[1] > 0) ? Voice.capHtml('l15') : ''; }
function persLab16() { return PERSONALITY_ON ? Voice.capHtml('l16') : ''; }
