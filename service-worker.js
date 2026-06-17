/* ============================================================
   ClearSpend — Service Worker
   ------------------------------------------------------------
   This file is what makes ClearSpend installable as an app and
   able to work offline. A service worker is a small script the
   browser runs in the background, separate from the page itself.

   What it does here:
     1. When the app is first opened, it "caches" (saves a local
        copy of) every file the app needs — HTML, CSS, JS, icons.
     2. On future visits, it serves those files from the cache
        FIRST, falling back to the network only if something is
        missing. This means the app opens instantly and still
        works with no internet connection.
     3. When you update any file and re-deploy, bump CACHE_NAME
        below (e.g. 'clearspend-v2') so the service worker knows
        to throw out the old cached files and grab fresh ones.

   You generally don't need to edit this file unless you're
   adding new files to the app or troubleshooting caching issues.
   ============================================================ */

// Bump this version string any time you deploy changes, so users'
// browsers know to fetch fresh files instead of using old cached ones.
const CACHE_NAME = 'clearspend-v1';

// Every file the app needs in order to run completely offline.
// If you add new files to the project (e.g. a new js/ file), add
// them to this list too.
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/state.js',
  './js/home.js',
  './js/purchase.js',
  './js/cards.js',
  './js/calendar.js',
  './js/goals.js',
  './js/calculator.js',
  './js/review.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-apple-touch.png'
];

// INSTALL: runs once when the service worker is first registered.
// We open a cache "bucket" named CACHE_NAME and store every file
// listed above inside it.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting(); // activate this new service worker immediately
});

// ACTIVATE: runs after install. We clean up any OLD caches left
// over from a previous CACHE_NAME, so storage doesn't pile up with
// outdated versions of the app.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// FETCH: runs every time the page requests a file (HTML, CSS, JS,
// images, etc). We try the cache first (instant, works offline);
// if it's not in the cache for some reason, we fall back to an
// actual network request.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
