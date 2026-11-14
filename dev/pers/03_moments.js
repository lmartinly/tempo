/* ---- Phase 2a: eight personalized moments (each rests on something the log really holds; none quotes a note, symptom or mood) ---- */
const NUM_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const NUM_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function numWords(n) {
  n = Math.floor(n);
  if (n < 20) return NUM_ONES[n];
  if (n < 100) return NUM_TENS[Math.floor(n / 10)] + (n % 10 ? '-' + NUM_ONES[n % 10] : '');
  if (n < 1000) return NUM_ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numWords(n % 100) : '');
  return String(n);
}
const capFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function listOr(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1]; }
function keyDate(k) { return new Date(k + 'T12:00:00'); }

(function () {
  const L = (id, t) => { LINES[id] = { p: 'p2', t }; };
  L('m1', "{N} workouts, every one on {days}. That isn't a schedule, it's a treaty, and you're honoring it with alarming dignity.");
  L('m2', "{words} tonnes so far. I'd round it to 'a lot', but you've earned the decimal.");
  L('m2b', "A hundred tonnes. The round number finally showed up, and I gave the decimal the day off.");
  L('m3rage1', 'Rage opens with a treadmill warm-up, then goes straight to the leg press. The most organized rage on record.');
  L('m3rage2', 'Rage again. The warm-up remains impeccable.');
  L('m3ly2', "{title}, second performance. At this point it's a residency.");
  L('m3ly3', '{title}, a third night. The residency has been extended and the critics are cautiously optimistic.');
  L('m4', "{date}: a Friday the 13th, exactly {weeks} weeks after your first recorded entry, and a day you trained. If I believed in omens, I'd be insufferable about this.");
  L('m5', "Surprise Me chose {lens} as your lens. I'd love to claim intuition, but it was a coin toss with extra steps.{wall}");
  L('m6', "{date}: {kg} kg. That's the exact midpoint between your first recorded weigh-in and the goal you set, down to the decimal. The goal is yours; the arithmetic is just backing you up.");
  L('m7a', "Card One: sixteen squares, sixteen filled. I built it as something to chase and you caught the lot. I'm choosing to take that personally.");
  L('m7b', 'Card Two has {n} squares done and a long way to go. Good. I wrote it hard on purpose.');
  L('m7c', "Card Two is open. Card One isn't even finished and you've already moved on to the sequel.");
  L('m8', 'Energy: 5 out of 5. A first, in all this time. I had started to suspect the top rating was a rumor.');
})();
const MOMENT_WALL = " The Studio is unlocked and the Gallery is empty, which isn't a problem, just a very clean wall.";

/* titles that name a health condition get no riff, ever */
const HEALTH_TITLE = /pmdd|pms\b|period|cycle|migraine|headache|nause|sick|\bill\b|illness|flu\b|cold\b|fever|pain|injur|cramp|depress|anxi|panic|adhd|diabet|asthma|ibs\b|crohn|pcos|endo|covid|infect|surg|chemo|therap|bleed|vomit|dizz|mood|grief|cancer|pregnan/i;
function titleNorm(w) { return String(workoutTitle(w) || '').trim().toLowerCase(); }

/* ---- surfaces: a moment shows at most once, when she opens the place it belongs to ---- */
const MOMENT_EVAL = {
  m1() {
    const ws = Store.state.workouts; if (ws.length < 10) return null;
    const plan = plannedWorkoutDays(), days = new Set();
    for (const w of ws) { const d = new Date(w.dateTime).getDay(); if (plan.indexOf(d) < 0) return null; days.add(d); }
    if (days.size < 2) return null;
    const order = [1, 2, 3, 4, 5, 6, 0].filter(d => days.has(d)).map(d => WEEKDAY_NAMES[d]);
    return { N: capFirst(numWords(ws.length)), days: 'a ' + listOr(order) };
  },
  m2() {
    const kg = Store.state.workouts.reduce((a, w) => a + workoutVolume(w), 0), t = Math.round(kg / 100) / 10;
    if (t < 10 || t >= 100 || t === Math.floor(t)) return null;
    const ip = Math.floor(t), dg = Math.round((t - ip) * 10);
    return { words: capFirst(numWords(ip)) + ' point ' + NUM_ONES[dg] };
  },
  m2b() { return Store.state.workouts.reduce((a, w) => a + workoutVolume(w), 0) >= 100000 ? {} : null; },
  m6() {
    const sw = startWeight(), g = +Store.state.settings.goalKg || 0; if (sw == null || !(g > 0) || !(sw > g)) return null;
    const a = Math.round(sw * 10), b = Math.round(g * 10); if ((a + b) % 2) return null;
    const mid = (a + b) / 2, hit = dailyWeightSeries().find(d => Math.round(d.kg * 10) === mid);
    if (!hit) return null;
    const d = keyDate(hit.k);
    return { date: MONTH_LONG[d.getMonth()] + ' ' + d.getDate(), kg: fmtKg(hit.kg) };
  }
};
function persMoment(id) {
  if (!PERSONALITY_ON) return '';
  const cache = Voice.capCache;
  if (cache[id] === undefined) {
    if (Eggs.st.seen[id]) return '';
    const v = MOMENT_EVAL[id] && MOMENT_EVAL[id]();
    if (!v) return '';
    const t = Voice.claim(id, v);
    if (!t) return '';
    cache[id] = t;
  }
  return '<div class="pers-note" data-notr>✉️ ' + esc(cache[id]) + '</div>';
}
function persMomentHtml() { for (let i = 0; i < arguments.length; i++) { const h = persMoment(arguments[i]); if (h) return h; } return ''; }

/* moment 4: a Friday the 13th that really is a whole number of weeks after her first record, and a training day */
function persCalDay(k) {
  if (!PERSONALITY_ON || !k) return '';
  const cache = Voice.capCache;
  if (cache.m4 === undefined) {
    if (Eggs.st.seen.m4) return '';
    const d = keyDate(k); if (!(d.getDay() === 5 && d.getDate() === 13)) return '';
    const sk = trackingStartKey(); if (!sk) return '';
    const s = keyDate(sk), diff = daysBetween(s, d);
    if (s.getDay() !== 5 || diff < 7 || diff % 7) return '';
    if (!Store.state.workouts.some(w => dateKey(w.dateTime) === k)) return '';
    const t = Voice.claim('m4', { date: MONTH_LONG[d.getMonth()] + ' ' + d.getDate(), weeks: numWords(diff / 7) });
    if (!t) return '';
    cache.m4 = t;
  }
  return '<div class="pers-note" data-notr>✉️ ' + esc(cache.m4) + '</div>';
}

/* moment 7 (Bingo): live card state */
function persBingoMoment(card) {
  const st = Eggs.st, u2 = bingoCard2Unlocked();
  if (!st.seen.m7a && bingoState(1).done >= 16) return Voice.claim('m7a') || '';
  if (u2 && card === 2) {
    const n2 = bingoState(2).done, n1 = bingoState(1).done;
    if (n1 >= 16 && !st.seen.m7b && n2 < 16) return Voice.claim('m7b', { n: String(n2) }) || '';
    if (n1 < 16 && !st.seen.m7c) return Voice.claim('m7c') || '';
  }
  return '';
}

/* moment 5: first time PRISM's Studio is opened */
const _openStudioPage = openStudioPage;
openStudioPage = function () {
  const r = _openStudioPage.apply(this, arguments);
  if (PERSONALITY_ON && !Eggs.st.seen.m5) {
    try {
      const s = plSeasons().slice().reverse().find(x => x.surprise && x.lens);
      if (s) {
        const nm = { energy: 'Energy', movement: 'Movement', tracking: 'Tracking Patterns' }[s.lens];
        const wall = playGallery().length === 0 ? MOMENT_WALL : '';
        if (nm) { const t = Voice.claim('m5', { lens: nm, wall }); if (t) Voice.show(t, { delay: 1100 }); }
      }
    } catch (e) {}
  }
  return r;
};

/* moments 3 and 8 ride on the save flows */
function persTitleCands(saved) {
  const t = titleNorm(saved), raw = String(workoutTitle(saved) || '').trim();
  const out = [];
  if (!saved.dayName && !saved.programName) return out;
  if (!t || t === 'workout' || HEALTH_TITLE.test(t)) return out;
  const n = Store.state.workouts.filter(w => titleNorm(w) === t).length;
  const es = saved.entries || [];
  const warm = es[0] && normKind(es[0].kind) === 'treadmill' && es[1] && /^leg press/i.test(es[1].name);
  if (t === 'rage' && warm) { if (n === 1) out.push({ id: 'm3rage1' }); else if (n >= 2) out.push({ id: 'm3rage2' }); }
  else if (t === 'lose yourself') { if (n === 2) out.push({ id: 'm3ly2', vars: { title: raw } }); else if (n === 3) out.push({ id: 'm3ly3', vars: { title: raw } }); }
  return out;
}
function persEnergyFive(rec, prevAll) {
  if (!rec || +rec.energy !== 5) return false;
  const others = prevAll.filter(c => c.dateKey !== rec.dateKey && c.energy != null);
  return others.length >= 10 && others.every(c => +c.energy < 5);
}
