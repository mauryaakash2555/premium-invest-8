/*
  Cleanup service worker.

  Why this exists:
  - Some deployments historically used a CRA/Workbox service worker at /service-worker.js.
  - If a stale service worker remains registered, it can cache HTML/JS chunks and cause
    runtime errors like:
      TypeError: Cannot read properties of undefined (reading 'call')
    inside webpack runtime when old HTML references missing chunks.

  What it does:
  - Installs + activates immediately, deletes ALL caches for this origin, unregisters itself,
    and asks open pages to reload.

  This file intentionally does NOT implement any caching.
*/

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        // ignore
      }

      try {
        await self.registration.unregister();
      } catch {
        // ignore
      }

      try {
        const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        allClients.forEach((client) => {
          try {
            client.navigate(client.url);
          } catch {
            // ignore
          }
        });
      } catch {
        // ignore
      }
    })()
  );
});

self.addEventListener('fetch', () => {
  // No-op: never intercept network requests.
});
