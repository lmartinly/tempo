const L = require('./lib');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await L.launch(); const data = L.backup();
  const T = (c, n, e) => L.ok(c, n, e);
  const open = (o = {}) => L.open(b, Object.assign({ data, wait: 2200 }, o));
  const reset = page => page.evaluate(() => { Eggs.st.cap = { day: '', p3: 0, p4: 0 }; Eggs.st.cnt = {}; Eggs.st.seen = {}; Eggs.st.disc = {}; Eggs.st.ep = {}; Voice.spentUntil = 0; Voice.capCache = {}; Celebrate.close(); document.querySelectorAll('.toast,.sheet-wrap').forEach(t => t.remove()); Pages.popAll(); });
  const note = page => page.evaluate(() => [...document.querySelectorAll('.pers-note')].map(x => x.textContent));
  const toasts = page => page.evaluate(() => [...document.querySelectorAll('.toast.pers')].map(t => t.textContent));
  const norm = s => (s || '').replace(/^✉️ /, '');

  {
    const { page, errs } = await open();
    T(errs.length === 0, 'Phase 2 build boots without errors', errs);
    /* --- m1 --- */
    await reset(page);
    await page.evaluate(async () => { openWorkoutsPage(); await new Promise(r => setTimeout(r, 350)); });
    let n = (await note(page)).map(norm);
    T(n[0] === "Fourteen workouts, every one on a Monday, Wednesday or Friday. That isn't a schedule, it's a treaty, and you're honoring it with alarming dignity.", 'moment 1: the treaty (retro, once, on the Workouts page)', n);
    await page.evaluate(async () => { Voice.capCache = {}; Pages.popAll(); await new Promise(r => setTimeout(r, 300)); Voice.spentUntil = 0; openWorkoutsPage(); await new Promise(r => setTimeout(r, 350)); });
    T((await note(page)).length === 0, 'moment 1 never repeats');
    /* --- m2 --- */
    await reset(page);
    await page.evaluate(async () => { openRecordsPage(); await new Promise(r => setTimeout(r, 350)); });
    n = (await note(page)).map(norm);
    T(n[0] === "Eighty point four tonnes so far. I'd round it to 'a lot', but you've earned the decimal.", 'moment 2: the tonnes', n);
    await page.evaluate(() => { const mk = kg => { Store.state.workouts.push({ id: 'big', dateTime: new Date().toISOString(), entries: [{ name: 'x', kind: 'strength', sets: [{ kg, reps: 1 }] }] }); }; mk(25000); Voice.capCache = {}; Eggs.st.seen = {}; Voice.spentUntil = 0; Pages.popAll(); });
    await sleep(300);
    await page.evaluate(async () => { openRecordsPage(); await new Promise(r => setTimeout(r, 350)); });
    n = (await note(page)).map(norm);
    T(n[0] === 'A hundred tonnes. The round number finally showed up, and I gave the decimal the day off.', 'moment 2: hundred-tonne variant', n);
    await page.evaluate(() => { Store.state.workouts = Store.state.workouts.filter(w => w.id !== 'big'); });
    /* --- m6 --- */
    await reset(page);
    await page.evaluate(async () => { openWeightPage(); await new Promise(r => setTimeout(r, 350)); });
    n = (await note(page)).map(norm);
    T(n[0] === "October 31: 80,9 kg. That's the exact midpoint between your first recorded weigh-in and the goal you set, down to the decimal. The goal is yours; the arithmetic is just backing you up.", 'moment 6: the exact midpoint (goal-based, no judgement)', n);
    /* --- m4 + cat --- */
    await reset(page);
    const cal = await page.evaluate(async () => {
      openCalendarPage(); await new Promise(r => setTimeout(r, 300));
      calState.y = 2026; calState.m = 10; calState.selKey = '2026-11-13'; Pages.render(); await new Promise(r => setTimeout(r, 400));
      const cats = [...document.querySelectorAll('.cal-cat')].map(c => ({ mv: c.dataset.mv, num: c.parentNode.querySelector('.num').textContent }));
      return { notes: [...document.querySelectorAll('.pers-note')].map(x => x.textContent), cats };
    });
    T(norm(cal.notes[0]) === "November 13: a Friday the 13th, exactly twenty weeks after your first recorded entry, and a day you trained. If I believed in omens, I'd be insufferable about this.", 'moment 4: the 13th', cal.notes);
    T(cal.cats.length === 1 && cal.cats[0].num === '13' && cal.cats[0].mv === 'first', 'cat sits on Friday Nov 13 (first visit uses the sit-and-blink)', cal.cats);
    const cal2 = await page.evaluate(async () => {
      const out = {};
      for (const [y, m] of [[2026, 8], [2026, 1], [2026, 2], [2026, 10]]) { calState.y = y; calState.m = m; Pages.render(); await new Promise(r => setTimeout(r, 200)); out[y + '-' + m] = [...document.querySelectorAll('.cal-cat')].length; }
      return out;
    });
    T(cal2['2026-8'] === 0 && cal2['2026-1'] === 1 && cal2['2026-2'] === 1 && cal2['2026-10'] === 1, 'cat only on Friday-the-13th cells, including past ones', cal2);
    const aug = await page.evaluate(async () => { calState.y = 2027; calState.m = 7; Pages.render(); await new Promise(r => setTimeout(r, 200)); const c = document.querySelectorAll('.cal-cat'); return { n: c.length, mv: c[0] && c[0].dataset.mv }; });
    T(aug.n === 1 && aug.mv !== 'first', 'future Friday the 13th (Aug 2027): cat present, later visits vary', aug);
    await page.evaluate(() => { Pages.popAll(); });
    /* --- m5 --- */
    await reset(page);
    await page.evaluate(() => openStudioPage());
    await sleep(1800);
    let t = await toasts(page);
    T(t.length === 1 && t[0].indexOf("Surprise Me chose Energy as your lens. I'd love to claim intuition, but it was a coin toss with extra steps.") === 0, 'moment 5: the prism pick', t);
    T(t[0] && t[0].indexOf(" The Studio is unlocked and the Gallery is empty, which isn't a problem, just a very clean wall.") > 0, 'moment 5: empty-Gallery sentence only because the Gallery is empty', t);
    await page.evaluate(() => { Pages.popAll(); document.querySelectorAll('.toast').forEach(x => x.remove()); Voice.spentUntil = 0; });
    await page.evaluate(() => openStudioPage()); await sleep(1500);
    T((await toasts(page)).length === 0, 'moment 5 never repeats');
    /* --- m7 --- */
    await reset(page);
    const bn = [];
    for (let i = 0; i < 4; i++) bn.push(await page.evaluate(async () => { Voice.spentUntil = 0; Voice.capCache = {}; openBingoPage(); await new Promise(r => setTimeout(r, 300)); const x = document.querySelector('.pers-note'); const r = x ? x.textContent : null; Pages.popAll(); await new Promise(r => setTimeout(r, 300)); return r; }));
    T(norm(bn[0]) === "Card One: sixteen squares, sixteen filled. I built it as something to chase and you caught the lot. I'm choosing to take that personally.", 'moment 7: Card One complete', bn);
    T(norm(bn[1]) === 'Card Two has 4 squares done and a long way to go. Good. I wrote it hard on purpose.', 'moment 7: Card Two live count read from the data', bn);
    T(norm(bn[2]) && norm(bn[2]).indexOf('BINGO! Sorry') === 0 && bn[3] === null, 'then the line caption, then nothing', bn);
    await page.evaluate(() => { Eggs.st.seen = {}; });
    const fb = await page.evaluate(async () => { Voice.spentUntil = 0; Voice.capCache = {}; const orig = bingoState; const s1 = bingoState(1); bingoState = c => { const r = orig(c); if (c === 1) return Object.assign({}, r, { done: 12, lines: [] }); return r; }; openBingoPage(); await new Promise(r => setTimeout(r, 300)); const x = (document.querySelector('.pers-note') || {}).textContent || null; bingoState = orig; Pages.popAll(); return x; });
    T(norm(fb) === "Card Two is open. Card One isn't even finished and you've already moved on to the sequel.", 'moment 7: fallback never claims a full Card One the data does not show', fb);
    /* --- m8 --- */
    await reset(page);
    await page.evaluate(() => { const dk = dateKey(new Date()); const ex = Store.state.checkIns.find(c => c.dateKey === dk); Actions.saveCheckIn({ id: ex ? ex.id : null, dateKey: dk, nothingToReport: false, appetite: 3, gi: [], energy: 4, sleepHours: 7, proteinG: 50, kcal: 1500, note: '' }); Voice.spentUntil = 0; document.querySelectorAll('.toast').forEach(x => x.remove()); Eggs.st.seen = {}; Eggs.st.cnt = {}; });
    await page.evaluate(() => { const dk = dateKey(new Date()); const ex = Store.state.checkIns.find(c => c.dateKey === dk); Actions.saveCheckIn(Object.assign({}, ex, { energy: 5 })); });
    await sleep(1400);
    t = await toasts(page);
    T(t.indexOf('Energy: 5 out of 5. A first, in all this time. I had started to suspect the top rating was a rumor.') >= 0, 'moment 8: the first 5 out of 5', t);
    await page.evaluate(() => { Voice.spentUntil = 0; document.querySelectorAll('.toast').forEach(x => x.remove()); const dk = dateKey(new Date()); const ex = Store.state.checkIns.find(c => c.dateKey === dk); Actions.saveCheckIn(Object.assign({}, ex, { energy: 5, note: 'again' })); });
    await sleep(1400);
    T((await toasts(page)).indexOf('Energy: 5 out of 5. A first, in all this time. I had started to suspect the top rating was a rumor.') < 0, 'moment 8 only once');
    /* --- m3 --- */
    const save = (title, entries) => page.evaluate(async ({ title, entries }) => { Voice.spentUntil = 0; document.querySelectorAll('.toast,.sheet-wrap').forEach(x => x.remove()); Celebrate.close(); Eggs.st.cnt = {}; Eggs.st.cap = { day: '', p3: 0, p4: 0 }; Store.state.meta.workoutDraft = newDraft({ dayName: title, entries }); await finishWorkout(); }, { title, entries });
    const ent = (nm, kind) => ({ name: nm, equipId: null, kind, phase: 'main', region: 'other', sets: [{ kg: kind === 'strength' ? 1 : '', reps: kind === 'strength' ? 1 : '', min: kind === 'treadmill' ? 5 : '', incline: '', speed: '', done: true }] });
    await reset(page);
    await save('lose yourself', [ent('Zed move', 'strength')]); await sleep(1400);
    t = await toasts(page);
    T(t.indexOf('lose yourself, a third night. The residency has been extended and the critics are cautiously optimistic.') >= 0, 'moment 3: a repeated title earns its line (third night)', t);
    await save('Rage', [ent('Treadmill', 'treadmill'), ent('Leg Press', 'strength')]); await sleep(1400);
    t = await toasts(page);
    T(t.indexOf('Rage again. The warm-up remains impeccable.') >= 0, 'moment 3: Rage again (same warm-up structure)', t);
    await save('PMDD', [ent('Treadmill', 'treadmill'), ent('Leg Press', 'strength')]); await sleep(1400);
    T((await toasts(page)).length === 0, 'moment 3: a title that names a health condition gets no riff at all');
    await save('Migraine day', [ent('Leg Press', 'strength')]); await sleep(1200);
    T((await toasts(page)).length === 0, 'moment 3: health-condition words are silent');
    await page.close();
  }

  /* ---------- micro-surprises ---------- */
  {
    const { page, errs } = await open({ data: Object.assign({}, data, { settings: Object.assign({}, data.settings, { theme: 'planner' }) }) });
    await reset(page);
    T(await page.evaluate(() => document.documentElement.getAttribute('data-theme')) === 'planner', 'planner theme active');
    // interactive taps do not count
    const spot = await page.evaluate(() => { for (let y = innerHeight - 8; y > 100; y -= 14) for (let x = 6; x < innerWidth - 6; x += 18) { const el = coffeeEmptySpot({ clientX: x, clientY: y, target: document.body }); if (el) { window.__empty = { x, y }; return { x, y }; } } return null; });
    const ctl = await page.evaluate(() => { const bt = [...document.querySelectorAll('#root button')].find(x => x.getBoundingClientRect().width > 20 && x.getBoundingClientRect().top > 0 && x.getBoundingClientRect().bottom < innerHeight); const r = bt.getBoundingClientRect(); const ev = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, target: bt }; return { ctl: coffeeEmptySpot(ev) === null, empty: !!window.__empty }; });
    T(ctl.ctl && ctl.empty, 'coffee ring: controls are never "empty", the page margin is', ctl);
    for (let i = 0; i < 5; i++) { await page.mouse.click(spot.x, spot.y); await sleep(120); }
    T((await page.evaluate(() => document.querySelectorAll('.coffee-ring').length)) === 1, 'coffee ring: five quick taps on an empty stretch');
    const ring = await page.evaluate(() => { const r = document.querySelector('.coffee-ring'); return { pe: getComputedStyle(r).pointerEvents, aria: r.getAttribute('aria-hidden'), blend: getComputedStyle(r).mixBlendMode }; });
    T(ring.pe === 'none' && ring.aria === 'true' && ring.blend === 'multiply', 'coffee ring does not intercept input and never hides text', ring);
    for (let i = 0; i < 5; i++) { await page.mouse.click(spot.x + 2, spot.y); await sleep(120); }
    T((await page.evaluate(() => document.querySelectorAll('.coffee-ring').length)) === 2, 'a second set overlaps the first');
    T((await page.evaluate(() => !!Eggs.st.disc.coffee)), 'discovery date recorded (for the Archive)');
    await page.evaluate(() => Handlers['set-theme']({ dataset: { themeId: 'classic' } })); await sleep(200);
    await page.evaluate(() => { document.querySelectorAll('.coffee-ring').forEach(x => x.remove()); });
    for (let i = 0; i < 5; i++) { await page.mouse.click(spot.x, spot.y); await sleep(100); }
    T((await page.evaluate(() => document.querySelectorAll('.coffee-ring').length)) === 0, 'coffee ring only in the Planner theme');
    T(errs.length === 0, 'no errors', errs);
    await page.close();
  }
  {
    const { page } = await open({ data: Object.assign({}, data, { settings: Object.assign({}, data.settings, { theme: 'sage' }) }) });
    await reset(page);
    const before = await page.evaluate(() => JSON.stringify(Store.state.settings));
    await page.evaluate(() => { openSettingsPage(); });
    await sleep(400);
    const seqTap = async ids => { for (const id of ids) { await page.evaluate(id => Handlers['set-theme']({ dataset: { themeId: id } }), id); await sleep(250); } };
    await seqTap(['classic', 'planner', 'sage', 'sunset', 'midnight']);
    await sleep(700);
    T(await page.evaluate(() => !!document.querySelector('.sw-day')), 'five swatches: the day sweeps across the screen');
    T(await page.evaluate(() => getComputedStyle(document.getElementById('fx')).pointerEvents) === 'none', 'overlay never intercepts taps');
    const th = await page.evaluate(() => [...document.querySelectorAll('.toast.pers')].length);
    T(th === 0, 'no personality toast during the day (Sunset/Midnight lines are held back)', th);
    await sleep(5400);
    const after = await page.evaluate(() => ({ s: JSON.stringify(Store.state.settings), dt: document.documentElement.getAttribute('data-theme'), sw: !!document.querySelector('.sw-day'), meta: document.querySelector('meta[name="theme-color"]').getAttribute('content'), set: Store.state.settings.theme }));
    T(!after.sw, 'overlay removed after five seconds');
    T(after.set === 'sage' && after.dt === 'sage', 'her own theme is back (settings and <html data-theme>)', after);
    T(after.s === before, 'settings are byte-identical to before the sequence', { before: before.slice(0, 200), after: after.s.slice(0, 200) });
    T(after.meta === '#EEF1E8', 'theme-color restored', after.meta);
    // wrong order: nothing
    await seqTap(['classic', 'sage', 'planner', 'sunset', 'midnight']); await sleep(600);
    T(!(await page.evaluate(() => !!document.querySelector('.sw-day'))), 'wrong order does nothing');
    await page.evaluate(() => Handlers['set-theme']({ dataset: { themeId: 'sage' } }));
    // too slow: nothing
    await page.evaluate(() => { Swatch.seq = []; });
    // new choice during the day cancels it without overriding her choice
    await seqTap(['classic', 'planner', 'sage', 'sunset', 'midnight']); await sleep(700);
    await page.evaluate(() => Handlers['set-theme']({ dataset: { themeId: 'classic' } })); await sleep(300);
    T(await page.evaluate(() => !document.querySelector('.sw-day') && Store.state.settings.theme === 'classic'), 'choosing a theme mid-animation cancels it and keeps her new choice');
    await page.close();
  }
  {
    const { page } = await open({ data: Object.assign({}, data, { settings: Object.assign({}, data.settings, { theme: 'sage' }) }), reducedMotion: true });
    await reset(page);
    for (const id of ['classic', 'planner', 'sage', 'sunset', 'midnight']) { await page.evaluate(id => Handlers['set-theme']({ dataset: { themeId: id } }), id); await sleep(200); }
    await sleep(700);
    T(await page.evaluate(() => !!document.querySelector('.sw-day.sw-reduced')), 'reduced motion: a two-second crossfade instead of the sweep');
    T(await page.evaluate(() => !document.querySelector('.sw-sun')), 'reduced motion: no sun, stars or shooting star');
    await sleep(2400);
    T(await page.evaluate(() => !document.querySelector('.sw-day') && Store.state.settings.theme === 'sage'), 'reduced motion: her theme restored');
    await page.close();
  }
  {
    const { page } = await open();
    await reset(page);
    // twin numbers on saved history
    const tw = await page.evaluate(async () => {
      const rec = Actions.saveWorkout({ id: null, dateTime: new Date(Date.now() - 3 * DAY).toISOString(), programId: null, programName: '', dayName: 'Twin test', note: '', entries: [{ name: 'Zed press', equipId: null, kind: 'strength', phase: 'main', region: 'other', sets: [{ kg: 12, reps: 12 }, { kg: 40, reps: 10 }] }] });
      const snap = JSON.stringify(Store.state.workouts);
      openWorkoutDetailSheet(rec.id, false); await new Promise(r => setTimeout(r, 400));
      const twins = document.querySelectorAll('.twin');
      const txt = [...document.querySelectorAll('.sheet-wrap .kv b')].map(x => x.textContent).join('|');
      twins[0].click(); await new Promise(r => setTimeout(r, 100));
      return { n: twins.length, hop: twins[0].classList.contains('hop'), same: snap === JSON.stringify(Store.state.workouts), txt, disc: !!Eggs.st.disc.twins };
    });
    T(tw.n === 1 && tw.hop && tw.same && tw.disc, 'twin numbers: only the matching pair, hops on tap, records untouched', tw);
    T(/12×12/.test(tw.txt.replace(/\s/g, '')) && /40×10/.test(tw.txt.replace(/\s/g, '')), 'sets text unchanged', tw.txt);
    await page.evaluate(() => { document.querySelectorAll('.sheet-wrap').forEach(x => x.remove()); });
    // the Wave
    const wv = await page.evaluate(async () => {
      Pages.popAll(); await new Promise(r => setTimeout(r, 300)); openHeatmapPage(); await new Promise(r => setTimeout(r, 400));
      const lg = [...document.querySelectorAll('.heat-legend i.hc')].filter(x => /l[0-4]/.test(x.className));
      lg.slice().reverse().forEach(x => x.click());                       // wrong order
      const wrong = document.querySelectorAll('.hc.wv, .hc.wv-warm, .hc.wv-still').length;
      lg.forEach(x => x.click());                                         // lightest -> darkest
      await new Promise(r => setTimeout(r, 200));
      const on = document.querySelectorAll('.hc.wv').length, warm = document.querySelectorAll('.hc.wv-warm').length, big = document.querySelectorAll('.hc.wv-big').length;
      await new Promise(r => setTimeout(r, 4500));
      return { wrong, on, warm, big, left: document.querySelectorAll('.hc.wv, .hc.wv-warm, .hc.wv-big').length, trained: workoutDayKeys().length };
    });
    T(wv.wrong === 0, 'wave: wrong order does nothing', wv);
    T(wv.on > 0 && wv.warm === wv.trained && wv.big === 1, 'wave: ripples over visible days, trained days warm, biggest session once', wv);
    T(wv.left === 0, 'wave settles completely', wv);
    await page.close();
  }
  {
    const { page } = await open();
    await reset(page);
    // perfect match
    const pm = await page.evaluate(async () => {
      labState = null; const s = labInit(); const body = document.createElement('div');
      for (let i = 0; i < 3; i++) { s.a = 'sleep'; s.b = 'energy'; labRender(body); s.b = 'sleep'; labRender(body); labRender(body); await new Promise(r => setTimeout(r, 40)); if (i < 2) { const c = !!document.getElementById('pm-card'); if (c) return { early: true }; } }
      await new Promise(r => setTimeout(r, 300));
      const el = document.getElementById('pm-card'); if (!el) return { none: true, cnt: Eggs.st.cnt.pm };
      return { txt: el.innerText.replace(/\s+/g, ' '), cnt: Eggs.st.cnt.pm, stat: /r\s*=|scatter|correlation/i.test(el.innerText), btn: el.querySelector('#pm-back').textContent };
    });
    T(!pm.early && !pm.none, 'perfect match: only on the third time', pm);
    T(pm.txt && pm.txt.indexOf("It's a match!") >= 0 && pm.txt.indexOf('Compatibility: 100%. Shared interests: everything. Dealbreakers: none.') >= 0 && pm.stat === false && pm.btn === 'Back to serious statistics', 'perfect match: card text, no statistics, one button', pm);
    await page.evaluate(() => document.getElementById('pm-back').click());
    T(await page.evaluate(() => !document.getElementById('pm-card')), 'back button dismisses it');
    await page.evaluate(async () => { const s = labInit(); const body = document.createElement('div'); for (let i = 0; i < 3; i++) { s.b = 'energy'; labRender(body); s.b = 'sleep'; labRender(body); } await new Promise(r => setTimeout(r, 300)); });
    T(await page.evaluate(() => !document.getElementById('pm-card')), 'perfect match is not repeated');
    await page.close();
  }
  /* ---------- Turkish mode: every Phase 2 surface stays silent ---------- */
  {
    const { page } = await open({ lang: 'tr', data: Object.assign({}, data, { settings: Object.assign({}, data.settings, { theme: 'planner' }) }) });
    const step = async fn => { await page.evaluate(fn); await sleep(500); await page.evaluate(() => { Pages.popAll(); }); await sleep(400); };
    const r = { cat: 0, notes: 0, bn: 0 };
    await step(() => { openWorkoutsPage(); }); r.notes += await page.evaluate(() => document.querySelectorAll('.pers-note').length);
    await step(() => { openRecordsPage(); });
    await step(() => { openWeightPage(); });
    await page.evaluate(() => { openCalendarPage(); calState.y = 2026; calState.m = 10; calState.selKey = '2026-11-13'; Pages.render(); }); await sleep(500);
    r.cat = await page.evaluate(() => document.querySelectorAll('.cal-cat').length); r.notes += await page.evaluate(() => document.querySelectorAll('.pers-note').length);
    await page.evaluate(() => { Pages.popAll(); }); await sleep(400);
    await page.evaluate(() => { openBingoPage(); }); await sleep(400); r.bn = await page.evaluate(() => document.querySelectorAll('.pers-note').length);
    await page.evaluate(() => { Pages.popAll(); }); await sleep(400);
    await page.evaluate(() => { openStudioPage(); }); await sleep(1500);
    await page.evaluate(() => { Pages.popAll(); }); await sleep(300);
    await page.evaluate(() => { for (const id of ['classic', 'planner', 'sage', 'sunset', 'midnight']) Handlers['set-theme']({ dataset: { themeId: id } }); }); await sleep(800);
    Object.assign(r, await page.evaluate(() => ({ sw: !!document.querySelector('.sw-day'), toasts: document.querySelectorAll('.toast.pers').length, eggs: JSON.stringify(Store.state.meta.eggs) })));
    T(r.cat === 0 && r.notes === 0 && r.bn === 0 && !r.sw && r.toasts === 0, 'TR: no notes, cat, swatches or toasts', r);
    const e = JSON.parse(r.eggs);
    T(Object.keys(e.seen).length === 0 && Object.keys(e.disc).length === 0 && Object.keys(e.cnt).length === 0, 'TR: nothing recorded', e);
    await page.close();
  }
  await b.close();
  L.done('phase2');
})();
