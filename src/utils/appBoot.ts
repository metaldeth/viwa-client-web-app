export const APP_BOOT_OVERLAY_ID = 'viwa-app-boot';
export const APP_BOOT_READY_EVENT = 'viwa:app-boot-ready';
export const APP_BOOT_UPDATING_EVENT = 'viwa:app-boot-updating';

const FADE_MS = 275;
const FADE_MS_REDUCED = 100;
const MIN_RAF_COUNT = 2;
const MAX_EXTRA_WAIT_MS = 200;

let readySignaled = false;
let readyFadeTimeoutId: number | undefined;

const clearReadyFadeTimeout = (): void => {
  if (readyFadeTimeoutId !== undefined && typeof window !== 'undefined') {
    window.clearTimeout(readyFadeTimeoutId);
    readyFadeTimeoutId = undefined;
  }
};

export const rafTimes = (count: number): Promise<void> =>
  new Promise((resolve) => {
    let remaining = count;
    const step = (): void => {
      remaining -= 1;
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

/** At least two paint frames, then a bounded fonts/load wait. */
export const waitForBootPaint = async (): Promise<void> => {
  await rafTimes(MIN_RAF_COUNT);

  await Promise.race([
    typeof document !== 'undefined' && document.fonts?.ready
      ? document.fonts.ready.catch(() => undefined)
      : Promise.resolve(),
    new Promise<void>((resolve) => {
      if (typeof document === 'undefined' || document.readyState === 'complete') {
        resolve();
        return;
      }
      window.addEventListener('load', () => resolve(), { once: true });
    }),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, MAX_EXTRA_WAIT_MS);
    }),
  ]);
};

const getFadeMs = (): number => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return FADE_MS;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? FADE_MS_REDUCED : FADE_MS;
};

const getBootOverlay = (): HTMLElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  return document.getElementById(APP_BOOT_OVERLAY_ID);
};

const showUpdatingStatus = (overlay: HTMLElement): void => {
  const shimmer = overlay.querySelector<HTMLElement>('.viwa-app-boot__shimmer');
  if (shimmer) {
    shimmer.hidden = false;
  }

  const status = overlay.querySelector<HTMLElement>('[data-boot-status]');
  if (status) {
    status.textContent = 'Обновляем кабинет…';
    status.hidden = false;
  }

  const errorBlock = overlay.querySelector<HTMLElement>('[data-boot-error]');
  if (errorBlock) {
    errorBlock.hidden = true;
  }
};

/** Hides overlay after fade but keeps it in DOM for later reactivation. */
export const signalAppReady = (): void => {
  if (readySignaled) {
    return;
  }
  readySignaled = true;

  window.dispatchEvent(new CustomEvent(APP_BOOT_READY_EVENT));

  const overlay = getBootOverlay();
  if (!overlay) {
    return;
  }

  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-busy', 'false');
  overlay.setAttribute('aria-label', 'Загрузка завершена');
  overlay.classList.add('viwa-app-boot--fade-out');

  clearReadyFadeTimeout();
  readyFadeTimeoutId = window.setTimeout(() => {
    readyFadeTimeoutId = undefined;
    overlay.classList.add('viwa-app-boot--hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }, getFadeMs());
};

/** Reactivates overlay for version update — safe after ready hide or error state. */
export const signalAppUpdating = (): void => {
  clearReadyFadeTimeout();

  window.dispatchEvent(new CustomEvent(APP_BOOT_UPDATING_EVENT));

  const overlay = getBootOverlay();
  if (!overlay) {
    return;
  }

  overlay.classList.remove('viwa-app-boot--fade-out', 'viwa-app-boot--hidden');
  overlay.removeAttribute('data-boot-state');
  overlay.removeAttribute('aria-hidden');

  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-busy', 'true');
  overlay.setAttribute('aria-label', 'Обновляем кабинет');

  showUpdatingStatus(overlay);
};

/** Test-only reset for idempotency checks. */
export const resetAppBootStateForTests = (): void => {
  clearReadyFadeTimeout();
  readySignaled = false;
};
