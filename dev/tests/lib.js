const { chromium } = require('playwright');
const fs = require('fs');
const APP = process.env.APP || require('path').resolve(__dirname, '../../index.html');
const BACKUP = process.env.BACKUP || '/mnt/user-data/attachments/1fae91ea-c523-5b60-87a6-30182b6fd764/d4d8ff37-tempo-backup-20261114.json';
let pass = 0, fail = 0; const failures = [];
function ok(cond, name, extra) { if (cond) { pass++; } else { fail++; failures.push(name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); console.log('  FAIL', name, extra !== undefined ? JSON.stringify(extra) : ''); } }
function eq(a, b, name) { const A = JSON.stringify(a), B = JSON.stringify(b); ok(A === B, name, { got: a, want: b }); }
async function launch() { return chromium.launch(); }
/* open the app with a given localStorage payload (object or null), language and extra init script */
async function open(browser, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 400, height: 860 }, reducedMotion: o.reducedMotion ? 'reduce' : 'no-preference', ...(o.ctx || {}) });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.errs = errs;
  const data = o.data === undefined ? null : o.data;
  await page.addInitScript(({ data, lang, extra }) => {
    try { if (!localStorage.getItem('__seeded')) { localStorage.setItem('__seeded', '1'); if (data) localStorage.setItem('tempo_data', JSON.stringify(data)); if (lang) localStorage.setItem('tempo_lang', lang); } } catch (e) {}
    if (extra) { try { (new Function(extra))(); } catch (e) {} }
  }, { data, lang: o.lang || null, extra: o.init || '' });
  await page.goto('file://' + APP);
  await page.waitForTimeout(o.wait == null ? 1500 : o.wait);
  return { page, ctx, errs };
}
function backup() { return JSON.parse(fs.readFileSync(BACKUP, 'utf8')); }
function done(name) { console.log(`${name}: ${pass} passed, ${fail} failed`); if (fail) { console.log(failures.join('\n')); } return { pass, fail }; }
module.exports = { launch, open, backup, ok, eq, done, APP, counts: () => ({ pass, fail }) };
