import { BeforeInstallPromptEvent, isBeforeInstallPromptEvent } from '../utils/pwaInstall';

export type PwaInstallPromptStoreState = {
  deferredPrompt: BeforeInstallPromptEvent | null;
  confirmedInstalled: boolean;
};

type StoreListener = () => void;

type StoreBag = {
  listenersAttached: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  confirmedInstalled: boolean;
  listeners: Set<StoreListener>;
  cachedSnapshot: PwaInstallPromptStoreState;
};

const STORE_KEY = '__viwaPwaInstallPromptStore__';

const EMPTY_SNAPSHOT: PwaInstallPromptStoreState = {
  deferredPrompt: null,
  confirmedInstalled: false,
};

const SSR_BAG: StoreBag = {
  listenersAttached: false,
  deferredPrompt: null,
  confirmedInstalled: false,
  listeners: new Set(),
  cachedSnapshot: EMPTY_SNAPSHOT,
};

function getStoreBag(): StoreBag {
  if (typeof globalThis === 'undefined') {
    return SSR_BAG;
  }

  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: StoreBag;
  };

  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = {
      listenersAttached: false,
      deferredPrompt: null,
      confirmedInstalled: false,
      listeners: new Set(),
      cachedSnapshot: EMPTY_SNAPSHOT,
    };
  }

  return globalStore[STORE_KEY];
}

function emitStoreChange(): void {
  getStoreBag().listeners.forEach((listener) => listener());
}

function handleBeforeInstallPrompt(event: Event): void {
  if (!isBeforeInstallPromptEvent(event)) {
    return;
  }

  event.preventDefault();
  const bag = getStoreBag();
  bag.deferredPrompt = event;
  emitStoreChange();
}

function handleAppInstalled(): void {
  const bag = getStoreBag();
  bag.confirmedInstalled = true;
  bag.deferredPrompt = null;
  emitStoreChange();
}

export function ensurePwaInstallPromptListeners(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const bag = getStoreBag();
  if (bag.listenersAttached) {
    return;
  }

  bag.listenersAttached = true;
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
}

export function getPwaInstallPromptStoreSnapshot(): PwaInstallPromptStoreState {
  const bag = getStoreBag();

  if (
    bag.cachedSnapshot.deferredPrompt === bag.deferredPrompt &&
    bag.cachedSnapshot.confirmedInstalled === bag.confirmedInstalled
  ) {
    return bag.cachedSnapshot;
  }

  bag.cachedSnapshot = {
    deferredPrompt: bag.deferredPrompt,
    confirmedInstalled: bag.confirmedInstalled,
  };

  return bag.cachedSnapshot;
}

export function subscribePwaInstallPromptStore(listener: StoreListener): () => void {
  ensurePwaInstallPromptListeners();
  const bag = getStoreBag();
  bag.listeners.add(listener);

  return () => {
    bag.listeners.delete(listener);
  };
}

export function clearDeferredInstallPrompt(): void {
  const bag = getStoreBag();
  bag.deferredPrompt = null;
  emitStoreChange();
}

export function markPwaInstallConfirmed(): void {
  const bag = getStoreBag();
  bag.confirmedInstalled = true;
  bag.deferredPrompt = null;
  emitStoreChange();
}

/** Test-only reset — does not remove global window listeners. */
export function resetPwaInstallPromptStoreForTests(): void {
  const bag = getStoreBag();
  bag.deferredPrompt = null;
  bag.confirmedInstalled = false;
  bag.listeners.clear();
  bag.cachedSnapshot = EMPTY_SNAPSHOT;
}
