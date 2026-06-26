/**
 * Service Worker — cache game assets for offline play.
 * The Vite-bundled entry (main.js) is cached at install time;
 * dynamically loaded scripts (core.js, game.js, etc.) are cached
 * on first access via a network-first strategy.
 */
const CACHE = 'kg-v1';

self.addEventListener('install', function(evt) {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
      ]);
    })
  );
});

self.addEventListener('activate', function(evt) {
  evt.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
});

self.addEventListener('fetch', function(evt) {
  var url = new URL(evt.request.url);
  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  evt.respondWith(
    caches.match(evt.request).then(function(hit) {
      if (hit) return hit;
      return fetch(evt.request).then(function(resp) {
        if (resp && resp.status === 200) {
          var copy = resp.clone();
          caches.open(CACHE).then(function(cache) { cache.put(evt.request, copy); });
        }
        return resp;
      });
    })
  );
});
