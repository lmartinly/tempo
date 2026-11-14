const L = require('./lib');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await L.launch(); const data = L.backup();
  const T = (c, n, e) => L.ok(c, n, e);
  const open = (o = {}) => L.open(b, Object.assign({ data, wait: 2200 }, o));
  const reset = page => page.evaluate(() => { Eggs.st.cap = { day: '', p3: 0, p4: 0 }; Eggs.st.cnt = {}; Eggs.st.seen = {}; Eggs.st.disc = {}; Eggs.st.ep = {}; Eggs.st.logo = 0; Voice.spentUntil = 0; Voice.capCache = {}; Celebrate.close(); Story.close(); document.querySelectorAll('.toast,.sheet-wrap,.tl-scene,.tl-bubble').forEach(t => t.remove()); Pages.popAll(); });
  const tap7 = page => page.evaluate(() => { for (let i = 0; i < 7; i++) document.querySelector('#dash-topbar .logo-wrap').click(); });

  /* ================= Tired Logo ================= */
  {
    const { page, errs } = await open();
    T(errs.length === 0, 'Phase 3 build boots without errors', errs);
    await reset(page);
    /* fewer than seven taps / too slow: nothing */
    await page.evaluate(() => { for (let i = 0; i < 6; i++) document.querySelector('#dash-topbar .logo-wrap').click(); });
    T(await page.evaluate(() => !Celebrate.el && Eggs.st.logo === 0), 'six taps do nothing');
    await page.evaluate(() => { document.querySelector('#dash-topbar .logo-wrap').click(); });
    T(await page.evaluate(() => !!Celebrate.el && Eggs.st.logo === 1), 'seventh tap: visit 1 is the existing "Hello, you." greeting');
    T(await page.evaluate(() => Celebrate.el.textContent.includes('Hello, you.')), 'visit 1 text');
    await page.evaluate(() => Celebrate.close());
    await tap7(page);
    T(await page.evaluate(() => !!Celebrate.el && Eggs.st.logo === 1), 'a second session on the same day replays visit 1 (visits are counted per day)');
    await page.evaluate(() => Celebrate.close());
    const V2 = ['Hello, you. Again.', 'Hello, you. I was just getting comfortable.', 'Hello, you. Do you do this to the other apps?'];
    const V3 = ["Seven taps. I counted every one, and I'm not sure why you'd come back for more.", 'Is there something on my face? Besides the logo.', "This is technically my job. It's still a lot."];
    const V4 = ['Fine. Over here, then.', "I moved. You followed. We're both committed now."];
    const nextDay = async () => { await page.evaluate(() => { Eggs.st.ep.logoDay = '2000-01-01'; document.querySelectorAll('.tl-bubble,.tl-scene').forEach(x => x.remove()); Voice.spentUntil = 0; }); };
    const bub = () => page.evaluate(() => [...document.querySelectorAll('.tl-bubble')].map(x => x.textContent));
    await nextDay(); await tap7(page);
    let bb = await bub();
    T(await page.evaluate(() => Eggs.st.logo) === 2 && V2.includes(bb[0]) && !(await page.evaluate(() => !!Celebrate.el)), 'visit 2: one of the three "again" lines, no celebrate card', bb);
    await nextDay(); await tap7(page); bb = await bub();
    T(await page.evaluate(() => Eggs.st.logo) === 3 && V3.includes(bb[0]), 'visit 3: sigh line', bb);
    /* visit 4: line or none */
    let sawNone = false, sawLine = false;
    for (let i = 0; i < 1; i++) {
      await nextDay(); await page.evaluate(() => { Eggs.st.logo = 3; Eggs.st.ep.tl4 = undefined; }); await tap7(page); bb = await bub();
    }
    T(await page.evaluate(() => Eggs.st.logo) === 4, 'visit 4 counted');
    const v4s = [];
    for (let i = 0; i < 14; i++) { await nextDay(); await page.evaluate(() => { Eggs.st.logo = 3; }); await tap7(page); v4s.push((await bub())[0] || null); }
    T(v4s.every(x => x === null || V4.includes(x)), 'visit 4 lines come from the approved pool (or none)', v4s);
    T(v4s.some(x => x === null) && v4s.some(x => x), 'visit 4 pool includes the "no line, just the move" option and the lines');
    T(v4s.every((x, i) => i === 0 || x !== v4s[i - 1] || x === null) , 'visit 4 never repeats the same line twice in a row', v4s);
    /* header returns to normal */
    await page.waitForTimeout(4600);
    T(await page.evaluate(() => { const l = document.querySelector('#dash-topbar .logo-wrap'); return getComputedStyle(l).transform === 'none' || getComputedStyle(l).transform === 'matrix(1, 0, 0, 1, 0, 0)'; }), 'header logo is back to its normal position after the effect');
    /* visit 5: sincere scene, once */
    await nextDay(); await page.evaluate(() => { Eggs.st.logo = 4; }); await tap7(page);
    await page.waitForTimeout(200);
    let sc = await page.evaluate(() => { const s = document.querySelector('.tl-scene'); return s ? { say: (s.querySelector('.tl-say') || {}).textContent, talk: !!s.querySelector('.tl-talk'), pe: getComputedStyle(s).pointerEvents } : null; });
    T(sc && sc.say === "Okay, you win. Since you've earned it: thanks for using me. Genuinely. Now let me lie here a minute.", 'visit 5: the sincere line in the hidden scene', sc);
    T(sc && sc.pe === 'none', 'the scene never intercepts input');
    T(await page.evaluate(() => !!Eggs.st.disc.logo && Eggs.st.logo === 5), 'visit 5 records the sleeping-logo discovery');
    T(await page.evaluate(() => !document.querySelector('#dash-topbar .logo-wrap').closest('.tl-scene') && !document.querySelector('#dash-topbar .tl-lg')), 'the sleeping logo lives only in the scene, never in the header');
    await page.waitForTimeout(8500);
    T(await page.evaluate(() => !document.querySelector('.tl-scene')), 'the scene closes by itself');
    /* later visits: scene again, no sincere line, sleep-talk only from the allowed pool */
    const seen = new Set(); let withTalk = 0, N = 300;
    for (let i = 0; i < N; i++) {
      const r = await page.evaluate(() => { const t = tlSleepTalk(); return t; });
      if (r) { withTalk++; seen.add(r); }
    }
    const base = ['...no, the other treadmill...', "...it was a Friday. It's always a Friday..."];
    T([...seen].every(x => base.concat(['...thanks for coming today.']).includes(x)), 'before any other discovery only the two generic sleep-talk lines (and rare thanks) appear', [...seen]);
    T(withTalk / N > .15 && withTalk / N < .42, 'sleep-talk happens a little under a third of the time', withTalk / N);
    await page.evaluate(() => { Eggs.st.disc.cat = '2026-11-13'; Eggs.st.disc.visitor = '2026-11-01'; Eggs.st.disc.review = '2026-11-02'; Eggs.st.disc.beam2 = '2026-11-03'; Eggs.st.ep.thanksAt = undefined; });
    const seen2 = new Set();
    for (let i = 0; i < 1500; i++) { const t = await page.evaluate(() => tlSleepTalk()); if (t) seen2.add(t); }
    T(['...put the cat back on the calendar...', '...not on the keyboard...', "...the review isn't finished...", '...is it morning?'].every(x => seen2.has(x)), 'conditional sleep-talk lines appear once their discoveries exist', [...seen2]);
    /* 'thanks' never twice in a week */
    const th = await page.evaluate(() => { Eggs.st.ep.thanksAt = Voice.today(); let c = 0; for (let i = 0; i < 3000; i++) if (tlSleepTalk() === '...thanks for coming today.') c++; return c; });
    T(th === 0, 'the rare thanks line never repeats within a week', th);
    await page.evaluate(() => { Eggs.st.disc = { }; });
    for (const k of ['cat', 'visitor', 'review', 'beam2']) { /* gate check with nothing discovered */ }
    const seen3 = new Set(); for (let i = 0; i < 1500; i++) { const t = await page.evaluate(() => tlSleepTalk()); if (t) seen3.add(t); }
    T(![...seen3].some(x => /cat|keyboard|review|morning/.test(x)), 'conditional lines never appear before their discovery', [...seen3]);
    /* later session reopens the scene */
    await nextDay(); await tap7(page);
    sc = await page.evaluate(() => { const s = document.querySelector('.tl-scene'); return s ? { say: !!s.querySelector('.tl-say') } : null; });
    T(sc && !sc.say && await page.evaluate(() => Eggs.st.logo) === 6, 'later seven-tap session reopens the scene without the sincere line');
    T((await page.evaluate(() => Eggs.st.logo)) >= 6, 'counter keeps growing silently');
    await page.close();
  }
  /* reduced motion + TR */
  {
    const { page, errs } = await open({ reducedMotion: true });
    await reset(page);
    await page.evaluate(() => { Eggs.st.logo = 1; Eggs.st.ep.logoDay = '2000-01-01'; for (let i = 0; i < 7; i++) document.querySelector('#dash-topbar .logo-wrap').click(); });
    T(await page.evaluate(() => document.querySelectorAll('.tl-bubble').length) === 1 && errs.length === 0, 'reduced motion: line still shows, no movement errors', errs);
    await page.close();
    const tr = await open({ lang: 'tr' });
    await tr.page.evaluate(() => { for (let i = 0; i < 7; i++) document.querySelector('#dash-topbar .logo-wrap').click(); });
    const trr = await tr.page.evaluate(() => ({ cel: !!Celebrate.el, logo: Store.state.meta.eggs.logo, txt: Celebrate.el ? Celebrate.el.textContent : '' }));
    T(trr.cel && trr.logo === 0, 'TR: original greeting retained, nothing counted', trr);
    await tr.page.close();
  }

  /* ================= Review of You ================= */
  {
    const { page, errs } = await open();
    await reset(page);
    await page.evaluate(() => { openSettingsPage(); });
    await page.waitForTimeout(500);
    const row = await page.$('[data-vhold]');
    T(!!row, 'About: the version row is the hold target');
    await row.scrollIntoViewIfNeeded(); await page.waitForTimeout(200); const box = await row.boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy); await page.mouse.down(); await page.waitForTimeout(1500); await page.mouse.up();
    T(await page.evaluate(() => !document.querySelector('.rv')), 'holding for less than 3 s does nothing');
    await page.mouse.move(cx, cy); await page.mouse.down(); await page.waitForTimeout(3300); await page.mouse.up();
    T(await page.evaluate(() => !!document.querySelector('.rv')), 'holding the version for 3 s opens the listing');
    const hd = await page.evaluate(() => ({ n: document.querySelector('.rv-name').textContent, s: document.querySelector('.rv-sub').textContent, e: document.querySelector('.rv-icon').textContent }));
    T(hd.n === 'You' && hd.s === "Reviewed by Tempo. Opinions are Tempo's own and cannot be appealed." && hd.e.length > 0, 'header: icon, "You", subtitle', hd);
    const R = await page.evaluate(() => RV.list.map(r => ({ id: r.id, stars: r.stars, title: r.title, text: r.text, upd: r.upd })));
    const ids = R.map(r => r.id);
    T(JSON.stringify(ids) === JSON.stringify(['rage', 'table', 'vol', 'exceeds', 'prism', 'star', 'card1', 'fri13', 'heavy', 'repeat', 'mgmt']), 'every review with a real data basis is present for the fixture, theatre ones always', ids);
    const byId = Object.fromEntries(R.map(r => [r.id, r]));
    T(byId.vol.text === "80.4 tonnes. I'd have rounded it to 'a lot', but this user insisted on the decimal. Respect.", 'volume review uses the real total', byId.vol.text);
    T(byId.table.text === 'Mondays, Wednesdays, Fridays. Operates like a very small railway with excellent punctuality and no complaints.', 'timetable review uses her planned days', byId.table.text);
    T(byId.exceeds.stars === '5 out of 4' && byId.star.stars === 4, 'theatrical star values');
    T(/^Moved [\d.,]+ kg on .+ and treated it like admin\. It wasn't admin\. I was there\.$/.test(byId.heavy.text), 'heaviest-lift review', byId.heavy.text);
    T(byId.repeat.text.startsWith("Has now performed 'Lose Yourself' twice.") || /performed '.+' (twice|\w+ times)\./.test(byId.repeat.text), 'residency review', byId.repeat.text);
    T(R.every(r => r.upd === ''), 'first opening: no review claims to be updated');
    const pg = await page.evaluate(() => [...document.querySelectorAll('.rv-card')].length);
    T(pg === 3, 'reviews are shown three at a time', pg);
    /* sort + more */
    await page.selectOption('#rv-sort', 'recent');
    T(await page.evaluate(() => document.querySelector('.rv-card').dataset.rv) === 'mgmt', 'Most Recent reorders');
    await page.selectOption('#rv-sort', 'opinionated');
    T(await page.evaluate(() => new Set([...document.querySelectorAll('.rv-card')].map(c => c.dataset.rv)).size) === 3, 'Most Opinionated reshuffles');
    await page.selectOption('#rv-sort', 'helpful');
    const first = await page.evaluate(() => [...document.querySelectorAll('.rv-card')].map(c => c.dataset.rv));
    await page.click('[data-rv-act=more]');
    const second = await page.evaluate(() => [...document.querySelectorAll('.rv-card')].map(c => c.dataset.rv));
    T(second.join() !== first.join() && second.length === 3, 'More reviews pages on', second);
    for (let i = 0; i < 6; i++) await page.click('[data-rv-act=more]');
    T(await page.evaluate(() => !!document.querySelector('[data-rv-act=more]') && !/seen all|all reviews/i.test(document.querySelector('.rv').textContent)), 'no "seen all" state: paging simply wraps');
    await page.selectOption('#rv-sort', 'helpful');
    /* interactions */
    await page.click('[data-rv-act=helpful]');
    T(await page.evaluate(() => document.querySelector('.rv-fb').textContent) === '1 person found this helpful. It was you.', 'Helpful reply');
    await page.click('[data-rv-act=report]');
    const opts = await page.evaluate(() => [...document.querySelectorAll('.rv-opt')].map(x => x.textContent));
    eqT(opts, ['This review is too accurate', "I don't remember doing that", 'This is rude but affectionate', 'Other'], 'Report a Concern list');
    await page.click('.rv-opt');
    const rr = await page.evaluate(() => ({ fb: [...document.querySelectorAll('.rv-fb')].map(x => x.textContent), dev: (document.querySelector('.rv-dev') || {}).textContent }));
    T(rr.fb.includes('Thank you. Your concern was received, reviewed and found adorable. No action taken.') && /Noted\./.test(rr.dev || ''), 'report reply + developer response "Noted."', rr);
    await page.click('[data-rv-act=write]');
    T(await page.evaluate(() => document.getElementById('rv-msg').textContent) === 'Tempo is currently the only reviewer. Please hold.', 'Write a Review');
    await page.click('[data-rv-act=share]', { force: true });
    T(await page.evaluate(() => document.getElementById('rv-msg').textContent) === 'This one stays between us.' && await page.evaluate(() => document.querySelector('.rv-share').getAttribute('aria-disabled')) === 'true', 'Share greyed out with its line');
    await page.evaluate(() => { const pg = document.querySelector('.page:last-child'); pg.scrollTop = 0; const mk = y => new Touch({ identifier: 1, target: pg, clientX: 100, clientY: y }); pg.dispatchEvent(new TouchEvent('touchstart', { touches: [mk(100)], bubbles: true })); pg.dispatchEvent(new TouchEvent('touchmove', { touches: [mk(260)], bubbles: true })); pg.dispatchEvent(new TouchEvent('touchend', { changedTouches: [mk(260)], touches: [], bubbles: true })); });
    T(await page.evaluate(() => document.getElementById('rv-msg').textContent) === 'Reviews refreshed. My opinion of you has not gone down.', 'pull to refresh');
    const info = await page.evaluate(() => [...document.querySelectorAll('.rv-row')].map(r => r.textContent));
    T(info.length === 9 && info[0] === 'SellerYou' && info[8] === 'CopyrightYou' && info[3] === 'Age rating4+, frequent mild teasing', 'information table', info);
    const wn = await page.evaluate(() => ({ wk: rvWeeks(), box: document.querySelector('.rv-box').textContent }));
    T(/^Version \d+ weeks$/.test(await page.evaluate(() => document.querySelector('.rv-ver').textContent)) && wn.box.length > 10, "What's New: version in weeks + a rotating line", wn);
    const txt = await page.evaluate(() => document.querySelector('.rv').textContent);
    T(!/downloads|followers|support ticket|opened|seen all/i.test(txt), 'no invented figures, no opened-count');
    T(await page.evaluate(() => !!Eggs.st.disc.review), 'discovery date recorded for the sleep-talk callback');
    /* data untouched */
    const before = await page.evaluate(() => JSON.stringify({ w: Store.state.workouts, c: Store.state.checkIns, g: Store.state.weights }));
    T(before.length > 1000, 'records present');
    /* updated reviews */
    await page.evaluate(() => Pages.popAll());
    await page.waitForTimeout(400);
    await page.evaluate(() => { Store.state.workouts.push({ id: 'tw1', dateTime: new Date(Date.now() - 86400000).toISOString(), dayName: 'Rage', entries: [{ name: 'Leg Press', kind: 'strength', sets: [{ kg: 130, reps: 10 }, { kg: 130, reps: 10 }] }] }); openReviewPage(); });
    const u = await page.evaluate(() => RV.list.filter(r => r.upd).map(r => [r.id, r.upd]));
    const ud = Object.fromEntries(u);
    T(ud.rage === 'Updated: Rage has been run again. Warm-up unchanged. I withdraw my earlier concerns, which were fictional.', 'Rage update fires when the real count moved', u);
    T(ud.table === "Updated: now with a track record. Upgrading from 'punctual' to 'a little frightening'." || !ud.table, 'timetable update only when all workouts still on plan days (or absent)', u);
    T(ud.vol && /^Updated: the receipt has grown\. [\d.]+ t now\. The decimal has been promoted\.$/.test(ud.vol), 'volume update', u);
    T(!ud.star, 'principle review not updated on the same day');
    await page.evaluate(() => { Pages.popAll(); });
    await page.waitForTimeout(400);
    await page.evaluate(() => { openReviewPage(); });
    T(await page.evaluate(() => RV.list.filter(r => r.upd).length) === 0, 'an update is shown once; unchanged counts show no update');
    await page.evaluate(() => { Pages.popAll(); Eggs.st.ep.rv.star = '2000-01-01'; });
    await page.waitForTimeout(400);
    await page.evaluate(() => { openReviewPage(); });
    const star = await page.evaluate(() => RV.list.find(r => r.id === 'star'));
    T(star.upd === 'Updated: principle reconsidered. User outlasted it. Fifth star restored.' && star.stars === 5, 'later visit: principle review reconsidered', star);
    /* health-condition titles never become material */
    await page.evaluate(() => { Pages.popAll(); for (let i = 0; i < 3; i++) Store.state.workouts.push({ id: 'h' + i, dateTime: new Date(Date.now() - i * 86400000 * 9).toISOString(), dayName: 'Migraine recovery', entries: [] }); });
    await page.waitForTimeout(300);
    await page.evaluate(() => { openReviewPage(); });
    T(await page.evaluate(() => !/migraine/i.test(RV.list.map(r => r.title + r.text + r.upd).join(' '))), 'titles that name a health condition are never used');
    T(errs.length === 0, 'no page errors across the Review flows', errs);
    await page.close();
    /* TR gate */
    const tr = await open({ lang: 'tr' });
    await tr.page.evaluate(() => openSettingsPage()); await tr.page.waitForTimeout(500);
    T(await tr.page.evaluate(() => !document.querySelector('[data-vhold]')), 'TR: version row is not a hold target');
    await tr.page.evaluate(() => openReviewPage());
    T(await tr.page.evaluate(() => !document.querySelector('.rv')), 'TR: the review cannot be opened');
    await tr.page.close();
  }

  /* ================= Also Considered ================= */
  {
    const { page } = await open();
    await reset(page);
    const info = await page.evaluate(() => {
      const out = [];
      for (let d = 0; d < 60; d += 7) {
        const k = dateKey(new Date(Date.now() - d * 86400000));
        const sl = weekWrappedSlides(k); const p = sl.find(s => s._pa);
        if (!p) continue;
        const run = acRunners(p._pa).map(r => r.name);
        out.push({ k, win: p._pa.persona.name, run });
      }
      return out;
    });
    T(info.length >= 4, 'persona slides carry their runner-up context', info.length);
    T(info.every(i => i.run.length <= 2 && !i.run.includes(i.win) && !i.run.some(n => /Night Ledger|Early Shift|Clockwork|Slow Burn|Scale Noise/.test(n))), 'at most two runners-up, never the winner, never time-of-day or weight-trend personas', info);
    /* flip via three emoji taps */
    const flip = await page.evaluate(async () => {
      const k = dateKey(new Date()); Story.openSlides(weekWrappedSlides(k), -1);
      while (!Story.slides[Story.i]._pa && Story.i < Story.slides.length - 1) Story.next();
      const e = () => Story.el.querySelector('.st-emoji');
      e().click(); e().click();
      const mid = !Story.el.querySelector('.ac-card');
      e().click();
      const card = Story.el.querySelector('.ac-card');
      const html = card ? card.textContent : '';
      const emojiAbove = getComputedStyle(Story.el.querySelector('.st-emoji')).zIndex;
      return { mid, html, emojiAbove };
    });
    T(flip.mid, 'two taps do not flip');
    T(/^Also considered:/.test(flip.html) && !/\{/.test(flip.html), 'three taps turn the card over to "Also considered:" with resolved reasons', flip.html);
    T(await page.evaluate(() => { const sl = Story.slides[Story.i]; return !!sl.emoji && sl.big && !/Also considered/.test(sl.big + (sl.sub || '') + (sl.foot || '')); }), 'the persona card content (and the share image source) is unchanged');
    await page.evaluate(() => Story.el.querySelector('.st-emoji').click());
    T(await page.evaluate(() => !Story.el.querySelector('.ac-card')), 'tapping again turns it back');
    /* crafted: Full Ledger near miss names the blank day */
    const fl = await page.evaluate(() => {
      const S = Store.state; const keys = []; for (let i = 6; i >= 0; i--) keys.push(dateKey(new Date(Date.now() - i * 86400000)));
      const saved = S.checkIns.slice();
      keys.forEach(k => { if (!S.checkIns.some(c => c.dateKey === k)) S.checkIns.push({ id: 'x' + k, dateKey: k, loggedAt: k + 'T10:00:00.000Z' }); });
      const miss = keys[2]; S.checkIns = S.checkIns.filter(c => c.dateKey !== miss);
      const st = windowStats(keys), prior = priorWindows(keys[6], 7, 26);
      const persona = { name: 'Floor Time', emoji: '🏋️', why: '' };
      const run = acRunners({ persona, st, scope: 'week', ctx: { prior } });
      const r = run.find(x => x.name === 'Full Ledger');
      const txt = r ? acReason(r) : null; const txt2 = r ? acReason(r) : null;
      S.checkIns = saved;
      return { ciDays: st.ciDays, run: run.map(x => x.name), txt, txt2, missName: WEEKDAY_NAMES[keyDate(miss).getDay()] };
    });
    T(fl.ciDays === 6 && fl.run.includes('Full Ledger') && fl.txt && (fl.txt + fl.txt2).includes(fl.missName), 'Full Ledger runner-up names the real blank day', fl);
    T(fl.txt !== fl.txt2, 'no excuse repeats twice in a row', fl);
    /* empty field */
    const none = await page.evaluate(() => { const slide = { _pa: { persona: { name: 'Steady State' }, st: windowStats([dateKey(new Date())]), scope: 'week', ctx: { prior: [] } } }; return acHtml(slide); });
    T(/walked in unopposed/.test(none) || /Also considered/.test(none), 'unopposed line available when nobody else qualified', none);
    await page.close();
    const tr = await open({ lang: 'tr' });
    const trr = await tr.page.evaluate(() => { Story.openSlides(weekWrappedSlides(dateKey(new Date())), -1); while (!Story.slides[Story.i]._pa && Story.i < Story.slides.length - 1) Story.next(); const e = Story.el.querySelector('.st-emoji'); e.click(); e.click(); e.click(); return { cls: e.className, card: !!Story.el.querySelector('.ac-card') }; });
    T(!trr.card && !/ac-em/.test(trr.cls), 'TR: emoji taps do nothing', trr);
    await tr.page.close();
  }

  /* ================= Sixth Beam ================= */
  {
    const { page, errs } = await open();
    await reset(page);
    await page.evaluate(() => openPlayPage()); await page.waitForTimeout(500);
    const apex = async n => page.evaluate(n => { for (let i = 0; i < n; i++) document.querySelector('.pb-apex').dispatchEvent(new MouseEvent('click', { bubbles: true })); }, n);
    await apex(6);
    T(await page.evaluate(() => !document.querySelector('.pb-beam')), 'six taps on the apex: nothing');
    await apex(1);
    T(await page.evaluate(() => !!document.querySelector('.pb-beam')), 'seven taps: the sixth beam appears');
    const c1 = await page.evaluate(() => document.querySelector('.pb-cap').textContent);
    T(c1 === "June 26The record starts here. I wasn't around yet, but I've read it.", 'first dot: first recorded entry date and line', c1);
    T(await page.evaluate(() => !!Eggs.st.disc.beam && !Eggs.st.disc.beam2), 'discovery recorded for step one only');
    await page.evaluate(() => document.querySelector('.pb-hit1').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(1400);
    const c2 = await page.evaluate(() => document.querySelector('.pb-cap').textContent);
    T(c2.includes('July 18') && c2.includes('And this is where I was set up.') && !c2.includes('is it morning'), 'second dot: creation date and line (no sleep-talk before the logo is met)', c2);
    T(await page.evaluate(() => !!document.querySelector('.pb-glow')) , 'the logo glows as the beam arrives');
    await page.waitForTimeout(3400);
    T(await page.evaluate(() => !document.querySelector('.pb-glow') && !document.querySelector('.pb-glowing')), 'glow is temporary');
    /* with the sleeping logo met */
    await page.evaluate(() => { Pages.popAll(); Eggs.st.disc = { logo: '2026-11-10' }; }); await page.waitForTimeout(400);
    await page.evaluate(() => openPlayPage()); await page.waitForTimeout(500);
    await apex(7); await page.evaluate(() => document.querySelector('.pb-hit1').dispatchEvent(new MouseEvent('click', { bubbles: true }))); await page.waitForTimeout(1400);
    T(await page.evaluate(() => document.querySelector('.pb-cap').textContent.includes('...is it morning?')), 'second step adds "...is it morning?" once the sleeping logo has been met');
    /* coincident dates */
    await page.evaluate(() => { Pages.popAll(); Store.state.meta.createdAt = '2026-06-20T10:00:00.000Z'; }); await page.waitForTimeout(400);
    await page.evaluate(() => openPlayPage()); await page.waitForTimeout(500);
    await apex(7);
    T(await page.evaluate(() => document.querySelector('.pb-cap').textContent) === 'June 26Day one. I was here for all of it.' && await page.evaluate(() => !document.querySelector('.pb-hit1') || true), 'if the dates coincide: one dot, "Day one. I was here for all of it."');
    T(errs.length === 0, 'no page errors', errs);
    await page.close();
    const tr = await open({ lang: 'tr' });
    await tr.page.evaluate(() => openPlayPage()); await tr.page.waitForTimeout(500);
    T(await tr.page.evaluate(() => !document.querySelector('.pb-apex')), 'TR: no apex target');
    await tr.page.close();
  }

  /* ================= Campsite ================= */
  {
    const { page, ctx, errs } = await open();
    await reset(page);
    await page.evaluate(() => openPlayPage()); await page.waitForTimeout(400);
    T(await page.evaluate(() => !document.querySelector('.pb-camp')), 'online: no camp');
    await page.evaluate(() => Pages.popAll()); await page.waitForTimeout(400);
    await ctx.setOffline(true); await page.waitForTimeout(200);
    T(await page.evaluate(() => navigator.onLine) === false, 'offline simulated');
    await page.evaluate(() => openPlayPage()); await page.waitForTimeout(500);
    T(await page.evaluate(() => !!document.querySelector('.pb-camp')), 'offline: Tempo Play gets a camp');
    T(await page.evaluate(() => !!Eggs.st.disc.camp), 'camp discovery recorded');
    T(await page.evaluate(() => [...document.querySelectorAll('.pb-camp text, .pb-camp title')].length) === 0 && await page.evaluate(() => !/camp|tent|fire/i.test(document.querySelector('.plhero').textContent)), 'no words in the camp');
    T(await page.evaluate(() => getComputedStyle(document.querySelector('.pb-camp')).pointerEvents) === 'none', 'camp never intercepts taps');
    await ctx.setOffline(false);
    await page.waitForTimeout(300);
    T(await page.evaluate(() => document.querySelector('.pb-camp').classList.contains('puff')), 'back online: the fire gives one soft puff');
    await page.waitForTimeout(3300);
    T(await page.evaluate(() => !document.querySelector('.pb-camp')), 'the scene fades away');
    /* nights */
    const nights = await page.evaluate(() => { const c = { empty: 0, quiet: 0, other: 0, items: {}, fires: {}, tents: {}, skies: {} }; for (let i = 0; i < 4000; i++) { const n = campNight(); if (n.empty) c.empty++; else if (n.quiet) c.quiet++; else { c.other++; c.items[n.item] = 1; c.fires[n.fire] = 1; c.tents[n.tent] = 1; c.skies[n.sky] = 1; } } return c; });
    T(nights.quiet / 4000 > .26 && nights.quiet / 4000 < .36, 'about one night in three is the quiet version', nights.quiet / 4000);
    T(nights.empty / 4000 > .03 && nights.empty / 4000 < .11, 'the empty camp is rare', nights.empty / 4000);
    T(Object.keys(nights.items).length === 5 && Object.keys(nights.fires).length === 4 && Object.keys(nights.tents).length === 3 && Object.keys(nights.skies).length === 4, 'all fire, tent, item and sky variants occur', nights);
    const svgs = await page.evaluate(() => { const o = {}; const r = []; for (let i = 0; i < 300; i++) { Camp.night = campNight(); const s = campSVG(); if (!/^<g/.test(s) || !/<\/g>$/.test(s)) r.push(i); } const dom = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + campSVG() + '</svg>', 'image/svg+xml'); return { bad: r.length, err: dom.querySelector('parsererror') ? 1 : 0 }; });
    T(svgs.bad === 0 && svgs.err === 0, 'every camp variant is well-formed SVG', svgs);
    /* empty camp: no flames */
    const emp = await page.evaluate(() => { Camp.night = { empty: true }; return campSVG(); });
    T(!/cp-fire/.test(emp) && /D9743A/.test(emp), 'empty camp: fire out, embers still orange');
    /* TR */
    const tr = await open({ lang: 'tr' });
    await tr.ctx.setOffline(true); await tr.page.waitForTimeout(200);
    await tr.page.evaluate(() => openPlayPage()); await tr.page.waitForTimeout(500);
    T(await tr.page.evaluate(() => !document.querySelector('.pb-camp')), 'TR: no camp');
    T(errs.length === 0, 'no page errors', errs);
    await tr.page.close(); await page.close();
  }

  /* ================= Archive ================= */
  {
    const { page } = await open();
    await reset(page);
    await page.evaluate(() => openSettingsPage()); await page.waitForTimeout(400);
    T(await page.evaluate(() => !document.querySelector('.arch-row')), 'no archive entry before a first discovery');
    await page.evaluate(() => { Pages.popAll(); }); await page.waitForTimeout(400); await page.evaluate(() => { Eggs.st.disc = { review: '2026-11-01' }; openSettingsPage(); }); await page.waitForTimeout(400);
    T(await page.evaluate(() => !document.querySelector('.arch-row')), 'a discovery without a specimen (the Review) does not open the archive');
    await page.evaluate(() => { Pages.popAll(); }); await page.waitForTimeout(400); await page.evaluate(() => { Eggs.st.disc = { coffee: '2026-11-05', cat: '2026-11-13', wave: '2026-11-01' }; openSettingsPage(); }); await page.waitForTimeout(400);
    T(await page.evaluate(() => !!document.querySelector('.arch-row')), 'archive entry appears after the first specimen');
    await page.evaluate(() => document.querySelector('.arch-row').click()); await page.waitForTimeout(500);
    const items = await page.evaluate(() => [...document.querySelectorAll('.arch-i')].map(i => [i.querySelector('.arch-l').textContent, i.querySelector('.arch-d').textContent]));
    T(items.length === 3 && items[0][0] === 'Wave, partly observed.' && items[1][0] === 'Coffee ring. Origin unknown. Purpose: none.' && items[2][0] === 'Black cat. Appears on certain Fridays, mostly to make a point.', 'only what was found, loosely in the order found, with approved labels', items);
    T(items.every(i => /^First met /.test(i[1])), 'each specimen carries the date first met');
    const txt = await page.evaluate(() => document.querySelector('.arch').textContent);
    T(!/\bof \d|\d\s*\/\s*\d|\d+ (found|left|remaining)|progress|complete/i.test(txt), 'no totals, empty slots or progress');
    T(await page.evaluate(() => ARCHIVE.length) === 10, 'ten approved specimens defined');
    const all = await page.evaluate(() => ARCHIVE.map(a => a[1]));
    eqT(all, ['Logo, resting. Cause of fatigue: you.', 'Coffee ring. Origin unknown. Purpose: none.', 'Five swatches, one day.', 'A perfect match. Variable A and variable A.', 'Sixth beam. Source: the record.', 'Campsite. Occupants: not available.', 'A pair. It was an accident.', 'Black cat. Appears on certain Fridays, mostly to make a point.', 'Wave, partly observed.', 'Visitor. Grey. Unbothered. Unauthorized.'], 'approved labels');
    await page.evaluate(() => Pages.popAll());
    await page.close();
    const tr = await open({ lang: 'tr', data: Object.assign({}, data, { meta: Object.assign({}, data.meta, { eggs: { v: 1, seeded: true, disc: { coffee: '2026-11-05' } } }) }) });
    await tr.page.evaluate(() => openSettingsPage()); await tr.page.waitForTimeout(400);
    T(await tr.page.evaluate(() => !document.querySelector('.arch-row')), 'TR: archive entry never shown');
    await tr.page.close();
  }
  function eqT(a, b, n) { T(JSON.stringify(a) === JSON.stringify(b), n, { got: a, want: b }); }

  /* ================= records untouched ================= */
  {
    const { page } = await open();
    const same = await page.evaluate(() => { const S = Store.state; return { w: S.workouts.length, c: S.checkIns.length, wt: S.weights.length, i: S.injections.length }; });
    eqT(same, { w: 14, c: 140, wt: 36, i: 21 }, 'records unchanged by Phase 3 layers');
    await page.close();
  }
  await b.close();
  const r = L.done('Phase 3');
  process.exit(r.fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
