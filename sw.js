// ════════════════════════════════════════════════════════════════
// BCF Vault — Service Worker
// Provides offline support and faster loading after first visit
// ════════════════════════════════════════════════════════════════

const CACHE_NAME = 'bcf-vault-v18.29';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './favicon-192.png',
  './favicon-512.png',
  './favicon-maskable-192.png',
  './favicon-maskable-512.png',
  './apple-touch-icon.png'
];

// ── Install: pre-cache core assets ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache core assets, ignore errors for missing optional files
        return Promise.allSettled(
          CORE_ASSETS.map((url) =>
            cache.add(url).catch((err) =>
              console.log('[SW] Skip caching:', url, err.message)
            )
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: network-first for HTML & version.json, cache-first for assets ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests for our origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Skip Apps Script API calls — let them go to network directly
  if (url.hostname.includes('script.google.com') ||
      url.hostname.includes('googleusercontent.com')) {
    return;
  }

  // version.json — always network-first to detect updates
  if (url.pathname.endsWith('version.json')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .catch(() => caches.match(request))
    );
    return;
  }

  // HTML files — network-first, fall back to cache (for offline)
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Update cache with fresh copy
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Static assets (icons, manifest) — cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        // Only cache successful, basic responses
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
        return res;
      });
    })
  );
});

// ── Message handler — allow page to trigger update ──
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.source.postMessage({ type: 'CACHE_CLEARED' });
    });
  }
});
