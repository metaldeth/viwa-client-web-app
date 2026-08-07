/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { usePwaInstallPrompt } from './usePwaInstallPrompt';
import {
  getPwaInstallPromptStoreSnapshot,
  resetPwaInstallPromptStoreForTests,
} from '../pwa/pwaInstallPromptStore';
import { createStorageMock } from '../test/browserMocks';
import type { BeforeInstallPromptEvent } from '../utils/pwaInstall';

function createDeferredPromptEvent(): BeforeInstallPromptEvent {
  const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'android' });
  return event;
}

describe('usePwaInstallPrompt', () => {
  beforeEach(() => {
    resetPwaInstallPromptStoreForTests();
    vi.stubGlobal('localStorage', createStorageMock());
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 14)',
      configurable: true,
    });
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    });
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reuses persisted deferred prompt after hook remount', () => {
    const event = createDeferredPromptEvent();

    const first = renderHook(() => usePwaInstallPrompt());
    act(() => {
      window.dispatchEvent(event);
    });

    expect(first.result.current.canNativeInstall).toBe(true);
    first.unmount();

    const second = renderHook(() => usePwaInstallPrompt());
    expect(second.result.current.canNativeInstall).toBe(true);
    expect(getPwaInstallPromptStoreSnapshot().deferredPrompt).toBe(event);
  });
});
