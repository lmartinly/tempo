const L = require('./lib');
(async () => {
  const b = await L.launch();
  const data = L.backup();
  const COLL = ['injections','weights','symptoms','measurements','checkIns','dosePlans','vials','spends','cycles','equipment','programs','workouts'];

  /* ---------- EN, real backup ---------- */
  {
    const { page, errs } = await L.open(b, { data, wait: 3500 });
    L.ok(errs.length === 0, 'EN: no page/console errors on boot', errs);
    const r = await page.evaluate((COLL) => ({
      v: APP_VERSION, on: PERSONALITY_ON, eggs: Store.state.meta.eggs,
      counts: COLL.map(k => (Store.state[k] || []).length),
      pers: document.querySelectorAll('.toast.pers').length,
      dictD: JSON.parse(document.getElementById('tr-dict').textContent).d.length,
      dictT: JSON.parse(document.getElementById('tr-dict').textContent).t.length,
      banner: (([...document.querySelectorAll('.banner')].find(x => /backup|synced/.test(x.textContent))) || {}).textContent || null,
      foot: ([...document.querySelectorAll('.footnote')].pop() || {}).textContent
    }), COLL);
    L.ok(r.v === '2.2.0', 'version 2.2.0', r.v);
    L.ok(r.on === true, 'EN: PERSONALITY_ON');
    L.ok(r.eggs && r.eggs.v === 1 && r.eggs.seeded === true, 'EN: eggs state normalised and seeded', r.eggs);
    L.eq(r.counts, COLL.map(k => (data[k] || []).length), 'EN: every record collection count equals the backup');
    L.ok(r.pers === 0, 'EN: seeding is silent (no personality toast)', r.pers);
    L.ok(r.dictD >= 2957 + 4 && r.dictT >= 29 + 2, 'dictionary kept and extended', { d: r.dictD, t: r.dictT });
    console.log('  banner:', r.banner && r.banner.slice(0, 120));
    console.log('  footnote:', r.foot);
    L.ok(!/lives only/.test(r.banner || ''), 'EN: banner no longer claims "lives only on this device"');
    /* record bytes untouched: compare deep JSON of collections to backup after migration idempotence */
    await page.close();
  }

  /* ---------- records unchanged (deep) ---------- */
  {
    const { page } = await L.open(b, { data, wait: 2500 });
    const res = await page.evaluate((orig) => {
      const out = {};
      ['injections','weights','checkIns','workouts','measurements','symptoms','vials'].forEach(k => {
        out[k] = JSON.stringify((Store.state[k] || []).map(x => x.id)) === JSON.stringify((orig[k] || []).map(x => x.id));
      });
      out.settings = JSON.stringify(Store.state.settings) === JSON.stringify(orig.settings);
      out.goal = Store.state.settings.goalKg === orig.settings.goalKg;
      return out;
    }, data);
    Object.keys(res).forEach(k => L.ok(res[k], 'records/settings preserved: ' + k, res));
    await page.close();
  }

  /* ---------- backup banner variants (EN) ---------- */
  {
    const mk = (mut) => { const d = JSON.parse(JSON.stringify(data)); mut(d); return d; };
    const cases = [
      ['never, no Drive', d => { d.meta.lastBackupAt = null; d.settings.drive = Object.assign({}, d.settings.drive, { enabled: false }); }, /stored only on this device, and you haven’t exported a backup yet|made a backup yet/],
      ['stale, no Drive', d => { d.meta.lastBackupAt = new Date(Date.now() - 30 * 864e5).toISOString(); d.settings.drive = Object.assign({}, d.settings.drive, { enabled: false }); }, /last backup was 30 days ago/],
      ['stale, Drive on', d => { d.meta.lastBackupAt = new Date(Date.now() - 30 * 864e5).toISOString(); d.settings.drive = Object.assign({}, d.settings.drive, { enabled: true, lastSync: new Date(Date.now() - 20 * 864e5).toISOString() }); }, /(last backup or (Google Drive )?sync was 20 days ago)/],
      ['never, Drive on', d => { d.meta.lastBackupAt = null; d.settings.drive = Object.assign({}, d.settings.drive, { enabled: true, lastSync: null }); }, /(synced to Google Drive yet|made a backup yet)/]
    ];
    for (const [name, mut, re] of cases) {
      const d = mk(mut); d.meta.backupNudgeSnoozeUntil = null; if (d.meta.eggs) delete d.meta.eggs;
      const { page } = await L.open(b, { data: d, wait: 1500 });
      const txt = await page.evaluate(() => { const e = [...document.querySelectorAll('.banner')].find(x => /backup|synced/.test(x.textContent)); return e ? e.firstChild.textContent : null; });
      console.log('  [' + name + ']', txt);
      L.ok(txt && re.test(txt), 'banner variant: ' + name, txt);
      L.ok(!/lives only/.test(txt || ''), 'banner variant has no inaccurate claim: ' + name);
      /* same session re-render keeps the same text; second session falls back to plain functional text */
      await page.close();
    }
    /* personality voice only on first display of an episode, then plain */
    const d = mk(d => { d.meta.lastBackupAt = new Date(Date.now() - 30 * 864e5).toISOString(); d.settings.drive = Object.assign({}, d.settings.drive, { enabled: false }); }); d.meta.backupNudgeSnoozeUntil = null; delete d.meta.eggs;
    const { page } = await L.open(b, { data: d, wait: 1500 });
    const t1 = await page.evaluate(() => { const e = [...document.querySelectorAll('.banner')].find(x => /backup/.test(x.textContent)); return e.firstChild.textContent; });
    L.ok(/I'm not hurt\. I'm slightly hurt\./.test(t1) && /30 days ago/.test(t1), 'banner #5: personality on first display of an episode', t1);
    L.ok(/The newest copy of everything you've logged is the one on this device, and a backup takes a few taps\./.test(t1), 'banner #5: corrected ending (no "one phone")', t1);
    await page.evaluate(() => { App.refresh(); });
    await page.waitForTimeout(300);
    const t2 = await page.evaluate(() => { const e = [...document.querySelectorAll('.banner')].find(x => /backup/.test(x.textContent)); return e.firstChild.textContent; });
    L.eq(t2, t1, 'banner #5: stable across re-renders in the same session');
    await page.reload(); await page.waitForTimeout(1200);
    const t3 = await page.evaluate(() => { const e = [...document.querySelectorAll('.banner')].find(x => /backup/.test(x.textContent)); return e.firstChild.textContent; });
    L.ok(!/slightly hurt/.test(t3) && /last backup was 30 days ago/.test(t3), 'banner #5: next session shows plain functional text', t3);
    await page.close();
  }

  /* ---------- Voice rules ---------- */
  {
    const { page } = await L.open(b, { data, wait: 2500 });
    const r = await page.evaluate(() => {
      const out = {};
      for (let i = 1; i <= 9; i++) LINES['t3_' + i] = { t: 'p3 line ' + i, p: 'p3' };
      for (let i = 1; i <= 9; i++) LINES['t4_' + i] = { t: 'p4 line ' + i, p: 'p4' };
      LINES.once = { t: 'once {x}', p: 'p2' };
      Eggs.st.cnt = {}; Eggs.st.cap = { day: '', p3: 0, p4: 0 }; Eggs.st.seen = {};
      const tick = () => { Voice.spentUntil = 0; };
      tick(); out.a1 = Voice.claim('t3_1');            // 1st eligible -> shows
      tick(); out.a2 = Voice.claim('t3_2');            // 2nd -> silent
      tick(); out.a3 = Voice.claim('t3_3');            // 3rd -> silent
      tick(); out.a4 = Voice.claim('t3_4');            // 4th -> silent
      tick(); out.a5 = Voice.claim('t3_5');            // 5th -> shows
      tick(); out.a9 = Voice.claim('t3_6'); tick(); Voice.claim('t3_7'); tick(); Voice.claim('t3_8'); tick(); out.a9b = Voice.claim('t3_9'); // 9th -> would show but daily cap 2
      tick(); out.repeat = Voice.claim('t3_1');        // same line never twice
      out.capP3 = Eggs.st.cap.p3;
      tick(); out.b1 = Voice.claim('t4_1');            // P4 1st
      tick(); out.b2 = Voice.claim('t4_7');            // would be 7th? (cap p4=1 -> blocked)
      out.capP4 = Eggs.st.cap.p4;
      // spent window: right after a line, another is blocked and NOT consumed
      Eggs.st.cap = { day: Voice.today(), p3: 0, p4: 0 }; Eggs.st.cnt.p4 = 6;
      Voice.spentUntil = Date.now() + 1000;
      const before = Eggs.st.cnt.p4; out.stacked = Voice.claim('t4_2'); out.cntUnchanged = Eggs.st.cnt.p4 === before;
      // overlay suppresses
      Voice.spentUntil = 0; Celebrate.show([{ emoji: '🎉', title: 'x' }]);
      out.overlay = Voice.claim('once', { x: 1 }); Celebrate.close();
      Voice.spentUntil = 0; out.fill = Voice.claim('once', { x: 'ok' });
      // P2 not subject to cadence/caps
      return out;
    });
    L.ok(r.a1 === 'p3 line 1', 'P3: first eligible occurrence speaks', r.a1);
    L.ok(r.a2 === null && r.a3 === null && r.a4 === null, 'P3: occurrences 2–4 stay quiet');
    L.ok(r.a5 === 'p3 line 5', 'P3: every 4th eligible thereafter (5th)', r.a5);
    L.ok(r.a9b === null && r.capP3 === 2, 'P3: daily cap of 2 holds', { a9b: r.a9b, cap: r.capP3 });
    L.ok(r.repeat === null, 'a line is never repeated');
    L.ok(r.b1 === 'p4 line 1', 'P4: first eligible speaks', r.b1);
    L.ok(r.capP4 === 1 && r.b2 === null, 'P4: daily cap of 1 holds', r);
    L.ok(r.stacked === null && r.cntUnchanged, 'one voice per interaction: blocked candidate is not consumed', r);
    L.ok(r.overlay === null, 'overlay (Celebrate) suppresses personality');
    L.ok(r.fill === 'once ok', 'P2 speaks regardless of cadence; variables filled', r.fill);
    await page.close();
  }

  /* ---------- Language gate (TR) ---------- */
  {
    const d = JSON.parse(JSON.stringify(data)); delete d.meta.eggs;
    d.meta.lastBackupAt = new Date(Date.now() - 30 * 864e5).toISOString(); d.meta.backupNudgeSnoozeUntil = null; d.settings.drive = Object.assign({}, d.settings.drive, { enabled: false });
    const { page, errs } = await L.open(b, { data: d, lang: 'tr', wait: 2500 });
    L.ok(errs.length === 0, 'TR: no errors', errs);
    const r = await page.evaluate(() => {
      LINES.tt = { t: 'SECRET ENGLISH LINE', p: 'p2' };
      const c = Voice.claim('tt'); Voice.say('tt');
      return {
        on: PERSONALITY_ON, claimed: c, eggs: JSON.stringify(Store.state.meta.eggs),
        bodyHasEn: /slightly hurt|not hurt|SECRET ENGLISH/.test(document.body.innerText),
        banner: (([...document.querySelectorAll('.banner')].find(x => /yedek/i.test(x.textContent))) || {}).textContent || null,
        foot: ([...document.querySelectorAll('.footnote')].pop() || {}).textContent, lang: document.documentElement.lang
      };
    });
    await page.waitForTimeout(1500);
    const pers = await page.evaluate(() => document.querySelectorAll('.toast.pers').length);
    L.ok(r.on === false, 'TR: PERSONALITY_ON false');
    L.ok(r.claimed === null && pers === 0, 'TR: Voice never speaks');
    L.ok(!r.bodyHasEn, 'TR: no English personality text in the DOM');
    L.ok(JSON.parse(r.eggs).seeded === false && Object.keys(JSON.parse(r.eggs).cnt).length === 0 && Object.keys(JSON.parse(r.eggs).seen).length === 0, 'TR: personality state is not written', r.eggs);
    console.log('  TR banner:', r.banner && r.banner.slice(0, 100));
    L.ok(/Verilerin bu cihazda saklanıyor — son yedeğin 30 gün önce\./.test(r.banner || ''), 'TR: corrected functional banner is translated', r.banner);
    console.log('  TR foot:', r.foot);
    await page.close();
    // Drive-on TR footnote + banner
    const d2 = JSON.parse(JSON.stringify(d)); d2.settings.drive = Object.assign({}, d2.settings.drive, { enabled: true, lastSync: new Date(Date.now() - 20 * 864e5).toISOString() });
    const p2 = await L.open(b, { data: d2, lang: 'tr', wait: 2000 });
    const r2 = await p2.page.evaluate(() => ({ banner: (([...document.querySelectorAll('.banner')].find(x => /yedek/i.test(x.textContent))) || {}).textContent, foot: [...document.querySelectorAll('.footnote')].pop().textContent }));
    L.ok(/Google Drive eşitlemen 20 gün önce/.test(r2.banner || ''), 'TR: Drive-on banner translated', r2.banner);
    L.ok(/Google Drive'ında da eşitlenmiş bir kopyası var/.test(r2.foot), 'TR: Drive-on footnote translated', r2.foot);
    await p2.page.close();
  }

  /* ---------- seeding / restore ---------- */
  {
    const { page } = await L.open(b, { data, wait: 2500 });
    const r = await page.evaluate(async (backup) => {
      Eggs.conds.c_true = () => true; Eggs.conds.c_false = () => false; Eggs.conds.c_later = () => window.__later === true;
      Eggs.st.seen.keepme = '2026-11-01'; Eggs.st.cnt.p3 = 7; Eggs.st.logo = 3; Eggs.save();
      // backup without eggs, and with different eggs
      const inc = JSON.parse(JSON.stringify(backup)); inc.meta.eggs = { v: 1, seen: { other: 'x' }, cnt: { p3: 2, p4: 5 }, logo: 1 };
      const f = new File([JSON.stringify(inc)], 'b.json', { type: 'application/json' });
      const p = doRestore(f);
      await new Promise(r => setTimeout(r, 400));
      const btn = [...document.querySelectorAll('.dlg-wrap button')].find(x => /Restore/.test(x.textContent)); btn.click();
      await p;
      const e = Store.state.meta.eggs;
      return { seen: e.seen, cnt: e.cnt, logo: e.logo, seed: e.seed, voiceOut: document.querySelectorAll('.toast.pers').length, wk: Store.state.workouts.length };
    }, data);
    L.ok(r.seen.keepme && r.seen.other, 'restore: seen sets are unioned (local + backup)', r.seen);
    L.ok(r.cnt.p3 === 7 && r.cnt.p4 === 5, 'restore: counters take the max', r.cnt);
    L.ok(r.logo === 3, 'restore: logo counter max', r.logo);
    L.ok(r.seed.c_true === 1 && !r.seed.c_false, 'restore: currently-true conditions are seeded silently', r.seed);
    L.ok(r.wk === 14, 'restore: records restored', r.wk);
    await page.waitForTimeout(1200);
    const later = await page.evaluate(() => { window.__later = true; return Eggs.fresh(); });
    L.ok(later.indexOf('c_later') >= 0 && later.indexOf('c_true') < 0, 'fresh(): newly-true condition is eligible, seeded one is not', later);
    await page.close();
  }

  /* ---------- plain functional variants (EN + TR) ---------- */
  {
    const bannerOf = async (d, lang) => {
      const { page } = await L.open(b, { data: d, lang, wait: 1500 });
      const t = await page.evaluate(() => { const e = [...document.querySelectorAll('.banner')].find(x => /backup|synced|yedek/i.test(x.textContent)); return e ? e.firstChild.textContent : null; });
      await page.close(); return t;
    };
    const mkd = (stamp, drive, never) => {
      const d = JSON.parse(JSON.stringify(data)); d.meta.backupNudgeSnoozeUntil = null;
      d.meta.lastBackupAt = never ? null : new Date(stamp).toISOString();
      d.settings.drive = Object.assign({}, d.settings.drive, { enabled: drive, lastSync: drive && !never ? new Date(Date.now() - 20 * 864e5).toISOString() : null });
      const t = never ? 'never' : 'at' + Math.max(stamp, drive ? Date.now() - 20 * 864e5 : 0);
      d.meta.eggs = { v: 1, seeded: true, ep: { backup: t } };
      return d;
    };
    const st30 = Date.now() - 30 * 864e5;
    const exp = [
      ['plain never/noDrive', mkd(0, false, true), 'en', "Your data is stored only on this device, and you haven’t exported a backup yet."],
      ['plain never/Drive', mkd(0, true, true), 'en', 'Your data is stored on this device, and it hasn’t been backed up or synced to Google Drive yet.'],
      ['plain stale/noDrive', mkd(st30, false, false), 'en', 'Your data is stored on this device — your last backup was 30 days ago.'],
      ['plain stale/Drive', mkd(st30, true, false), 'en', 'Your data is stored on this device — your last backup or Google Drive sync was 20 days ago.'],
      ['TR never/noDrive', mkd(0, false, true), 'tr', 'Verilerin yalnızca bu cihazda saklanıyor ve henüz yedek dışa aktarmadın.'],
      ['TR never/Drive', mkd(0, true, true), 'tr', "Verilerin bu cihazda saklanıyor ve henüz yedeklenmedi ya da Google Drive'a eşitlenmedi."],
      ['TR stale/Drive', mkd(st30, true, false), 'tr', 'Verilerin bu cihazda saklanıyor — son yedeğin ya da Google Drive eşitlemen 20 gün önce.']
    ];
    for (const [n, d, lang, want] of exp) { const t = await bannerOf(d, lang); L.eq(t, want, 'banner text: ' + n); }
    // About footnote (EN + TR)
    for (const [lang, re] of [['en', /Your data lives on this device; optional Google Drive sync keeps a copy in your own Drive\./], ['tr', /Verilerin bu cihazda durur; isteğe bağlı Google Drive eşitlemesi kendi Drive'ında bir kopya tutar\./]]) {
      const { page } = await L.open(b, { data, lang, wait: 1200 });
      const t = await page.evaluate(async () => { openSettingsPage(); await new Promise(r => setTimeout(r, 500)); return [...document.querySelectorAll('.page-body')].map(x => x.innerText).join('\n'); });
      L.ok(re.test(t), 'About footnote corrected (' + lang + ')', t.slice(-300));
      await page.close();
    }
  }

  await b.close();
  L.done('phase0');
})();
