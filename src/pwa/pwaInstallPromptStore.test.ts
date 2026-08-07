/**
 * @vitest-environment jsdom
 */
import {
  clearDeferredInstallPrompt,
  ensurePwaInstallPromptListeners,
  getPwaInstallPromptStoreSnapshot,
  markPwaInstallConfirmed,
  resetPwaInstallPromptStoreForTests,
  subscribePwaInstallPromptStore,
} from './pwaInstallPromptStore';
import { isBeforeInstallPromptEvent, type BeforeInstallPromptEvent } from '../utils/pwaInstall';

function createDeferredPromptEvent(): BeforeInstallPromptEvent {
  const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'android' });
  return event;
}

describe('pwaInstallPromptStore', () => {
  beforeEach(() => {
    resetPwaInstallPromptStoreForTests();
  });

  it('captures beforeinstallprompt once and persists across subscribers', () => {
    ensurePwaInstallPromptListeners();

    const event = createDeferredPromptEvent();
    window.dispatchEvent(event);

    expect(getPwaInstallPromptStoreSnapshot().deferredPrompt).toBe(event);

    const listener = vi.fn();
    const unsubscribe = subscribePwaInstallPromptStore(listener);

    expect(getPwaInstallPromptStoreSnapshot().deferredPrompt).toBe(event);
    expect(listener).not.toHaveBeenCalled();

    unsubscribe();
    expect(getPwaInstallPromptStoreSnapshot().deferredPrompt).toBe(event);
  });

  it('notifies subscribers when deferred prompt is stored', () => {
    ensurePwaInstallPromptListeners();
    const listener = vi.fn();
    subscribePwaInstallPromptStore(listener);

    const event = createDeferredPromptEvent();
    window.dispatchEvent(event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getPwaInstallPromptStoreSnapshot().deferredPrompt).toBe(event);
  });

  it('clears deferred prompt on appinstalled', () => {
    ensurePwaInstallPromptListeners();

    const event = createDeferredPromptEvent();
    window.dispatchEvent(event);
    expect(getPwaInstallPromptStoreSnapshot().deferredPrompt).toBe(event);

    window.dispatchEvent(new Event('appinstalled'));

    expect(getPwaInstallPromptStoreSnapshot().deferredPrompt).toBeNull();
    expect(getPwaInstallPromptStoreSnapshot().confirmedInstalled).toBe(true);
  });

  it('clears deferred prompt after manual clear and marks confirmed on accept', () => {
    ensurePwaInstallPromptListeners();

    const event = createDeferredPromptEvent();
    window.dispatchEvent(event);

    clearDeferredInstallPrompt();
    expect(getPwaInstallPromptStoreSnapshot().deferredPrompt).toBeNull();

    markPwaInstallConfirmed();
    expect(getPwaInstallPromptStoreSnapshot().confirmedInstalled).toBe(true);
    expect(getPwaInstallPromptStoreSnapshot().deferredPrompt).toBeNull();
  });

  it('ignores non-install prompt events', () => {
    ensurePwaInstallPromptListeners();
    window.dispatchEvent(new Event('beforeinstallprompt'));
    expect(getPwaInstallPromptStoreSnapshot().deferredPrompt).toBeNull();
    expect(isBeforeInstallPromptEvent(new Event('beforeinstallprompt'))).toBe(false);
  });
});
