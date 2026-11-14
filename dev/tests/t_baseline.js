const L = require('./lib');
(async () => {
  const b = await L.launch();
  const data = L.backup();
  const { page, errs } = await L.open(b, { data });
  L.ok(errs.length === 0, 'baseline: no page errors', errs);
  const info = await page.evaluate(() => ({ v: APP_VERSION, wk: Store.state.workouts.length, ci: Store.state.checkIns.length, ach: (Store.state.meta.achSeen || []).length, eggs: Store.state.meta.eggs }));
  console.log(info);
  L.ok(info.wk === 14, 'fixture loaded: 14 workouts', info);
  await b.close(); L.done('baseline');
})();
