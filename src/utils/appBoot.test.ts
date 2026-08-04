/**
 * @vitest-environment jsdom
 */
import {
  APP_BOOT_OVERLAY_ID,
  APP_BOOT_READY_EVENT,
  APP_BOOT_UPDATING_EVENT,
  resetAppBootStateForTests,
  signalAppReady,
  signalAppUpdating,
  waitForBootPaint,
} from './appBoot';

const createBootOverlay = (): HTMLElement => {
  const overlay = document.createElement('div');
  overlay.id = APP_BOOT_OVERLAY_ID;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-busy', 'true');

  const shimmer = document.createElement('div');
  shimmer.className = 'viwa-app-boot__shimmer';
  overlay.appendChild(shimmer);

  const status = document.createElement('p');
  status.setAttribute('data-boot-status', '');
  status.hidden = true;
  status.textContent = 'Загрузка…';
  overlay.appendChild(status);

  const errorBlock = document.createElement('div');
  errorBlock.setAttribute('data-boot-error', '');
  errorBlock.setAttribute('role', 'alert');
  errorBlock.setAttribute('aria-live', 'assertive');
  errorBlock.setAttribute('aria-atomic', 'true');
  errorBlock.hidden = true;
  overlay.appendChild(errorBlock);

  document.body.appendChild(overlay);
  return overlay;
};

describe('appBoot', () => {
  beforeEach(() => {
    resetAppBootStateForTests();
    document.body.innerHTML = '';
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    resetAppBootStateForTests();
  });

  it('signalAppReady is idempotent and hides overlay without removing it', () => {
    const overlay = createBootOverlay();
    const readyListener = vi.fn();
    window.addEventListener(APP_BOOT_READY_EVENT, readyListener);

    signalAppReady();
    signalAppReady();

    expect(readyListener).toHaveBeenCalledTimes(1);
    expect(overlay.classList.contains('viwa-app-boot--fade-out')).toBe(true);
    expect(overlay.getAttribute('aria-busy')).toBe('false');
    expect(overlay.getAttribute('role')).toBe('status');

    vi.advanceTimersByTime(275);
    expect(document.getElementById(APP_BOOT_OVERLAY_ID)).not.toBeNull();
    expect(overlay.classList.contains('viwa-app-boot--hidden')).toBe(true);
    expect(overlay.getAttribute('aria-hidden')).toBe('true');
  });

  it('signalAppUpdating before fade completes prevents hidden state after timer', () => {
    const overlay = createBootOverlay();

    signalAppReady();
    expect(overlay.classList.contains('viwa-app-boot--fade-out')).toBe(true);

    signalAppUpdating();

    vi.advanceTimersByTime(275);

    expect(overlay.classList.contains('viwa-app-boot--hidden')).toBe(false);
    expect(overlay.classList.contains('viwa-app-boot--fade-out')).toBe(false);
    expect(overlay.getAttribute('aria-hidden')).toBeNull();
    expect(overlay.getAttribute('aria-busy')).toBe('true');
    expect(overlay.querySelector('[data-boot-status]')?.textContent).toBe('Обновляем кабинет…');
  });

  it('signalAppUpdating reactivates overlay after ready hide', () => {
    const overlay = createBootOverlay();

    signalAppReady();
    vi.advanceTimersByTime(275);
    expect(overlay.classList.contains('viwa-app-boot--hidden')).toBe(true);

    signalAppUpdating();

    expect(overlay.classList.contains('viwa-app-boot--fade-out')).toBe(false);
    expect(overlay.classList.contains('viwa-app-boot--hidden')).toBe(false);
    expect(overlay.getAttribute('aria-hidden')).toBeNull();
    expect(overlay.getAttribute('aria-busy')).toBe('true');
    expect(overlay.getAttribute('role')).toBe('status');
    expect(overlay.getAttribute('aria-live')).toBe('polite');
    expect(overlay.querySelector('[data-boot-status]')?.textContent).toBe('Обновляем кабинет…');
  });

  it('signalAppUpdating clears error state and restores status role', () => {
    const overlay = createBootOverlay();
    overlay.setAttribute('data-boot-state', 'error');
    overlay.setAttribute('aria-busy', 'false');
    const errorBlock = overlay.querySelector<HTMLElement>('[data-boot-error]');
    if (errorBlock) {
      errorBlock.hidden = false;
    }

    signalAppUpdating();

    expect(overlay.getAttribute('data-boot-state')).toBeNull();
    expect(overlay.getAttribute('aria-busy')).toBe('true');
    expect(overlay.getAttribute('role')).toBe('status');
    expect(errorBlock?.hidden).toBe(true);
  });

  it('signalAppUpdating dispatches event on each call', () => {
    createBootOverlay();
    const updatingListener = vi.fn();
    window.addEventListener(APP_BOOT_UPDATING_EVENT, updatingListener);

    signalAppUpdating();
    signalAppUpdating();

    expect(updatingListener).toHaveBeenCalledTimes(2);
  });

  it('signalAppReady is safe when overlay is missing', () => {
    expect(() => signalAppReady()).not.toThrow();
  });

  it('signalAppUpdating is safe when overlay is missing', () => {
    expect(() => signalAppUpdating()).not.toThrow();
  });

  it('waitForBootPaint waits at least two animation frames', async () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    const paintPromise = waitForBootPaint();
    expect(rafCallbacks).toHaveLength(1);

    rafCallbacks.shift()?.(0);
    await Promise.resolve();
    expect(rafCallbacks).toHaveLength(1);

    rafCallbacks.shift()?.(0);
    vi.advanceTimersByTime(200);
    await paintPromise;
  });
});
