import { vi } from 'vitest';

type StorageMock = Storage & {
  store: Record<string, string>;
};

export const createStorageMock = (): StorageMock => {
  const store: Record<string, string> = {};

  return {
    store,
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    getItem(key: string) {
      return store[key] ?? null;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
  };
};

export const installBrowserStorageMocks = () => {
  const sessionStorage = createStorageMock();
  const localStorage = createStorageMock();

  vi.stubGlobal('sessionStorage', sessionStorage);
  vi.stubGlobal('localStorage', localStorage);

  return { sessionStorage, localStorage };
};

export const installHistoryMock = (initialPath = '/') => {
  let pathname = initialPath;

  vi.stubGlobal('window', {
    location: {
      get pathname() {
        return pathname;
      },
      set pathname(value: string) {
        pathname = value;
      },
    },
    history: {
      replaceState: (_state: unknown, _title: string, url?: string | URL | null) => {
        if (typeof url === 'string') {
          pathname = url;
        }
      },
      pushState: (_state: unknown, _title: string, url?: string | URL | null) => {
        if (typeof url === 'string') {
          pathname = url;
        }
      },
    },
  });

  return {
    getPathname: () => pathname,
    setPathname: (value: string) => {
      pathname = value;
    },
  };
};
