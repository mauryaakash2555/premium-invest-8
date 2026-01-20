/*
  Safety service worker reset.

  Why this exists:
  - If a stale service worker is registered for /sw.js, it can keep serving cached HTML
    and cause React hydration mismatches after deployments/edits.

  What it does:
  - Activates immediately, deletes ALL caches for this origin, unregisters itself,
    and asks open pages to reload.

  This file is intentionally simple and has no caching logic.
*/

self.addEventListener('install', (event) => {
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
