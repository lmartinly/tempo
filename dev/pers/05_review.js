/* ---- Phase 3a: Tempo's Review of You (hold the version number in About for 3 s) ----
   A fake store listing for an app called "You". Every review rests on something the log really holds; none judges a body
   or a behaviour; weight, symptoms, mood and notes never appear. Nothing here is scored, counted or exposed as progress. */
const RV = { sort: 'helpful', page: 0, shuffle: null, helpful: {}, report: {}, replied: {}, entry: null };
const rvEp = () => { const ep = Eggs.st.ep; if (!ep.rv || typeof ep.rv !== 'object' || Array.isArray(ep.rv)) ep.rv = {}; return ep.rv; };
const rvStars = n => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
const rvDayPlural = d => WEEKDAY_NAMES[d] + 's';

function rvFacts() {
  const S = Store.state, ws = S.workouts || [];
  const f = { workouts: ws.length };
  /* total volume (tenths of a tonne) */
  const kg = ws.reduce((a, w) => a + workoutVolume(w), 0);
  f.tenthsT = Math.round(kg / 100);
  /* planned days honoured by every workout */
  const plan = plannedWorkoutDays();
  f.plan = plan.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  f.onPlan = ws.length >= 5 && plan.length > 0 && ws.every(w => plan.indexOf(new Date(w.dateTime).getDay()) >= 0);
  /* titled workouts (health-condition titles are never material) */
  const titles = {};
  ws.forEach(w => {
    const t = titleNorm(w); if (!t || t === 'workout' || HEALTH_TITLE.test(t)) return;
    if (!w.dayName && !w.programName) return;
    (titles[t] = titles[t] || { n: 0, raw: String(workoutTitle(w)).trim() }).n++;
  });
  f.rage = titles.rage ? titles.rage.n : 0;
  let rep = null;
  Object.keys(titles).forEach(t => { if (t === 'rage') return; if (titles[t].n >= 2 && (!rep || titles[t].n > rep.n)) rep = titles[t]; });
  f.repeat = rep;
  /* Friday the 13th workout */
  f.fri13 = ws.some(w => { const d = new Date(w.dateTime); return d.getDay() === 5 && d.getDate() === 13; });
  /* heaviest lift */
  let heavy = null;
  ws.forEach(w => (w.entries || []).forEach(e => { if (!isStrength(e.kind)) return; (e.sets || []).forEach(s => { if (+s.kg > 0 && (!heavy || +s.kg > heavy.kg)) heavy = { kg: +s.kg, name: e.name }; }); }));
  f.heavy = heavy;
  f.surprise = plSeasons().some(s => s && s.surprise);
  f.card1 = bingoState(1).done >= 16;
  return f;
}

function rvBuild() {
  const f = rvFacts(), today = Voice.today(), base = rvEp(), counts = {}, out = [];
  const add = (id, stars, title, text, upd) => out.push({ id, stars, title, text, upd: upd || '' });
  const moved = (id, now) => { counts[id] = now; return base['n:' + id] != null && now > base['n:' + id]; };
  if (f.rage >= 1) add('rage', 5, 'Rage, but with a timetable', 'Titled a workout Rage, then ran it like a well-staffed conference. Would be intimidated again.',
    moved('rage', f.rage) ? 'Updated: Rage has been run again. Warm-up unchanged. I withdraw my earlier concerns, which were fictional.' : '');
  if (f.onPlan) add('table', 5, 'Has a timetable. Uses it.', f.plan.map(rvDayPlural).join(', ') + '. Operates like a very small railway with excellent punctuality and no complaints.',
    moved('table', f.workouts) ? "Updated: now with a track record. Upgrading from 'punctual' to 'a little frightening'." : '');
  if (f.tenthsT >= 10) add('vol', 5, 'Moves a lot, keeps the receipt', (f.tenthsT / 10).toFixed(1) + " tonnes. I'd have rounded it to 'a lot', but this user insisted on the decimal. Respect.",
    moved('vol', f.tenthsT) ? 'Updated: the receipt has grown. ' + (f.tenthsT / 10).toFixed(1) + ' t now. The decimal has been promoted.' : '');
  add('exceeds', '5 out of 4', 'Exceeds the form', "Rated higher than the scale permits. I've submitted a request to widen the scale. Pending.");
  if (f.surprise) add('prism', 5, 'Trusts a prism', 'Pressed Surprise Me and accepted the result without argument. Braver than most people with a menu.');
  if (!base.star) base.star = today;
  add('star', base.star < today ? 5 : 4, 'One star withheld on principle', "Everyone loses one on principle. It's policy. It's not about you. It's slightly about you.",
    base.star < today ? 'Updated: principle reconsidered. User outlasted it. Fifth star restored.' : '');
  if (f.card1) add('card1', 5, 'Finished what I made', "Completed Bingo Card One, which I designed to be annoying. I'll be taking this personally. Five stars.");
  if (f.fri13) add('fri13', 5, 'Declined to be spooked', "Trained on a Friday the 13th with a black cat in the building. This user didn't blink. The cat did.");
  if (f.heavy) add('heavy', 5, 'I was there', 'Moved ' + fmtW(f.heavy.kg) + ' kg on ' + f.heavy.name + ' and treated it like admin. It wasn\'t admin. I was there.');
  if (f.repeat) add('repeat', 5, 'A residency, in effect', "Has now performed '" + f.repeat.raw + "' " + (f.repeat.n === 2 ? 'twice' : numWords(f.repeat.n) + ' times') + '. Tickets sold: none. Standing ovation: one, me.');
  add('mgmt', 5, 'Cleared by management', 'Tempo has reviewed Tempo reviewing this user and approves. Management has been informed. I am management.');
  Object.keys(counts).forEach(id => { base['n:' + id] = counts[id]; });
  return out;
}

function rvPersonaEmoji() {
  try { const p = personaList(weekWindowStats(dateKey(new Date())), { scope: 'week', prior: [] })[0]; if (p) return p.emoji; } catch (e) {}
  return '🫧';
}
function rvWeeks() { const k = trackingStartKey(); return k ? Math.max(1, Math.floor(daysBetween(keyDate(k), new Date()) / 7)) : 1; }
const RV_NEW = ['Now with more Fridays. Bug fixes: none required.', 'Performance improvements: the user has been performing.', 'Improved opinions. Reduced patience for nonsense.', 'Fixed: nothing. Nothing needed fixing.'];
const RV_REPORT = ['This review is too accurate', "I don't remember doing that", 'This is rude but affectionate', 'Other'];
const RV_SORTS = [['helpful', 'Most Helpful'], ['recent', 'Most Recent'], ['opinionated', 'Most Opinionated']];

function rvOrder(list) {
  if (RV.sort === 'recent') return list.slice().reverse();
  if (RV.sort === 'opinionated') {
    if (!RV.shuffle) { const a = list.map((r, i) => i); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } RV.shuffle = a; }
    return RV.shuffle.map(i => list[i]).filter(Boolean);
  }
  return list;
}
function rvReviewHtml(r) {
  const star = typeof r.stars === 'number' ? '<span class="rv-st" aria-label="' + r.stars + ' out of 5">' + rvStars(r.stars) + '</span>' : '<span class="rv-st" aria-label="' + esc(r.stars) + '">★★★★★ <small>' + esc(r.stars) + '</small></span>';
  const rep = RV.report[r.id];
  return '<div class="rv-card" data-rv="' + r.id + '">' +
    '<div class="rv-top">' + star + (r.upd ? '<span class="rv-tag">Updated</span>' : '') + '</div>' +
    '<div class="rv-title">' + esc(r.title) + '</div><div class="rv-by">Tempo</div>' +
    '<div class="rv-text">' + esc(r.text) + '</div>' +
    (r.upd ? '<div class="rv-update">' + esc(r.upd) + '</div>' : '') +
    (RV.replied[r.id] ? '<div class="rv-dev"><b>Developer Response</b><span>You</span><div>Noted.</div></div>' : '') +
    '<div class="rv-acts"><button class="rv-link" data-rv-act="helpful" data-id="' + r.id + '">Helpful</button><button class="rv-link" data-rv-act="report" data-id="' + r.id + '">Report a Concern</button></div>' +
    (RV.helpful[r.id] ? '<div class="rv-fb">1 person found this helpful. It was you.</div>' : '') +
    (RV.report[r.id] === 'open' ? '<div class="rv-menu">' + RV_REPORT.map((t, i) => '<button class="rv-opt" data-rv-act="pick" data-id="' + r.id + '" data-i="' + i + '">' + esc(t) + '</button>').join('') + '</div>' : '') +
    (rep === 'done' ? '<div class="rv-fb">Thank you. Your concern was received, reviewed and found adorable. No action taken.</div>' : '') +
    '</div>';
}
function rvHtml() {
  const list = RV.list, ord = rvOrder(list), n = ord.length, per = 3;
  const start = (RV.page * per) % Math.max(n, 1);
  const shown = []; for (let i = 0; i < Math.min(per, n); i++) shown.push(ord[(start + i) % n]);
  const wk = rvWeeks(), hist = [1, 2, 3].filter(i => wk - i >= 1);
  return '<div class="rv" data-notr>' +
    '<div class="rv-hd"><div class="rv-icon">' + RV.emoji + '</div><div><div class="rv-name">You</div><div class="rv-sub">Reviewed by Tempo. Opinions are Tempo\'s own and cannot be appealed.</div></div></div>' +
    '<div class="rv-btns"><button class="rv-get" data-rv-act="write">Write a Review</button><button class="rv-share off" aria-disabled="true" data-rv-act="share">Share</button></div>' +
    '<div class="rv-msg" id="rv-msg" aria-live="polite"></div>' +
    '<div class="rv-sec"><h3>Ratings &amp; Reviews</h3><label class="rv-sortlbl">Sort by <select id="rv-sort" data-rv-act="sort">' +
      RV_SORTS.map(s => '<option value="' + s[0] + '"' + (RV.sort === s[0] ? ' selected' : '') + '>' + s[1] + '</option>').join('') + '</select></label></div>' +
    shown.map(rvReviewHtml).join('') +
    '<button class="rv-more" data-rv-act="more">More reviews</button>' +
    '<div class="rv-sec"><h3>What\'s New</h3><span class="rv-ver">Version ' + wk + (wk === 1 ? ' week' : ' weeks') + '</span></div>' +
    '<div class="rv-box">' + esc(RV_NEW[wk % 4]) + '</div>' +
    '<div class="rv-sec"><h3>Version History</h3></div>' +
    (hist.length ? hist.map(i => '<div class="rv-box"><span class="rv-ver">Version ' + (wk - i) + ((wk - i) === 1 ? ' week' : ' weeks') + '</span><div>' + esc(RV_NEW[(wk - i) % 4]) + '</div></div>').join('') : '<div class="rv-box"><span class="rv-ver">Version 1 week</span><div>' + esc(RV_NEW[1]) + '</div></div>') +
    '<div class="rv-sec"><h3>Information</h3></div><div class="rv-info">' +
    [['Seller', 'You'], ['Category', 'Lifestyle, highly opinionated'], ['Compatible with', 'Mondays, Wednesdays and Fridays'], ['Age rating', '4+, frequent mild teasing'],
     ['Privacy', 'Tempo has opinions about you and cannot be stopped from sharing them with you.'], ['In-App Purchases', 'None'], ['Family Sharing', "No. There's only one of you."],
     ['Languages', 'English, Turkish'], ['Copyright', 'You']].map(r => '<div class="rv-row"><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>').join('') +
    '</div></div>';
}
function rvMsg(t) { const m = document.getElementById('rv-msg'); if (!m) return; m.textContent = t; m.classList.add('on'); clearTimeout(rvMsg.t); rvMsg.t = setTimeout(() => m.classList.remove('on'), 3200); }
function rvRender() {
  const e = RV.entry; if (!e || !e.page.isConnected) return;
  const body = e.page.querySelector('.page-body'); if (!body) return;
  const keep = e.page.scrollTop;
  body.innerHTML = rvHtml(); e.page.scrollTop = keep;
}
function openReviewPage() {
  if (!PERSONALITY_ON) return;
  RV.sort = 'helpful'; RV.page = 0; RV.shuffle = null; RV.helpful = {}; RV.report = {}; RV.replied = {};
  RV.list = rvBuild(); RV.emoji = rvPersonaEmoji();
  persDisc('review'); Eggs.save();
  RV.entry = Pages.push({ title: 'You', render(body) { body.innerHTML = rvHtml(); } });
  /* pull down at the top to refresh */
  const page = RV.entry.page; let y0 = null, pulled = false;
  page.addEventListener('touchstart', e => { y0 = page.scrollTop <= 0 ? e.touches[0].clientY : null; pulled = false; }, { passive: true });
  page.addEventListener('touchmove', e => { if (y0 != null && e.touches[0].clientY - y0 > 80) pulled = true; }, { passive: true });
  page.addEventListener('touchend', () => { if (pulled) { pulled = false; rvMsg('Reviews refreshed. My opinion of you has not gone down.'); } y0 = null; }, { passive: true });
  page.addEventListener('click', e => {
    const b = e.target.closest('[data-rv-act]'); if (!b || b.tagName === 'SELECT') return;
    const a = b.getAttribute('data-rv-act'), id = b.getAttribute('data-id');
    if (a === 'helpful') { RV.helpful[id] = true; rvRender(); }
    else if (a === 'report') { RV.report[id] = RV.report[id] === 'open' ? null : 'open'; rvRender(); }
    else if (a === 'pick') { RV.report[id] = 'done'; RV.replied[id] = true; rvRender(); }
    else if (a === 'write') rvMsg('Tempo is currently the only reviewer. Please hold.');
    else if (a === 'share') rvMsg('This one stays between us.');
    else if (a === 'more') { RV.page++; rvRender(); }
  });
  page.addEventListener('change', e => { if (e.target.id === 'rv-sort') { RV.sort = e.target.value; RV.page = 0; RV.shuffle = null; rvRender(); } });
}

/* ---- hold the version number for 3 seconds ---- */
(function () {
  let timer = null, sx = 0, sy = 0;
  const stop = () => { if (timer) { clearTimeout(timer); timer = null; } };
  document.addEventListener('pointerdown', e => {
    if (!PERSONALITY_ON) return;
    const row = e.target.closest && e.target.closest('[data-vhold]'); if (!row) return;
    stop(); sx = e.clientX; sy = e.clientY;
    timer = setTimeout(() => { timer = null; openReviewPage(); }, 3000);
  }, true);
  document.addEventListener('pointermove', e => { if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 14) stop(); }, true);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => document.addEventListener(t, stop, true));
  document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('[data-vhold]')) e.preventDefault(); });
})();
function persVerAttr() { return PERSONALITY_ON ? ' data-vhold="1"' : ''; }
