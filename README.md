# Tempo

A small personal weekly-routine tracker. One HTML file, no server, no accounts, no analytics.
Everything you log stays in your browser's local storage on your own device.

## What's in this folder

| File | Purpose |
| --- | --- |
| `index.html` | The whole app (UI, logic, styles) |
| `sw.js` | Service worker — makes the app work offline |
| `manifest.webmanifest` | Lets the app be installed to the home screen |
| `icons/` | App icons (192, 512, maskable, 180 for iOS, 32 favicon) |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |
| `.gitignore` | Keeps exported backups out of the repository |

## Publish with GitHub Pages

1. Create a new repository and upload the contents of this folder to its root.
2. Settings → Pages → Build and deployment → *Deploy from a branch* → `main` / `(root)` → Save.
3. After a minute the app is live at `https://<your-username>.github.io/<repo-name>/`.

## Install on a phone

- **iPhone / iPad (Safari):** open the URL → Share → *Add to Home Screen*.
- **Android (Chrome):** open the URL → menu → *Install app*.

## Your data

- Data is stored per browser, per device. Clearing site data erases it.
- **Back up regularly** from *Settings → Backup & export*. Backup files are plain JSON and contain your personal records —
  keep them in a private place (the included `.gitignore` stops them being committed by accident).
- Restore from the same screen. Backups made by earlier versions can be restored too.
- If you previously used an earlier build of this app on the same site address, its data is copied over automatically the first time this one opens.

## Workouts

*Tools → Workouts* is a checklist-style gym log. A session has four sections — warm-up, weights, optional cardio, cool-down.
Weight exercises take sets × reps × kg (each set on its own row), the treadmill takes incline, minutes and speed, bikes take
level and minutes, and stretching is a plain tick. Last time's numbers are pre-filled. Each exercise knows which area it works,
so a finished workout is labelled Full body, Lower body or Upper body. Finished workouts can be saved as a reusable checklist.
Equipment is editable, and an exercise the app doesn't know asks what it works once. An unfinished workout stays as a draft
until you finish or discard it. Workouts, programs and equipment are part of backups, CSV export and Drive sync.

## Updating the app

Replace `index.html` (and `sw.js` if it changed) in the repository. When you release a new version, bump the
`CACHE` name at the top of `sw.js` so installed copies pick up the update.

## Privacy

No tracking, no third-party requests by default. Optional Google Drive backup talks only to your own Google account
and is off until you turn it on in Settings.

## Insights Lab & Explore Your Data

Tools → *Explore Your Data* / *Insights Lab* (one page, two tabs).

- **Lab:** pick up to three variables (sleep, energy, appetite, protein, calories, weight, symptom severity, workouts, dose, each measurement). Views: over time (each line scaled to its own range), relationship (scatter, correlation with an interval from n = 10, optional time lag of days or weeks) and by group (injection day, cycle phase, weekday). Period: 30 / 90 days, all, or custom; daily or weekly. Every result shows how many observations it rests on and how much is missing; the records behind a pair list can be opened. Comparisons can be saved and show how many observations they have gained since.
- **Explore:** a short list of questions, shown only when the records can answer them. Each answer cites its records and opens in the Lab.
- Unlogged days are missing, never zero. Correlation is described as association, not cause.

## Body Studio

Tools → *Body Studio*.

- **Recomposition:** pick two measurement dates; tape measurements, the nearest weigh-ins, a weight line, measurement change since the first date and workout days per week are shown on the same date window. Stretches where weight held steady while a site moved are listed. It has no body-fat or muscle data and says so.
- **Progress photos:** hidden until opened. Pick Before and After dates and an angle (front or side) independently; compare side by side, with a slider or as an overlay, with shared zoom and pan and a nudge control for the After photo. Gallery is by date. Photos are stored only in this browser (IndexedDB), are not part of JSON backups or Drive sync and never appear on the dashboard, in Wrapped or in any game. Export, import and delete-all live at the bottom of the photos page. Photos from the older version can be imported there and arrive as *Unsorted* until an angle is set.

## Forecast Lab

Tools → *Forecast Lab*. A dynamic energy-balance simulation, not a calorie calculator and not advice.

- **Model:** stored energy = intake − expenditure, split between fat mass (9,500 kcal/kg) and fat-free mass (1,020 kcal/kg) via the Forbes relation. Expenditure = resting (Livingston–Kohlstadt) + activity + diet-induced thermogenesis (7.5 % of intake) + spontaneous activity that follows two-thirds of a fall and 56 % of a rise. Weight is integrated daily (Runge–Kutta).
- **Verified against the published model:** DIT is 0.075 (the source PDF's final line shows 0.75, a typo); resting-rate constants come from the published paper because the PDF's Table 1 is missing; `a` is optional adaptation applied to resting rate only; the Forbes constant cancels and is not needed.
- **Assumptions the sources leave open (editable, shown on screen):** activity factor, spontaneous-activity share (10 %), starting body fat (population estimate unless you enter a value).
- **Inputs:** starting weight/date/age/height/sex, either an average intake or a daily deficit (measured against starting or current expenditure), duration, optional target. Nothing is silently clamped; a bad input gets a specific message and only the projection is withheld.
- **Outputs:** projection with a range from the unsettled assumptions (not a statistical interval), side-by-side scenarios, predicted vs. logged weights, a sensitivity chart and an explanation of what was and wasn't verified.
- The 2025 machine-learning paper is a classifier and is not used for the curve; the explanation screen says why.

### Forecast Lab — calories from check-ins (2.0)

A third scenario, **From my check-ins**, runs the model on the calories you already log in the daily check-in: a logged day uses its own value, a past day without one uses the logged average, and days after today continue at the average of the last 14 logged days. It needs at least 7 logged days from the start date. Saved scenarios freeze the values they used.

## Tempo Play (optional)

Tools → *Tempo Play*. Visually separate from the tracking screens; nothing in it changes your records, there are no points, coins, badges or leaderboards, and progress photos are never used.

- **Seasons — PRISM.** A 28-day season you start yourself. Four chapters on Day 1, 8, 15 and 22 (each can be opened early and never expires): *Choose Your Lens*, *The Signal Room* (an Arcade puzzle), *The Mirror Room* (two periods compared against their own day-to-day variation) and *The Studio*. Each chapter adds a layer to the PRISM picture and unlocks an optional layer in the Studio. Earlier seasons stay available.
- **Arcade.** *Which Week?* and *Timeline Shuffle*, built only from real entries (never invented; an empty state offers a clearly labelled demonstration). Daily Drop is one featured puzzle; Free Play is unlimited. Weight, symptoms and doses stay out unless switched on. Every result has "How do we know?" with the source dates. No score; wrong guesses cost nothing.
- **Data Art Studio.** ORBIT, CONSTELLATION and WOVEN. Choose period, record types, palette, density, symmetry (decoration only), texture, framing, layering, title and legend. Days with no entry stay empty; colour and style never depend on how the numbers turned out. PNG (2400 × 3000) and SVG export.
- **Living Gallery.** Saved pieces are frozen snapshots of the values they used, so later logging never changes them. Rename, group, remix, compare, view the data mapping, full screen, export, or make a new version from current data. Play state is part of the JSON backup.
