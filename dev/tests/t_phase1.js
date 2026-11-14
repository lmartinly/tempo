const L = require('./lib');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await L.launch();
  const data = L.backup();
  const open = async (o = {}) => L.open(b, Object.assign({ data, wait: 2200 }, o));
  const reset = page => page.evaluate(() => { Eggs.st.cap = { day: '', p3: 0, p4: 0 }; Eggs.st.cnt = {}; Eggs.st.seen = {}; Voice.spentUntil = 0; Voice.capCache = {}; Celebrate.close(); document.querySelectorAll('.toast').forEach(t => t.remove()); });
  const toasts = page => page.evaluate(() => [...document.querySelectorAll('.toast.pers')].map(t => t.textContent));
  const T = (cond, name, extra) => L.ok(cond, name, extra);

  /* ---------- 1. significant-PB rule ---------- */
  {
    const { page, errs } = await open();
    T(errs.length === 0, 'EN boot without errors with Phase 1 code', errs);
    const u = await page.evaluate(() => ({
      few: isSignificantPB(1, 50, 80), none: isSignificantPB(0, 50, 80),
      pctOnly: isSignificantPB(5, 10, 11.5),      // +15 % but only 1.5 kg
      kgOnly: isSignificantPB(5, 100, 110),       // +10 kg but only 10 %
      both: isSignificantPB(2, 60, 72),           // +20 % and +12 kg
      edgeKg: isSignificantPB(3, 50, 57.5),       // exactly +15 % and +7.5 kg
      edgeBoth: isSignificantPB(3, 20, 23),       // exactly +15 % and +3 kg
      edgeLow: isSignificantPB(3, 20, 22.9),      // 14.5 %
      edgeKg2: isSignificantPB(3, 10, 12.5),      // +25 % and exactly +2.5 kg
      edgeKg3: isSignificantPB(3, 10, 12.4)       // +2.4 kg
    }));
    T(u.few === false && u.none === false, 'significant PB needs >= 2 earlier sessions', u);
    T(u.pctOnly === false && u.kgOnly === false, 'both thresholds are required', u);
    T(u.both === true && u.edgeKg === true && u.edgeBoth === true && u.edgeLow === false && u.edgeKg2 === true && u.edgeKg3 === false, 'threshold boundaries', u);
    const t = await page.evaluate(() => {
      const ws = Store.state.workouts.slice().sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
      let prs = 0, raw = 0, fin = 0; const fins = [];
      ws.forEach(w => (w.entries || []).forEach(e => {
        if (!isStrength(e.kind)) return;
        const hist = exerciseHistory(e.name, new Date(w.dateTime).getTime(), w.id); if (!hist.length) return;
        const before = exerciseBest(hist), now = exerciseBest([{ e }]);
        if (now.e1 > before.e1 + 0.01) {
          prs++;
          if ((r1(now.e1) - r1(before.e1)) >= 2.5 - 1e-9 && now.e1 >= before.e1 * 1.15 - 1e-9) raw++;
          if (isSignificantPB(hist.length, before.e1, now.e1)) { fin++; fins.push(e.name); }
        }
      }));
      return { prs, raw, fin, fins };
    });
    console.log('  real-history PB table:', JSON.stringify(t));
    T(t.prs === 13 && t.raw === 9 && t.fin === 2, 'real history: 13 standard PRs, 9 pass raw thresholds, 2 significant after the 2-session guard', t);
    await page.close();
  }

  /* ---------- 2. finish a workout with a PR (EN) ---------- */
  const finishWith = async (page, wide) => page.evaluate(async (wide) => {
    const ws = Store.state.workouts;
    // pick the strength exercise with the most sessions
    const cnt = {}; ws.forEach(w => w.entries.forEach(e => { if (isStrength(e.kind)) cnt[normName(e.name)] = (cnt[normName(e.name)] || 0) + 1; }));
    const nm = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    const hist = exerciseHistory(nm, null, null), best = exerciseBest(hist);
    const ex = hist[0].e;
    const kg = wide ? Math.round(best.kg * 1.4) : Math.round(best.kg + 5);
    Store.state.meta.workoutDraft = newDraft({ entries: [{ name: ex.name, equipId: ex.equipId || null, kind: ex.kind, phase: 'main', region: ex.region, sets: [{ kg, reps: 8, done: true }] }] });
    const before = Store.state.workouts.length;
    await finishWorkout();
    return { name: ex.name, kg, before, after: Store.state.workouts.length };
  }, wide);
  {
    const { page } = await open();
    await reset(page);
    const r = await finishWith(page, true);
    await sleep(500);
    const c = await page.evaluate(() => ({ el: !!Celebrate.el, title: (document.querySelector('.cel-title') || {}).textContent, kicker: (document.querySelector('.cel-kicker') || {}).textContent, note: (document.querySelector('.cel-note') || {}).textContent }));
    T(r.after === r.before + 1, 'workout saved', r);
    T(c.el && c.kicker === 'Personal record' && c.title === r.name, 'standard PR Celebrate still appears', c);
    T(c.note && c.note.indexOf("That record wasn't beaten. It was left behind in the middle distance.") >= 0, 'significant PB: wide-margin line rides on the Celebrate card', c);
    const s = await page.evaluate(() => Object.keys(Eggs.st.seen));
    T(s.length === 1 && s[0] === 'lp5', 'only one voice consumed', s);
    // next PR: pool rotates, never repeats lp5
    await page.evaluate(() => { Celebrate.close(); Voice.spentUntil = 0; Eggs.st.cap = { day: '', p3: 0, p4: 0 }; Eggs.st.cnt = {}; document.querySelectorAll('.sheet-wrap').forEach(x => x.remove()); });
    await finishWith(page, false); await sleep(400);
    const c2 = await page.evaluate(() => (document.querySelector('.cel-note') || {}).textContent || null);
    T(c2 && /PERSONAL BEST!|new personal best on/.test(c2) && c2.indexOf("left behind") < 0, 'second PB uses a different line from the pool', c2);
    await page.close();
  }
  /* ---------- 3. same flow in TR: PR still celebrated, no English personality, no state ---------- */
  {
    const { page } = await open({ lang: 'tr' });
    await finishWith(page, true); await sleep(600);
    const c = await page.evaluate(() => ({ el: !!Celebrate.el, note: (document.querySelector('.cel-note') || {}).textContent || null, eggs: JSON.stringify(Store.state.meta.eggs) }));
    T(c.el, 'TR: standard PR Celebrate still appears');
    T(c.note === null, 'TR: no personality note on the card', c.note);
    const e = JSON.parse(c.eggs);
    T(Object.keys(e.seen).length === 0 && Object.keys(e.cnt).length === 0 && e.seeded === false, 'TR: personality state untouched', e);
    await page.close();
  }

  /* ---------- 4. routine lines ---------- */
  {
    const { page } = await open();
    await reset(page);
    // check-in: nothing to report today
    await page.evaluate(() => { const dk = dateKey(new Date()); const ex = Store.state.checkIns.find(c => c.dateKey === dk); if (ex) Actions.deleteCheckIn(ex.id); Voice.spentUntil = 0; Eggs.st.seen = {}; Eggs.st.cnt = {}; Eggs.st.cap = { day: '', p3: 0, p4: 0 }; document.querySelectorAll('.toast').forEach(t => t.remove()); logNothingToReportToday(); });
    await sleep(1300);
    let t = await toasts(page);
    T(t.indexOf("Nothing to report. Suspiciously calm, but I'll allow it.") >= 0, 'line 1 after Nothing to report (first eligible)', t);
    // full check-in with protein target met: Little Praise outranks the routine line
    await reset(page);
    const tg = await page.evaluate(() => {
      const dk = dateKey(new Date()); const ex = Store.state.checkIns.find(c => c.dateKey === dk);
      Store.state.settings.proteinTarget = 100;
      Actions.saveCheckIn({ id: ex ? ex.id : null, dateKey: dk, nothingToReport: false, appetite: 3, gi: [], energy: 4, sleepHours: 7, proteinG: 120, kcal: 1800, note: '' });
      return 100;
    });
    await sleep(1300);
    t = await toasts(page);
    T(t.length === 1 && t[0] === '100 grams, handled. Efficient and a little smug, and I approve of both.', 'protein target: Little Praise wins over the routine line (one voice)', t);
    // saving the same day again does not repeat
    await page.evaluate(() => { Voice.spentUntil = 0; const dk = dateKey(new Date()); const ex = Store.state.checkIns.find(c => c.dateKey === dk); Actions.saveCheckIn(Object.assign({}, ex, { note: 'x' })); });
    await sleep(1300);
    t = await toasts(page);
    T(t.length === 1, 'no repeat on re-save', t);
    // weigh-in higher than last
    await reset(page);
    await page.evaluate(() => { const last = dailyWeightSeries().slice(-1)[0]; Actions.saveWeight({ id: null, kg: Math.round((last.kg + 0.8) * 10) / 10, dateTime: new Date().toISOString(), note: '' }); });
    await sleep(1400);
    t = await toasts(page);
    T(t.indexOf('A bit up on last time. Water, salt, timing and plain chance all get a vote on that number. The trend is what counts.') >= 0, 'line 4 after a higher weigh-in', t);
    // weigh-in lower: silent
    await reset(page);
    await page.evaluate(() => { const last = dailyWeightSeries().slice(-1)[0]; Actions.saveWeight({ id: null, kg: Math.round((last.kg - 0.5) * 10) / 10, dateTime: new Date().toISOString(), note: '' }); });
    await sleep(1400);
    t = await toasts(page);
    T(t.length === 0, 'a lower weigh-in stays quiet', t);
    // checklist all five
    await reset(page);
    const n5 = await page.evaluate(() => { const items = Store.state.settings.checklistItems; Store.state.checklist = { dateKey: dateKey(new Date()), done: items.map((_, i) => i < 4) }; return items.length; });
    if (n5 === 5) { await page.evaluate(() => Actions.toggleChecklist(4)); await sleep(1300); t = await toasts(page); T(t.indexOf("Five for five. I had a speech prepared, but you're clearly not someone who needs one.") >= 0, 'line 2 on the fifth box', t); }
    else console.log('  (checklist has', n5, 'items; line 2 requires exactly 5)');
    // workout start
    await reset(page);
    await page.evaluate(() => { Store.state.meta.workoutDraft = null; startEmptyWorkout(); });
    await sleep(2000);
    t = await toasts(page);
    T(t.indexOf("Workout started. I've cleared my schedule, which was empty, but still.") >= 0, 'line 8 on workout start', t);
    await page.evaluate(() => { Store.state.meta.workoutDraft = null; Pages.popAll(); });
    // themes
    await reset(page);
    await page.evaluate(() => Handlers['set-theme']({ dataset: { themeId: 'midnight' } }));
    await sleep(1800);
    t = await toasts(page);
    T(t.indexOf("Midnight theme on. Built for logging things at hours you'd rather not discuss.") >= 0, 'line 28 on Midnight', t);
    await reset(page);
    await page.evaluate(() => Handlers['set-theme']({ dataset: { themeId: 'sunset' } }));
    await sleep(1800);
    t = await toasts(page);
    T(t.indexOf('Sunset. Warm, slightly dramatic, extremely correct. You have taste.') >= 0, 'line 29 on Sunset', t);
    await page.evaluate(() => Handlers['set-theme']({ dataset: { themeId: 'classic' } }));
    // theme setting itself changed normally
    T(await page.evaluate(() => Store.state.settings.theme === 'classic'), 'theme setting behaves normally');
    // backup exported
    await reset(page);
    await page.evaluate(() => { shareFile = async () => {}; Store.state.meta.lastBackupAt = null; });
    await page.evaluate(() => doExport(false));
    await sleep(1800);
    t = await toasts(page);
    T(t.indexOf('Backed up. Somewhere down the line, a disaster just got cancelled.') >= 0, 'Little Praise 2 after a backup', t);
    await page.close();
  }

  /* ---------- 5. overlays, wrapped, heatmap, records, bingo, lab, play ---------- */
  {
    const { page } = await open();
    await reset(page);
    const r0 = await page.evaluate(() => { Celebrate.show([{ emoji: '🎉', title: 'x' }]); const t = Voice.claim('l1'); const seen = !!Eggs.st.seen.l1; Celebrate.close(); return { t, seen }; });
    T(r0.t === null && !r0.seen, 'a celebration suppresses personality and the line is not consumed', r0);
    // week wrapped opens over the Story
    await reset(page);
    await page.evaluate(() => Handlers['open-weekwrapped']({ dataset: {} }));
    await sleep(1500);
    let t = await toasts(page);
    T(await page.evaluate(() => !!Story.el), 'week wrapped opens normally');
    T(t.indexOf("Your week, recapped. I've been rehearsing this one. Swipe.") >= 0, 'line 19 shows over the Story', t);
    await page.evaluate(() => Story.close());
    // heatmap blank day
    await reset(page);
    const hm = await page.evaluate(async () => {
      openHeatmapPage(); await new Promise(r => setTimeout(r, 400));
      const b = [...document.querySelectorAll('.hc:not(.off)')].find(x => /nothing logged\s*$/.test(heatDetail(heatMetric, x.dataset.k))); if (!b) return { none: true };
      b.click(); await new Promise(r => setTimeout(r, 200));
      return { text: document.querySelector('#heat-detail').innerText };
    });
    T(hm.none || /Nothing logged here\. A blank square isn't a failure, just a day that stayed off the record\./.test(hm.text), 'line 30 under a blank heatmap day (functional detail kept)', hm);
    T(hm.none || /nothing logged/.test(hm.text), 'heatmap functional detail still says nothing logged', hm);
    await page.evaluate(() => Pages.popAll());
    // records: one voice per page open -> moment 2 (tonnes), then 'new longest run', then the heaviest-lift caption
    await reset(page);
    const rec = [];
    for (let i = 0; i < 3; i++) rec.push(await page.evaluate(async () => { Voice.spentUntil = 0; Voice.capCache = {}; openRecordsPage(); await new Promise(r => setTimeout(r, 300)); const a = document.body.innerText; Pages.render(); await new Promise(r => setTimeout(r, 100)); const b2 = document.body.innerText; Pages.popAll(); await new Promise(r => setTimeout(r, 300)); return { a, b: b2 }; }));
    T(/tonnes so far/.test(rec[0].a) && !/New longest run/.test(rec[0].a) && !/kitchen terms/.test(rec[0].a), 'Records visit 1: one voice (moment 2)');
    T(/tonnes so far/.test(rec[0].b), 'caption stays through a re-render in the same session');
    T(/New longest run\. The previous record holder: also you\./.test(rec[1].a) && !/kitchen terms/.test(rec[1].a), 'line 18 on the next visit (one voice per open)');
    const m = rec[2].a.match(/Heaviest lift on record: ([\d,\.]+) kg\. In kitchen terms, that's \1 one-kilo bags of flour, moved with purpose\./);
    T(!!m, 'line 10 on the visit after that, with the real number', m && m[0]);
    // bingo: first open shows card-complete praise, second open the line caption, third nothing
    await reset(page);
    const bn = [];
    for (let i = 0; i < 4; i++) {
      bn.push(await page.evaluate(async () => { Voice.spentUntil = 0; openBingoPage(); await new Promise(r => setTimeout(r, 300)); const n = document.querySelector('.pers-note'); const r = n ? n.textContent : null; Pages.popAll(); await new Promise(r => setTimeout(r, 300)); return r; }));
    }
    T(bn[0] && bn[0].indexOf('Card One: sixteen squares, sixteen filled.') >= 0, 'Bingo: Card One personalized moment on first open (retro, user-opened)', bn);
    T(bn[1] && bn[1].indexOf('Card Two has 4 squares done') >= 0, 'Bingo: Card Two count on second open', bn);
    T(bn[2] && bn[2].indexOf('BINGO! Sorry, it') >= 0, 'Bingo: line caption on third open', bn);
    T(bn[3] === null || bn[3] === undefined, 'Bingo: nothing further', bn);
    // lab captions
    await reset(page);
    const lab = {};
    lab.few = await page.evaluate(() => labStatsHTML('weight', 'energy', { n: 3, enough: false }, 'day', 0));
    lab.nonzero = await page.evaluate(() => labStatsHTML('weight', 'energy', { n: 20, enough: true, r: 0.6, ci: [0.3, 0.8], rho: 0.5 }, 'day', 0));
    lab.zero = await page.evaluate(() => { Voice.spentUntil = 0; return labStatsHTML('weight', 'energy', { n: 20, enough: true, r: 0.1, ci: [-0.2, 0.4], rho: 0.1 }, 'day', 0); });
    T(lab.few.indexOf('Too few points to draw a line, and I refuse to draw a bad one.') >= 0 && lab.few.indexOf('too few for a statement') >= 0, 'line 16 beside the functional too-few message', lab.few.slice(-200));
    T(lab.zero.indexOf('statistics for &#39;no promises&#39;') >= 0 && lab.zero.indexOf('The range includes zero, so this could be chance.') >= 0, 'line 15 when the range includes zero (functional sentence kept)');
    T(lab.nonzero.indexOf('no promises') < 0, 'line 15 absent when the range excludes zero');
    // play
    await reset(page);
    const pw = await page.evaluate(() => {
      const mk = right => { const st = {}, r = { answer: 'a' }; st.pick = right ? 'a' : 'b'; return { st, r }; };
      const out = [];
      Eggs.st.cnt.ww = 0;
      for (let i = 0; i < 3; i++) { Voice.spentUntil = 0; const { st, r } = mk(true); out.push(persPlayWhich(st, r)); }
      Eggs.st.cnt.p3 = 0; Eggs.st.cap = { day: '', p3: 0, p4: 0 };
      const { st, r } = mk(false); Voice.spentUntil = 0; out.push(persPlayWhich(st, r));
      return { out, ww: Eggs.st.cnt.ww };
    });
    T(pw.out[0] === '' && pw.out[1] === '' && /Three in a row\. You know your own history better than I do/.test(pw.out[2]), 'Which Week: praise only on the third right answer in a row', pw.out);
    T(/Wrong, but in a way that deserves partial credit/.test(pw.out[3]) && pw.ww === 0, 'Which Week: wrong guess line and streak reset', pw);
    // dashboard draft left open
    await reset(page);
    const dr = await page.evaluate(() => { Store.state.meta.workoutDraft = newDraft({ startedAt: new Date(Date.now() - 7.4 * 3600000).toISOString() }); renderDashboard(); const a = document.body.innerText; Store.state.meta.workoutDraft = null; renderDashboard(); return a; });
    T(/You still have a workout open, 7 hours and counting\. Finish it, discard it, or tell me it's a very long set\./.test(dr), 'line 6 on the dashboard for a long-open workout');
    await page.close();
  }

  /* ---------- 6. goal reached (state-driven praise) ---------- */
  {
    const { page } = await open();
    await reset(page);
    const g = await page.evaluate(() => { const last = dailyWeightSeries().slice(-1)[0]; Store.state.settings.goalKg = Math.round((last.kg - 1) * 10) / 10; return { goal: Store.state.settings.goalKg, cur: last.kg }; });
    await page.evaluate(({ goal }) => { Eggs.reseed(); Actions.saveWeight({ id: null, kg: goal - 0.2, dateTime: new Date().toISOString(), note: '' }); }, g);
    await sleep(2500);
    const notes1 = await page.evaluate(() => [...document.querySelectorAll('.cel-note')].map(x => x.textContent));
    await page.evaluate(() => { Voice.spentUntil = 0; Handlers['celebrate-close'](); });
    await sleep(2200);
    const all = notes1.concat(await page.evaluate(() => [...document.querySelectorAll('.toast.pers, .cel-note')].map(x => x.textContent)));
    const n = all.filter(x => x.indexOf("You reached the goal you set. Congratulations. I'm so glad I was here for it.") >= 0).length;
    T(n === 1, 'goal reached: line appears exactly once (card note or praise toast)', all);
    await page.close();
  }

  /* ---------- 7. TR: wrappers stay silent ---------- */
  {
    const { page } = await open({ lang: 'tr' });
    await page.evaluate(() => {
      const dk = dateKey(new Date());
      Actions.saveCheckIn({ id: null, dateKey: dk, nothingToReport: false, appetite: 3, gi: [], energy: 4, sleepHours: 7, proteinG: 150, kcal: 1800, note: '' });
      const last = dailyWeightSeries().slice(-1)[0]; Actions.saveWeight({ id: null, kg: last.kg + 1, dateTime: new Date().toISOString(), note: '' });
      Handlers['set-theme']({ dataset: { themeId: 'midnight' } }); Handlers['open-weekwrapped']({ dataset: {} });
      startEmptyWorkout(); Store.state.meta.workoutDraft = null;
      openBingoPage(); openRecordsPage();
    });
    await sleep(2500);
    const r = await page.evaluate(() => ({ pers: document.querySelectorAll('.toast.pers').length, caps: document.querySelectorAll('.pers-cap, .pers-note').length, eggs: JSON.stringify(Store.state.meta.eggs) }));
    T(r.pers === 0 && r.caps === 0, 'TR: no personality toasts or captions anywhere', r);
    const e = JSON.parse(r.eggs);
    T(Object.keys(e.seen).length === 0 && Object.keys(e.cnt).length === 0 && !e.seeded, 'TR: state still untouched after exercising every hook', e);
    await page.close();
  }

  await b.close();
  L.done('phase1');
})();
