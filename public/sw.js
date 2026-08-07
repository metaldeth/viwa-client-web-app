/**
 * Minimal service worker for PWA installability.
 * No precaching — AppVersionGuard reloads the SPA when version.json changes.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
