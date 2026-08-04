/**
 * @vitest-environment jsdom
 */
import { APP_BOOT_OVERLAY_ID, resetAppBootStateForTests, signalAppReady } from './appBoot';
import { runBackgroundVersionCheck } from './appVersionBoot';

const createBootOverlay = (): HTMLElement => {
  const overlay = document.createElement('div');
  overlay.id = APP_BOOT_OVERLAY_ID;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-busy', 'true');

  const shimmer = document.createElement('div');
  shimmer.className = 'viwa-app-boot__shimmer';
  overlay.appendChild(shimmer);

  const status = document.createElement('p');
  status.setAttribute('data-boot-status', '');
  status.hidden = true;
  overlay.appendChild(status);

  document.body.appendChild(overlay);
  return overlay;
};

describe('runBackgroundVersionCheck overlay integration', () => {
  beforeEach(() => {
    resetAppBootStateForTests();
    document.body.innerHTML = '';
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      media: '',
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

  it('reactivates hidden overlay after ready, then reloads', async () => {
    const overlay = createBootOverlay();
    const reload = vi.fn();

    signalAppReady();
    vi.advanceTimersByTime(275);
    expect(overlay.classList.contains('viwa-app-boot--hidden')).toBe(true);

    await runBackgroundVersionCheck({
      appVersion: '1.0.0',
      fetchVersion: vi.fn(async () => '2.0.0'),
      waitForPaint: vi.fn(async () => undefined),
      reload,
      markTarget: vi.fn(),
      saveReturnPath: vi.fn(),
    });

    expect(reload).toHaveBeenCalledTimes(1);
    expect(overlay.classList.contains('viwa-app-boot--hidden')).toBe(false);
    expect(overlay.getAttribute('aria-busy')).toBe('true');
    expect(overlay.querySelector('[data-boot-status]')?.textContent).toBe('Обновляем кабинет…');
  });
});
