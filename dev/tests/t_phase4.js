const L = require('./lib');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await L.launch(); const data = L.backup();
  const T = (c, n, e) => L.ok(c, n, e);
  const open = (o = {}) => L.open(b, Object.assign({ data, wait: 2200 }, o));
  const reset = page => page.evaluate(() => { Eggs.st.cap = { day: '', p3: 0, p4: 0 }; Eggs.st.cnt = {}; Eggs.st.seen = {}; Eggs.st.disc = {}; Eggs.st.ep = {}; Voice.spentUntil = 0; Voice.capCache = {}; Celebrate.close(); Story.close(); Bucky.end(); mnClear(); document.querySelectorAll('.toast,.sheet-wrap').forEach(t => t.remove()); });
  const popAll = async page => { await page.evaluate(() => Pages.popAll()); await page.waitForTimeout(450); };
  const eqT = (a, b, n) => T(JSON.stringify(a) === JSON.stringify(b), n, { got: a, want: b });

  /* ================= Margin Notes ================= */
  {
    const { page, errs } = await open();
    T(errs.length === 0, 'Phase 4 build boots without errors', errs);
    await reset(page);
    await page.evaluate(() => openRecordsPage()); await page.waitForTimeout(600);
    const before = await page.evaluate(() => JSON.stringify({ w: Store.state.workouts, c: Store.state.checkIns, g: Store.state.weights, i: Store.state.injections, s: Store.state.symptoms, m: Store.state.measurements }));
    /* gesture outside the band / horizontal / short: nothing */
    const drag = async (x, y0, y1, x1) => { await page.evaluate(() => { document.body.style.userSelect = 'none'; getSelection().removeAllRanges(); }); await page.mouse.move(x, y0); await page.mouse.down(); for (let i = 1; i <= 6; i++) await page.mouse.move(x + ((x1 == null ? x : x1) - x) * i / 6, y0 + (y1 - y0) * i / 6); await page.mouse.up(); };
    await drag(8, 200, 400); T(await page.evaluate(() => document.querySelectorAll('.mn-note').length) === 0, 'a drag at the very screen edge (OS back-swipe zone) does nothing');
    await drag(40, 300, 330); T(await page.evaluate(() => document.querySelectorAll('.mn-note').length) === 0, 'a short drag does nothing');
    await drag(40, 300, 320, 200); T(await page.evaluate(() => document.querySelectorAll('.mn-note').length) === 0, 'a sideways drag does nothing');
    await drag(300, 200, 400); T(await page.evaluate(() => document.querySelectorAll('.mn-note').length) === 0, 'a drag away from the left margin does nothing');
    /* candidates are real and whitelisted */
    const cands = await page.evaluate(() => { const body = mnTopPage().page.querySelector('.page-body'); return mnCandidates('records', body).map(c => ({ label: (c.el.closest('.row') ? mnLabel(c.el.closest('.row')) : ''), html: c.html.replace(/<[^>]+>/g, '') })); });
    T(cands.length >= 3 && cands.every(c => ['Heaviest lift', 'Biggest session', 'Longest check-in run', 'Current run', 'Longest protein-target run', 'Best protein day', 'Workout days', 'Longest training-week run'].includes(c.label)), 'Records: notes only beside whitelisted rows (never weight, symptoms, measurements)', cands);
    T(cands.some(c => c.label === 'Workout days' && c.html === 'Mon, Wed, Fri. never a Tuesday. admirable. slightly suspicious.'), 'schedule note built from her real workout weekdays', cands);
    const sets = await page.evaluate(() => mnBiggestSets());
    T(cands.some(c => c.label === 'Biggest session' && c.html.startsWith(sets + ' sets.')), 'biggest-session note quotes her real set count', { sets, cands });
    T(cands.some(c => c.label === 'Heaviest lift' && /^☆ [\d.,]+\. noted\.$/.test(c.html)), 'heaviest-lift note: pencil star + value', cands);
    /* the real drag */
    await drag(40, 260, 420);
    const notes = await page.evaluate(() => [...document.querySelectorAll('.mn-note')].map(n => { const cs = getComputedStyle(n); return { t: n.textContent, pe: cs.pointerEvents, fs: parseFloat(cs.fontSize), ff: cs.fontFamily, ital: cs.fontStyle }; }));
    T(notes.length >= 1 && notes.length <= 3, 'a drag shows at most three notes', notes.length);
    T(notes.every(n => n.pe === 'none' && n.fs >= 15 && /cursive/.test(n.ff)), 'pencil notes: never intercept taps, at least 15 px, handwriting stack ending in cursive', notes);
    T(await page.evaluate(() => !!Eggs.st.disc.margin), 'discovery recorded');
    await drag(40, 260, 420);
    T(await page.evaluate(() => document.querySelectorAll('.mn-note').length) <= 3, 'a second drag replaces the notes, never more than three on screen');
    const after = await page.evaluate(() => JSON.stringify({ w: Store.state.workouts, c: Store.state.checkIns, g: Store.state.weights, i: Store.state.injections, s: Store.state.symptoms, m: Store.state.measurements }));
    T(after === before, 'margin notes write nothing to her records');
    await page.waitForTimeout(16800);
    T(await page.evaluate(() => document.querySelectorAll('.mn-note').length) === 0, 'notes fade away after about fifteen seconds');
    /* new personal best */
    await page.evaluate(() => { Store.state.workouts.push({ id: 'nb', dateTime: new Date().toISOString(), dayName: 'Rage', entries: [{ name: 'Leg Press', kind: 'strength', sets: [{ kg: 900, reps: 1 }] }] }); Pages.render(); });
    const bang = await page.evaluate(() => { const body = mnTopPage().page.querySelector('.page-body'); return mnCandidates('records', body).some(c => c.html.includes('mn-bang') && c.html.includes('!!!')); });
    T(bang, 'a new personal best gets "!!!" with a heavy underline');
    await page.evaluate(() => { Store.state.workouts = Store.state.workouts.filter(w => w.id !== 'nb'); });
    /* months later */
    await page.evaluate(() => { Eggs.st.ep.mnFirst = '2026-01-01'; });
    const seen = new Set(); for (let i = 0; i < 80; i++) { const t = await page.evaluate(() => { const body = mnTopPage().page.querySelector('.page-body'); return mnCandidates('records', body).map(c => c.html.replace(/<[^>]+>/g, '')); }); t.forEach(x => seen.add(x)); }
    T([...seen].includes('still here. still reading.'), 'months later: "still here. still reading." becomes available', [...seen]);
    await page.evaluate(() => { Eggs.st.ep.mnFirst = Voice.today(); });
    const seen2 = new Set(); for (let i = 0; i < 80; i++) { const t = await page.evaluate(() => { const body = mnTopPage().page.querySelector('.page-body'); return mnCandidates('records', body).map(c => c.html.replace(/<[^>]+>/g, '')); }); t.forEach(x => seen2.add(x)); }
    T(![...seen2].includes('still here. still reading.'), 'not before months have passed');
    T([...seen, ...seen2].some(x => /impressive|management/.test(x)), 'the crossed-out word / management notes can appear anywhere');
    await popAll(page);
    /* Insights */
    await page.evaluate(() => { const s = labInit(); s.tab = 'lab'; s.mode = 'rel'; s.a = 'sleep'; s.b = 'protein'; s.range = { preset: 'all' }; openInsightsPage('lab'); }); await page.waitForTimeout(700);
    const ins = await page.evaluate(() => { const body = mnTopPage().page.querySelector('.page-body'); return { ok: mnLabSafe(), c: mnCandidates('insights', body).map(c => c.html.replace(/<[^>]+>/g, '')), kv: [...body.querySelectorAll('.kv')].map(k => k.textContent) }; });
    T(ins.ok, 'sleep vs protein is a safe comparison', ins);
    T(ins.c.every(t => ['needs more data. like everything.', 'could be a pattern. could be lunch.', 'wide. very wide.', 're-run this next month.', "(please don't tell management)", 'impressive adequate impressive'].includes(t)), 'Insights notes come from the approved set', ins.c);
    await page.evaluate(() => { const s = labInit(); s.a = 'weight'; s.b = 'protein'; Pages.render(); }); await page.waitForTimeout(400);
    T(await page.evaluate(() => { const body = mnTopPage().page.querySelector('.page-body'); return mnCandidates('insights', body).length; }) === 0, 'Insights: nothing at all when the comparison involves weight');
    for (const v of ['energy', 'appetite', 'symptom', 'dose']) {
      await page.evaluate(v => { const s = labInit(); s.a = 'sleep'; s.b = v; Pages.render(); }, v); await page.waitForTimeout(300);
      T(await page.evaluate(() => mnCandidates('insights', mnTopPage().page.querySelector('.page-body')).length) === 0, 'Insights: nothing when the comparison involves ' + v);
    }
    /* overlays / other pages / TR */
    await popAll(page);
    await drag(40, 260, 420); T(await page.evaluate(() => document.querySelectorAll('.mn-note').length) === 0, 'nothing on the dashboard');
    await page.evaluate(() => openRecordsPage()); await page.waitForTimeout(500);
    await page.evaluate(() => Celebrate.show([{ emoji: '🎉', kicker: 'x', title: 'y', sub: 'z' }]));
    await drag(40, 260, 420); T(await page.evaluate(() => document.querySelectorAll('.mn-note').length) === 0, 'nothing while a celebration is up');
    await page.evaluate(() => Celebrate.close());
    T(errs.length === 0, 'no page errors', errs);
    await page.close();
    const tr = await open({ lang: 'tr' });
    await tr.page.evaluate(() => openRecordsPage()); await tr.page.waitForTimeout(600);
    await tr.page.mouse.move(40, 260); await tr.page.mouse.down(); for (let i = 1; i <= 6; i++) await tr.page.mouse.move(40, 260 + i * 27); await tr.page.mouse.up();
    T(await tr.page.evaluate(() => document.querySelectorAll('.mn-note').length) === 0, 'TR: no margin notes');
    await tr.page.close();
  }


  /* touch path */
  {
    const { page } = await open();
    await reset(page);
    await page.evaluate(() => openRecordsPage()); await page.waitForTimeout(600);
    const touch = async (x) => page.evaluate(x => { const t = document.querySelector('.page-body'); const mk = y => new Touch({ identifier: 7, target: t, clientX: x, clientY: y }); let prevented = false;
      const ev = (type, y, ch) => { const e = new TouchEvent(type, { touches: ch ? [] : [mk(y)], changedTouches: [mk(y)], bubbles: true, cancelable: true }); t.dispatchEvent(e); if (e.defaultPrevented) prevented = true; };
      ev('touchstart', 260); ev('touchmove', 300); ev('touchmove', 340); ev('touchmove', 380); ev('touchend', 380, true); return prevented; }, x);
    let prevented = await touch(10);
    T(await page.evaluate(() => document.querySelectorAll('.mn-note').length) === 0, 'touch: nothing inside the OS back-swipe edge band');
    prevented = await touch(44);
    T(await page.evaluate(() => document.querySelectorAll('.mn-note').length) >= 1 && prevented === false, 'touch: a finger dragged down the left margin brings the notes, without hijacking scrolling', prevented);
    await page.close();
  }

  /* ================= Bucky ================= */
  {
    const { page, errs } = await open();
    await reset(page);
    T(await page.evaluate(() => Bucky.P <= 0.06 && Bucky.P > 0), 'visitor opens are rare (a few times a season)', await page.evaluate(() => Bucky.P));
    /* never in the first minute */
    const delay = await page.evaluate(() => { const real = window.setTimeout, got = []; window.setTimeout = (f, d) => { got.push(d); return 0; }; const r = Math.random; Math.random = () => 0; Bucky.init(); Math.random = r; window.setTimeout = real; return got; });
    T(delay.length === 1 && delay[0] >= 65000, 'scheduled no earlier than 65 s after open', delay);
    const nope = await page.evaluate(() => { const real = window.setTimeout, got = []; window.setTimeout = (f, d) => { got.push(d); return 0; }; const r = Math.random; Math.random = () => 0.99; Bucky.init(); Math.random = r; window.setTimeout = real; return got.length; });
    T(nope === 0, 'most opens have no visitor');
    /* a visit on the dashboard */
    const pose = await page.evaluate(() => Bucky.start({ pose: 'sit' }));
    T(pose === 'sit', 'visit starts on the dashboard', pose);
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => { const e = Bucky.el; const cs = getComputedStyle(e); return { pe: cs.pointerEvents, par: e.parentElement.id || e.parentElement.className, svg: !!e.querySelector('svg'), disc: Eggs.st.disc.visitor, day: Eggs.st.ep.buckyDay, tx: /bucky|cat|visitor/i.test(e.textContent) }; });
    T(st.pe === 'none' && st.svg && !!st.disc && !st.tx, 'visual layer ignores pointer input, drawn (svg), nothing spoken by him', st);
    T(await page.evaluate(() => Bucky.start({})) === false, 'never twice in a day (second start refused)');
    T(await page.evaluate(() => !!document.querySelector('.bk') && document.querySelectorAll('.bk').length === 1), 'only one visitor at a time');
    /* nothing under his body is blocked: elementFromPoint over his body is never the visitor */
    const through = await page.evaluate(() => { const r = Bucky.el.getBoundingClientRect(), pts = []; for (let i = 1; i < 5; i++) for (let j = 1; j < 5; j++) pts.push([r.left + r.width * i / 5, r.top + r.height * j / 5]); return pts.every(p => { const e = document.elementFromPoint(p[0], p[1]); return !e || !e.closest('.bk'); }); });
    T(through, 'taps over his body reach whatever is underneath');
    /* leaves when something she needs opens */
    await page.evaluate(() => openRecordsPage()); await page.waitForTimeout(800);
    T(await page.evaluate(() => !Bucky.el && !document.querySelector('.bk')), 'leaves at once when a page opens');
    await popAll(page);
    /* gating */
    const gate = async (name, setup, teardown) => { await reset(page); await page.evaluate(setup); await page.waitForTimeout(500); const r = await page.evaluate(() => { const r = Bucky.start({ force: true }); const had = !!document.querySelector('.bk'); Bucky.end(); return { r, had }; }); await page.evaluate(teardown || (() => {})); await page.waitForTimeout(450); T(r.r === false && !r.had, 'no visitor: ' + name, r); };
    await gate('a sheet is open', () => openCheckInSheet(), () => { if (Sheet.current) Sheet.current.close(); });
    await gate('a celebration is up', () => Celebrate.show([{ emoji: '🎉', kicker: 'x', title: 'y', sub: 'z' }]), () => Celebrate.close());
    await gate('Wrapped (story) is open', () => Story.openSlides(weekWrappedSlides(dateKey(new Date())), -1), () => Story.close());
    await gate('Tempo Play', () => openPlayPage(), () => Pages.popAll());
    await gate('the calendar (where the black cat lives)', () => openCalendarPage(), () => Pages.popAll());
    await gate('Settings (forms)', () => openSettingsPage(), () => Pages.popAll());
    await gate('Weight page', () => openWeightPage(), () => Pages.popAll());
    await gate('a workout draft exists', () => { Store.state.meta.workoutDraft = { id: 'd', entries: [] }; }, () => { Store.state.meta.workoutDraft = null; });
    await gate('an input is focused', () => { const i = document.createElement('input'); i.id = 'tmp-in'; document.body.appendChild(i); i.focus(); }, () => { const i = document.getElementById('tmp-in'); if (i) i.remove(); });
    /* pose choice */
    const ch = await page.evaluate(() => { const c = {}; let rep = 0, last = null; for (let i = 0; i < 3000; i++) { Eggs.st.ep.buckyLast = last; const p = Bucky.choose(); if (p === last) rep++; c[p] = (c[p] || 0) + 1; last = p; } return { c, rep }; });
    T(ch.rep === 0, 'never the same behaviour twice in a row', ch);
    T(ch.c.sit / 3000 > .18 && ch.c.sit / 3000 < .32, 'about one visit in four is exactly "sits there"', ch.c.sit / 3000);
    T(['away', 'blink', 'knead', 'yawn', 'wash', 'pawtest', 'contort', 'headturn', 'sprawl', 'nudge', 'inconvenient'].every(k => ch.c[k] > 0), 'every approved behaviour and habit can occur', ch.c);
    /* remark about one visit in three, from the approved pools */
    const rem = await page.evaluate(() => { const g = { n: [], a: [] }; let c = 0; const host = document.getElementById('app'); Bucky.el = document.createElement('div'); host.appendChild(Bucky.el); Bucky.host = host; for (let i = 0; i < 900; i++) { Voice.spentUntil = 0; Bucky.cap = null; Bucky.remark(i % 2 ? 'sprawl' : 'sit'); if (Bucky.cap) { c++; (i % 2 ? g.a : g.n).push(Bucky.cap.textContent); Bucky.cap.remove(); } } Bucky.el.remove(); Bucky.el = null; return { c, g }; });
    T(rem.c / 900 > .27 && rem.c / 900 < .4, 'Tempo comments on roughly one visit in three', rem.c / 900);
    T(rem.g.n.every(t => ["I don't remember hiring him.", "He's not on the payroll.", "I'd like it noted that I did not authorize this.", "Please don't ask me how he got in.", 'He appears to be doing a very important job.'].includes(t)), 'ordinary remarks are the approved five');
    T(rem.g.a.every(t => ["He's claimed another card. I'm told this is how occupations begin.", "He has annexed the dashboard. I've asked for a statement."].includes(t)) && rem.g.a.length > 0, 'a sprawl gets the more ambitious remark');
    /* non-interference with a real button underneath */
    await reset(page);
    const clicks = await page.evaluate(async () => {
      window.__c = 0; const btn = document.createElement('button'); btn.id = 'tb'; btn.textContent = 'tap'; btn.style.cssText = 'position:fixed;left:120px;top:300px;width:200px;height:70px;z-index:5'; btn.onclick = () => window.__c++; document.body.appendChild(btn);
      const host = document.body; getComputedStyle(host).position; host.style.position = 'relative';
      Bucky.place(host, btn, 'sit'); Bucky.el.style.top = '260px'; Bucky.el.style.left = '120px'; clearInterval(Bucky.watch);
      await new Promise(r => setTimeout(r, 1300)); return { hit: !!document.querySelector('.bk-hit') };
    });
    T(!clicks.hit, 'no hit area is created where an interactive element lies underneath', clicks);
    await page.mouse.click(220, 335); await page.waitForTimeout(100);
    T(await page.evaluate(() => window.__c) === 1, 'the button under him still works');
    await page.evaluate(() => { Bucky.end(); document.getElementById('tb').remove(); });
    /* hit area over blank space: tail flick only */
    await reset(page);
    const blank = await page.evaluate(async () => {
      const host = document.createElement('div'); host.id = 'blankhost'; host.style.cssText = 'position:fixed;left:0;top:0;width:400px;height:860px;background:#fff;z-index:12'; document.body.appendChild(host);
      const card = document.createElement('div'); card.style.cssText = 'position:absolute;left:30px;top:400px;width:300px;height:100px'; host.appendChild(card);
      Bucky.place(host, card, 'blink'); clearInterval(Bucky.watch);
      await new Promise(r => setTimeout(r, 1300));
      const h = document.querySelector('.bk-hit'); if (!h) return { hit: false };
      h.click(); await new Promise(r => setTimeout(r, 100));
      return { hit: true, flick: !!document.querySelector('.bk-tail.bk-flick'), changed: 0 };
    });
    T(blank.hit && blank.flick, 'over blank space a tap gives a single tail flick', blank);
    await page.evaluate(() => { Bucky.end(); const h = document.getElementById('blankhost'); if (h) h.remove(); });
    /* leaves by itself, tail last, and cleans up */
    await reset(page);
    await page.evaluate(() => { Bucky.start({ force: true, pose: 'blink' }); });
    await page.waitForTimeout(500);
    await page.evaluate(() => Bucky.leave()); await page.waitForTimeout(500);
    T(await page.evaluate(() => Bucky.el && Bucky.el.dataset.pose === 'leave' && !!Bucky.el.querySelector('.bk-tail.last')), 'leaves with the tail last');
    await page.waitForTimeout(2800);
    T(await page.evaluate(() => !Bucky.el && !document.querySelector('.bk,.bk-cap,.bk-hit')), 'gone completely, nothing left behind');
    const stay = await page.evaluate(() => { const a = []; for (let i = 0; i < 400; i++) a.push(Bucky.stay()); return [Math.min(...a), Math.max(...a)]; });
    T(stay[0] >= 10000 && stay[1] <= 25000, 'stays ten to twenty-five seconds', stay);
    /* every pose draws as valid SVG */
    const svgOk = await page.evaluate(() => ['sit', 'away', 'blink', 'knead', 'yawn', 'chin', 'wash', 'pawtest', 'contort', 'headturn', 'sprawl', 'nudge', 'inconvenient', 'leave'].every(p => { const d = new DOMParser().parseFromString(bkArt(p).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '), 'image/svg+xml'); return !d.querySelector('parsererror'); }));
    T(svgOk, 'all fourteen poses are well-formed SVG');
    /* the visitor never touches her data */
    await reset(page);
    const rec0 = await page.evaluate(() => JSON.stringify({ w: Store.state.workouts, c: Store.state.checkIns, g: Store.state.weights, i: Store.state.injections }));
    await page.evaluate(() => Bucky.start({ force: true, pose: 'sprawl' })); await page.waitForTimeout(1500); await page.evaluate(() => Bucky.end());
    T(await page.evaluate(() => JSON.stringify({ w: Store.state.workouts, c: Store.state.checkIns, g: Store.state.weights, i: Store.state.injections })) === rec0, 'records untouched by a visit');
    T(errs.length === 0, 'no page errors', errs);
    await page.close();
    /* reduced motion */
    const rm = await open({ reducedMotion: true });
    await rm.page.evaluate(() => { Celebrate.close(); Bucky.start({ force: true, pose: 'away' }); }); await rm.page.waitForTimeout(900);
    const rmr = await rm.page.evaluate(() => ({ still: Bucky.el.classList.contains('bk-still'), an: getComputedStyle(Bucky.el.querySelector('.bk-tail')).animationName, vis: getComputedStyle(Bucky.el).opacity }));
    T(rmr.still && rmr.an === 'none' && parseFloat(rmr.vis) > .9, 'reduced motion: a static pose, no animation', rmr);
    await rm.page.close();
    /* TR */
    const tr = await open({ lang: 'tr' });
    const trr = await tr.page.evaluate(() => { Celebrate.close(); return { r: Bucky.start({ force: true }), d: !!document.querySelector('.bk'), eggs: JSON.stringify(Store.state.meta.eggs.cnt) }; });
    T(trr.r === false && !trr.d, 'TR: the visitor never appears', trr);
    await tr.page.close();
  }
  await b.close();
  const r = L.done('Phase 4');
  process.exit(r.fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
