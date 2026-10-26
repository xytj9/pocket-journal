/* VERSION and PRECACHE are replaced by the reproducible build script. */
const PREFIX = 'pocket-journal-shell-' + encodeURIComponent(new URL(self.registration.scope).pathname) + '-';
const CACHE = PREFIX + '2c99d8764e38659b';
const PRECACHE = ["index.html", "journal.js", "storage.js", "runtime.js", "pwa.css", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"];
const base = self.registration.scope;
const shell = new URL('index.html', base).href;
const allowed = new Set(PRECACHE.map(path => new URL(path, base).href));
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE.map(path => new Request(new URL(path, base), {cache:'reload'})));
    // A complete new shell waits until the person chooses to update.
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== new URL(base).origin || !url.href.startsWith(base)) return;
  const clean = new URL(url); clean.search = ''; clean.hash = '';
  const isShell = event.request.mode === 'navigate' &&
    (clean.href === base || clean.href === shell);
  if (!isShell && !allowed.has(clean.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(isShell ? shell : clean.href);
    return hit || fetch(event.request);
  })());
});
