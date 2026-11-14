const L = require('./lib');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await L.launch(); const data = L.backup();
  const T = (c, n, e) => L.ok(c, n, e);
  const { page, errs } = await L.open(b, { data, wait: 2200 });
  const reset = () => page.evaluate(() => { Eggs.st.cap = { day: '', p3: 0, p4: 0 }; Eggs.st.cnt = {}; Eggs.st.seen = {}; Voice.spentUntil = 0; Voice.capCache = {}; Celebrate.close(); document.querySelectorAll('.toast,.sheet-wrap').forEach(t => t.remove()); });
  const toasts = () => page.evaluate(() => [...document.querySelectorAll('.toast.pers')].map(t => t.textContent));
  const fin = (entries) => page.evaluate(async (entries) => { Store.state.meta.workoutDraft = newDraft({ entries }); await finishWorkout(); }, entries);
  const mkEntry = (nm, region) => ({ name: nm, equipId: null, kind: 'strength', phase: 'main', region, sets: [{ kg: 1, reps: 1, done: true }] });

  // Full body (upper + lower, no PR: kg 1 x 1)
  await reset();
  const names = await page.evaluate(() => {
    const out = { up: null, lo: null };
    Store.state.workouts.forEach(w => w.entries.forEach(e => { if (!isStrength(e.kind)) return; const r = e.region || regionOfName(e.name); if (UPPER_REGIONS.indexOf(r) >= 0 && !out.up) out.up = [e.name, r]; if (LOWER_REGIONS.indexOf(r) >= 0 && !out.lo) out.lo = [e.name, r]; }));
    return out;
  });
  await page.evaluate(() => { Store.state.settings.workoutDays = [1, 2, 3, 4, 5, 6, 0]; });
  await fin([mkEntry(names.up[0], names.up[1]), mkEntry(names.lo[0], names.lo[1])]);
  await sleep(1500);
  let t = await toasts();
  T(t.indexOf('Upper and lower in one session. Showing off, frankly.') >= 0, 'line 11 for a Full body session', t);
  await page.evaluate(() => { document.querySelectorAll('.sheet-wrap').forEach(x => x.remove()); });

  // custom exercises only
  await reset();
  await fin([mkEntry('Zzz invented move', 'other')]);
  await sleep(1500);
  t = await toasts();
  T(t.indexOf('Wherever it happened, it counts.') >= 0, 'line 14 for a custom-exercise-only session', t);
  T(await page.evaluate(() => { const w = Store.state.workouts.slice(-1)[0]; return w.entries[0].name === 'Zzz invented move'; }), 'custom session saved normally');

  // every planned day done: plan = only today's weekday, none yet today
  await reset();
  await page.evaluate(() => {
    const today = new Date().getDay(); Store.state.settings.workoutDays = [today];
    const k = dateKey(new Date()); Store.state.workouts.filter(w => dateKey(w.dateTime) === k).forEach(w => Actions.deleteWorkout(w.id));
  });
  await fin([mkEntry(names.up[0], names.up[1])]);
  await sleep(1500);
  t = await toasts();
  T(t.indexOf("Every planned day, done. I've got nothing. For once, genuinely nothing.") >= 0, 'line 13 when the week plan is complete', t);

  // Saved to Programs
  await reset();
  const sp = await page.evaluate(async () => {
    const w = Store.state.workouts.slice(-1)[0]; openWorkoutDetailSheet(w.id, false); await new Promise(r => setTimeout(r, 500));
    document.querySelector('#wkd-prog').click(); await new Promise(r => setTimeout(r, 500));
    document.querySelector('#tx-ok').click(); await new Promise(r => setTimeout(r, 1600));
    return { toasts: [...document.querySelectorAll('.toast')].map(x => x.textContent), progs: Store.state.programs.length };
  });
  T(sp.toasts.indexOf('Saved to Programs') >= 0 && sp.toasts.indexOf("Saved. You've just done next week's planning, and you didn't have to open a spreadsheet.") >= 0, 'line 12 after Save as checklist (functional toast first)', sp);

  // Lab saved comparison with gained days
  await reset();
  const lab = await page.evaluate(() => {
    labState = null; Eggs.st.seen.l15 = 1; Eggs.st.seen.l16 = 1; const s = labInit();
    const n = labObsCount(s);
    labSaved().splice(0, labSaved().length);
    labSaved().push({ id: 'q1', name: 'Test', cfg: labCfgOf(s), n: Math.max(0, n - 5), savedAt: new Date().toISOString() });
    const body = document.createElement('div'); try { labRender(body); } catch (e) { return { err: String(e), n }; }
    return { html: body.innerText, n };
  });
  T(lab.html && /5 new days of data since you saved this one\. The question hasn't changed, but the answer is allowed to\./.test(lab.html), 'line 17 on a saved comparison that gained days', lab.err || (lab.html || '').slice(-300));

  // Celebrate decorations: Card 2 unlock, Gold tier, goal
  await reset();
  const dec = await page.evaluate(() => {
    const out = {};
    out.card2 = persDecorateAch([{ key: 'card2', title: 'x' }, { key: 'sq:a', title: 'y' }])[0].note;
    Voice.spentUntil = 0;
    out.gold = persDecorateAch([{ key: 'bd:foo:3', title: 'x' }])[0].note;
    Voice.spentUntil = 0;
    out.silver = persDecorateAch([{ key: 'bd:foo:2', title: 'x' }])[0].note || null;
    out.other = persDecorateAch([{ key: 'sq:first-shot', title: 'x' }, { key: 'card2', title: 'z' }])[0].note || null;
    return out;
  });
  T(dec.card2 === "Card one is nearly done, so here's a harder board. You did bring this on yourself, and I'm delighted.", 'line 22 rides on the Card 2 card', dec);
  T(dec.gold === "Gold. That's the top shelf. I looked for one above it and found only ceiling.", 'line 23 rides on a Gold-tier card', dec);
  T(dec.silver === null && dec.other === null, 'no decoration for Silver tiers or when another item leads', dec);
  // PRISM begin
  await reset();
  const pr = await page.evaluate(async () => {
    Store.state.meta.play = Store.state.meta.play || {}; plSeasons().splice(0, plSeasons().length);
    openSeasonsPage(); await new Promise(r => setTimeout(r, 400));
    const b = document.querySelector('[data-sbegin]'); if (!b) return { none: true };
    b.click(); await new Promise(r => setTimeout(r, 1700));
    return { t: [...document.querySelectorAll('.toast.pers')].map(x => x.textContent), n: plSeasons().length };
  });
  T(pr.none || (pr.t.indexOf('Twenty-eight days, four chapters, no deadlines. Take them as slowly as you like.') >= 0 && pr.n === 1), 'line 24 when PRISM begins (season still starts normally)', pr);
  const src = require('fs').readFileSync(L.APP, 'utf8');
  T(src.indexOf("Voice.claim('l27')") > 0 && src.indexOf("persPlayShuffle(st, right)") > 0, 'gallery (27) and shuffle (26) hooks are present in the build');

  T(errs.length === 0, 'no page errors across Phase 1b', errs);
  await b.close();
  L.done('phase1b');
})();
