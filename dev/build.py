#!/usr/bin/env python3
"""Rebuilds /tmp/w/app/index.html from index.orig.html + pers/*.js + pers/pers.css (repeatable)."""
import re, json, glob, sys, os
D = os.path.dirname(os.path.abspath(__file__))
src = open(D + '/index.orig.html', encoding='utf8').read()

def sub1(s, old, new, label):
    n = s.count(old)
    if n != 1:
        sys.exit('PATCH FAIL (%d matches): %s' % (n, label))
    return s.replace(old, new)

s = src
# --- version
s = sub1(s, "const APP_VERSION = '2.1.2';", "const APP_VERSION = '2.2.0';", 'version')
# --- state normalisation (meta.eggs)
s = sub1(s, "    d.schemaVersion = SCHEMA;\n    return d;\n  },\n  /* MIGRATIONS[n]",
         "    d.meta.eggs = eggsNorm(d.meta.eggs);\n    d.schemaVersion = SCHEMA;\n    return d;\n  },\n  /* MIGRATIONS[n]", 'normalize')
# --- backup nudge: expose the stamp that defines a staleness episode
s = sub1(s, "return days >= 14 ? { days } : null;", "return days >= 14 ? { days, stamp: Math.max.apply(null, stamps) } : null;", 'nudge stamp')
# --- dashboard banner: accurate + personality-aware
s = sub1(s, "    (bk.never ? 'Your data lives only on this device, and you haven’t exported a backup from here yet.' : 'Your data lives only on this device — your last backup was ' + bk.days + ' days ago.') +\n",
         "    esc(backupBannerText(bk)) +\n", 'banner')
# --- dashboard footnote
s = sub1(s, "'<div class=\"footnote\" style=\"text-align:center\">Everything is stored on this device.' + (Store.state.settings.drive.enabled ? ' Google Drive sync is on.' : '') + ' This is a tracking tool, not medical advice.</div>'",
         "'<div class=\"footnote\" style=\"text-align:center\">' + dashFootnoteText() + '</div>'", 'footnote')
# --- About footnote
s = sub1(s, "not medical advice. All data lives on your device.</div></div>'",
         "not medical advice. Your data lives on this device; optional Google Drive sync keeps a copy in your own Drive.</div></div>'", 'about')
# --- restore: keep personality state, then reseed silently
s = sub1(s, "  Store.state = migrated;\n  Store.persist();\n  if (legacyPhotos",
         "  migrated.meta.eggs = Eggs.mergeRestore(Store.state.meta && Store.state.meta.eggs, migrated.meta && migrated.meta.eggs);\n  Store.state = migrated;\n  Store.persist();\n  Eggs.reseed();\n  if (legacyPhotos", 'restore')
# --- drive merge: reseed after remote data lands
s = sub1(s, "            Store.state = mergeDriveState(Store.state, remoteMigrated);\n            Store.persist();\n",
         "            Store.state = mergeDriveState(Store.state, remoteMigrated);\n            Store.persist();\n            Eggs.reseed();\n", 'drive')
# --- boot
s = sub1(s, "function boot() {\n  Store.load();\n  applyTheme();\n", "function boot() {\n  Store.load();\n  Eggs.init();\n  applyTheme();\n", 'boot')


# ================= Phase 1 patches =================
s = sub1(s, "  const saved = Actions.saveWorkout(rec);\n  Pages.pop(false);\n  setTimeout(() => openWorkoutDetailSheet(saved.id, true), 340);\n  if (prs.length) Celebrate.show(prs.slice(0, 5).map(p => ({ emoji: '🏅', kicker: 'Personal record', title: p.name, sub: fmtW(p.set.kg) + ' kg × ' + p.set.reps })));\n}",
         "  const saved = Actions.saveWorkout(rec);\n  const pf = persWorkoutFacts(rec, saved, prs, !!d.editingId);\n  Pages.pop(false);\n  setTimeout(() => openWorkoutDetailSheet(saved.id, true), 340);\n  if (prs.length) Celebrate.show(persDecoratePR(prs.slice(0, 5).map(p => ({ emoji: '🏅', kicker: 'Personal record', title: p.name, sub: fmtW(p.set.kg) + ' kg × ' + p.set.reps })), pf));\n  persAfterWorkout(pf, prs.length > 0);\n  setTimeout(persCheck, 1500);\n}", 'finishWorkout')
s = sub1(s, "toast('Saved to Programs'); });", "toast('Saved to Programs'); { const t = Voice.claim('l12'); if (t) Voice.show(t); } });", 'saved to programs')
s = sub1(s, "toast('Saved to your Gallery');", "toast('Saved to your Gallery'); { const t = Voice.claim('l27'); if (t) Voice.show(t); }", 'gallery')
s = sub1(s, "plSeasons().push(s); Store.save();", "plSeasons().push(s); Store.save(); { const t = Voice.claim('l24'); if (t) Voice.show(t, { delay: 1100 }); }", 'prism begin')
s = sub1(s, "(st.pick === r.answer ? 'You called it.' : 'The other one, this time.') + '</div>", "(st.pick === r.answer ? 'You called it.' : 'The other one, this time.') + persPlayWhich(st, r) + '</div>", 'which week')
s = sub1(s, "(right === 3 ? 'All three in place.' : right + ' of 3 in the right place.') + '</div>';", "(right === 3 ? 'All three in place.' : right + ' of 3 in the right place.') + persPlayShuffle(st, right) + '</div>';", 'shuffle')
s = sub1(s, "    Celebrate.show(fresh);\n  } catch (e) {}", "    Celebrate.show(persDecorateAch(fresh));\n    setTimeout(persCheck, 600);\n  } catch (e) {}", 'ach decorate')
s = sub1(s, "'This describes what was logged — it does not show that one causes the other.</div>';\n  return h;", "'This describes what was logged — it does not show that one causes the other.</div>' + persLab15(st.ci);\n  return h;", 'lab15')
s = sub1(s, "what can be seen is plotted above (needs about 8).</div>';", "what can be seen is plotted above (needs about 8).</div>' + persLab16();", 'lab16')
s = sub1(s, "(d > 0 ? ' (+' + d + ' since saved)' : '') + '</div></button>' +", "(d > 0 ? ' (+' + d + ' since saved)' : '') + '</div>' + (d >= 2 ? Voice.capHtml('l17', { n: d }) : '') + '</button>' +", 'lab17')
s = sub1(s, "esc([r.extra, r.when].filter(Boolean).join(' · ')) + '</div></div>' +", "esc([r.extra, r.when].filter(Boolean).join(' · ')) + '</div>' + persRecordCap(r, cut) + '</div>' +", 'records caps')
s = sub1(s, "    workoutStripHtml(now) +\n    '<div class=\"btnrow\" style=\"margin-top:10px\">' +", "    workoutStripHtml(now) + persDraftLine(draft) +\n    '<div class=\"btnrow\" style=\"margin-top:10px\">' +", 'draft line')
s = sub1(s, "      let h = '';\n      if (bingoCard2Unlocked()) {", "      let h = persBingoHtml();\n      if (bingoCard2Unlocked()) {", 'bingo note')

# ================= Phase 2 patches =================
s = sub1(s, "      let h = '';\n      if (draft) h += '<div class=\"banner\" style=\"background:var(--coral-soft);color:var(--coral-deep)\"><b>Workout in progress</b>'", "      let h = persMomentHtml('m1');\n      if (draft) h += '<div class=\"banner\" style=\"background:var(--coral-soft);color:var(--coral-deep)\"><b>Workout in progress</b>'", 'm1 workouts page')
s = sub1(s, "body.innerHTML = '<div class=\"footnote\" style=\"margin:0 0 12px\">Your personal bests, straight", "body.innerHTML = persMomentHtml('m2b', 'm2') + '<div class=\"footnote\" style=\"margin:0 0 12px\">Your personal bests, straight", 'm2 records')
s = sub1(s, "      let h = '';\n      h += '<div class=\"card\">';\n      if (cw) {", "      let h = persMomentHtml('m6');\n      h += '<div class=\"card\">';\n      if (cw) {", 'm6 weight page')
s = sub1(s, "        h += '<div class=\"sec-label\">' + fmtDate(selDate) + '</div>';\n        if (!recs.length)", "        h += '<div class=\"sec-label\">' + fmtDate(selDate) + '</div>' + persCalDay(calState.selKey);\n        if (!recs.length)", 'm4 calendar day')
s = sub1(s, "          '<span class=\"num\">' + c.getDate() + '</span>' +\n          '<span class=\"cal-dots\">'", "          persCatHtml(c, k) + '<span class=\"num\">' + c.getDate() + '</span>' +\n          '<span class=\"cal-dots\">'", 'cat cell')
s = sub1(s, "    if (s.a === s.b) return h + '<div class=\"footnote\" style=\"margin:0\">Choose two different variables.</div></div>';\n    const pairs = labPairs(s.a, s.b, s.gran, +s.lag, range);", "    if (s.a === s.b) { persLabSame(s); return h + '<div class=\"footnote\" style=\"margin:0\">Choose two different variables.</div></div>'; }\n    persLabDiff();\n    const pairs = labPairs(s.a, s.b, s.gran, +s.lag, range);", 'lab same')

# ================= Phase 3 patches =================
s = sub1(s, "'<div class=\"kv\"><span>Version</span><b>' + APP_VERSION + '</b></div>' +", "'<div class=\"kv\"' + persVerAttr() + '><span>Version</span><b>' + APP_VERSION + '</b></div>' +", 'about version hold')
s = sub1(s, "        (Store.state.meta.quarantineKey ? '<div class=\"banner warn\" style=\"margin-top:10px\">A data snapshot was quarantined", "        persArchiveRow() +\n        (Store.state.meta.quarantineKey ? '<div class=\"banner warn\" style=\"margin-top:10px\">A data snapshot was quarantined", 'archive row')
s = sub1(s, "slides.push(personaSlide(persona, cur, hist));", "slides.push(persAlt(personaSlide(persona, cur, hist), persona, cur, 'week', { prior }));", 'alt week')
s = sub1(s, "  if (persona) slides.push(personaSlide(persona, cur, ''));\n  if (cur.ciDays) {\n    const lines = [];\n    if (streak >= 3)", "  if (persona) slides.push(persAlt(personaSlide(persona, cur, ''), persona, cur, 'month', { prior, priorKg }));\n  if (cur.ciDays) {\n    const lines = [];\n    if (streak >= 3)", 'alt month')
s = sub1(s, "'<div class=\"plhero\">' + prismWorldSVG(cur || plSeasons()[plSeasons().length - 1] || null) + '<div class=\"plh-t\">Tempo Play</div>", "'<div class=\"plhero\">' + prismWorldSVG(cur || plSeasons()[plSeasons().length - 1] || null, true) + '<div class=\"plh-t\">Tempo Play</div>", 'camp hub')

# --- CSS
css = open(D + '/pers/pers.css', encoding='utf8').read() if os.path.exists(D + '/pers/pers.css') else ''
s = sub1(s, "</style>", css + "\n</style>", 'css') if css else s

# --- module (before the final boot() call)
mods = ''.join(open(f, encoding='utf8').read() + '\n' for f in sorted(glob.glob(D + '/pers/[0-9]*.js')))
s = sub1(s, "\nboot();\n</script>", "\n" + mods + "\nboot();\n</script>", 'module')

# --- dictionary additions
m = re.search(r'(<script id="tr-dict" type="application/json">)(.*?)(</script>)', s, re.S)
d = json.loads(m.group(2))
add_d = json.load(open(D + '/pers/dict_d.json', encoding='utf8')) if os.path.exists(D + '/pers/dict_d.json') else []
add_t = json.load(open(D + '/pers/dict_t.json', encoding='utf8')) if os.path.exists(D + '/pers/dict_t.json') else []
have = {e[0] for e in d['d']}
for e in add_d:
    if e[0] not in have: d['d'].append(e)
havet = {e[0] for e in d['t']}
for e in add_t:
    if e[0] not in havet: d['t'].append(e)
s = s[:m.start(2)] + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + s[m.end(2):]

OUT = os.environ.get('OUT') or os.path.join(D, '..')
open(OUT + '/index.html', 'w', encoding='utf8').write(s)
# --- service worker: cache bump only
sw = open(os.path.join(D, '..', 'sw.js'), encoding='utf8').read().replace('tempo-v2.2.0', 'tempo-v2.1.2')
sw = sub1(sw, "const CACHE = 'tempo-v2.1.2';", "const CACHE = 'tempo-v2.2.0';", 'sw cache')
open(OUT + '/sw.js', 'w', encoding='utf8').write(sw)
print('built', len(s))
