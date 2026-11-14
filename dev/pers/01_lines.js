/* ---- Phase 1: the approved response library (30 lines; #7 deferred, #5 lives in backupBannerText) and Little Praise ---- */
(function () {
  const L = (id, p, t, extra) => { LINES[id] = Object.assign({ p, t }, extra || {}); };
  /* p2 = one-time moment (no cadence)   p3 = every 4th eligible, max 2/day   p4 = every 6th eligible, max 1/day */
  L('l1', 'p4', "Nothing to report. Suspiciously calm, but I'll allow it.");
  L('l2', 'p4', "Five for five. I had a speech prepared, but you're clearly not someone who needs one.");
  L('l3', 'p4', 'Appetite, energy, protein, sleep, the full set. Thorough. Slightly suspicious. Deeply appreciated.');
  L('l4', 'p4', 'A bit up on last time. Water, salt, timing and plain chance all get a vote on that number. The trend is what counts.');
  L('l6', 'p2', "You still have a workout open, {n} hours and counting. Finish it, discard it, or tell me it's a very long set.");
  L('l8', 'p4', "Workout started. I've cleared my schedule, which was empty, but still.");
  L('l9', 'p3', 'NEW PERSONAL BEST on {exercise}, and I would like it noted that I am not being calm about this.');
  L('l10', 'p2', "Heaviest lift on record: {kg} kg. In kitchen terms, that's {kg} one-kilo bags of flour, moved with purpose.");
  L('l11', 'p4', 'Upper and lower in one session. Showing off, frankly.');
  L('l12', 'p4', "Saved. You've just done next week's planning, and you didn't have to open a spreadsheet.");
  L('l13', 'p4', "Every planned day, done. I've got nothing. For once, genuinely nothing.");
  L('l14', 'p4', "Wherever it happened, it counts.");
  L('l15', 'p2', "The range includes zero, which is statistics for 'no promises'. Treat this one as a hunch, not a verdict.");
  L('l16', 'p2', 'Too few points to draw a line, and I refuse to draw a bad one.');
  L('l17', 'p2', "{n} new days of data since you saved this one. The question hasn't changed, but the answer is allowed to.");
  L('l18', 'p2', 'New longest run. The previous record holder: also you.');
  L('l19', 'p4', "Your week, recapped. I've been rehearsing this one. Swipe.");
  L('l20', 'p4', 'A whole month, edited down to the interesting parts. I cut very little.');
  L('l21', 'p2', "BINGO! Sorry, it's only a line, not the whole card, but the moment demanded volume.");
  L('l22', 'p2', "Card one is nearly done, so here's a harder board. You did bring this on yourself, and I'm delighted.");
  L('l23', 'p2', "Gold. That's the top shelf. I looked for one above it and found only ceiling.");
  L('l24', 'p4', 'Twenty-eight days, four chapters, no deadlines. Take them as slowly as you like.');
  L('l25', 'p3', 'Wrong, but in a way that deserves partial credit. There is no credit system. Consider it a feeling.');
  L('l26', 'p4', 'All three in order. Have you been reading the records behind my back?');
  L('l27', 'p4', 'Saved to the gallery. Every mark in it is a real day of yours, which is more than most galleries can say.');
  L('l28', 'p4', "Midnight theme on. Built for logging things at hours you'd rather not discuss.");
  L('l29', 'p4', 'Sunset. Warm, slightly dramatic, extremely correct. You have taste.');
  L('l30', 'p2', "Nothing logged here. A blank square isn't a failure, just a day that stayed off the record.");

  /* Little Praise (long toast) */
  L('lp1', 'p3', '{target} grams, handled. Efficient and a little smug, and I approve of both.', { praise: true });
  L('lp2', 'p3', 'Backed up. Somewhere down the line, a disaster just got cancelled.', { praise: true });
  L('lp3', 'p3', 'A PERSONAL BEST! Hang on. Sorry. Hang on. I need a second. A PERSONAL BEST!', { praise: true });
  L('lp4', 'p3', 'A new personal best on {exercise}. I checked the old number twice, then quietly put it away.', { praise: true });
  L('lp5', 'p3', "That record wasn't beaten. It was left behind in the middle distance.", { praise: true });
  L('lp6', 'p2', "Biggest session yet: {sets} sets, {tonnes} tonnes. I'm going to need a moment.", { praise: true });
  L('lp7', 'p2', "Workout number ten. At this point 'giving it a go' is legally inaccurate.", { praise: true });
  L('lp8', 'p2', 'Halfway. I had something clever ready, and it has left the building. Congratulations.', { praise: true });
  L('lp9', 'p2', "You reached the goal you set. Congratulations. I'm so glad I was here for it.", { praise: true });
  L('lp10', 'p2', 'Every square on the card. Every one. I designed this to be annoying, and you finished it anyway.', { praise: true });
  L('lp11', 'p3', "Three in a row. You know your own history better than I do, and I've read all of it.", { praise: true });
  L('lp12', 'p2', "A hundred days in the log. I've been glad of every one.", { praise: true });

  /* personal-best voices rotate (one each, never repeated); a wide-margin PB gets its own line first */
  POOLS.pb = ['lp3', 'lp4', 'l9'];
  POOLS.pbsig = ['lp5'];
})();
