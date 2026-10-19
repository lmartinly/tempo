/* Tempo service worker — bump CACHE on every app release */
const CACHE = 'tempo-v1.34.4';
const PRECACHE = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(PRECACHE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => null))))
      .catch(() => null)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  /* icons + manifest: cache first (they rarely change; refreshed whenever CACHE is bumped) */
  if (url.origin === location.origin && (url.pathname.indexOf('/icons/') >= 0 || url.pathname.endsWith('manifest.webmanifest'))) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      }))
    );
    return;
  }
  /* app shell: network-first, so online always wins and the cache is the offline fallback */
  if (e.request.mode !== 'navigate') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put('./', copy)).catch(() => {});
        return r;
      })
      .catch(() => caches.match('./', { ignoreSearch: true }))
  );
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
