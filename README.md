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

## Updating the app

Replace `index.html` (and `sw.js` if it changed) in the repository. When you release a new version, bump the
`CACHE` name at the top of `sw.js` so installed copies pick up the update.

## Privacy

No tracking, no third-party requests by default. Optional Google Drive backup talks only to your own Google account
and is off until you turn it on in Settings.
