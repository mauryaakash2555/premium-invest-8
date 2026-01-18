/**
 * BM Wealth Service Worker
 * Last Updated: 2026-01-18 - Cache bust for Vercel rebuild
 * 
 * Caches critical assets for faster repeat visits.
 * Uses stale-while-revalidate strategy for best performance.
 */

const CACHE_NAME = 'bmwealth-v2';
const STATIC_CACHE = 'bmwealth-static-v2';
const DYNAMIC_CACHE = 'bmwealth-dynamic-v2';

// Critical assets to cache on install (only assets that definitely exist)
const STATIC_ASSETS = [
  '/',
];

// Install event - cache static assets with error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async (cache) => {
        console.log('[SW] Caching static assets');
        // Cache each asset individually to prevent one failure from breaking all
        for (const asset of STATIC_ASSETS) {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn('[SW] Failed to cache:', asset, err);
          }
        }
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Install failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log('[SW] Removing old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - stale-while-revalidate for most requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API routes (always fresh)
  if (url.pathname.startsWith('/api/')) return;

  // Skip external requests
  if (url.origin !== location.origin) return;

  // For page navigations, use network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(request) || caches.match('/');
        })
    );
    return;
  }

  // For assets, use stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        // Cache successful responses
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      // Return cached response immediately, update in background
      return cachedResponse || fetchPromise;
    })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
