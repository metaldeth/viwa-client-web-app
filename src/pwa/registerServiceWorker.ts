/**
 * Registers a network-only service worker required for PWA installability.
 * Does not precache assets — AppVersionGuard owns version reload semantics.
 */
export function registerMinimalServiceWorker(): void {
  if (import.meta.env.DEV || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // Non-fatal: cabinet remains usable without install prompt support.
    });
  });
}
