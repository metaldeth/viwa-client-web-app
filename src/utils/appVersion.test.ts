/**
 * @vitest-environment jsdom
 */
import {
  consumeReloadReturnPath,
  fetchServerVersion,
  hasAlreadyReloadedForVersion,
  isSafeReturnPath,
  markReloadTargetVersion,
  saveReloadReturnPath,
  VERSION_FETCH_TIMEOUT_MS,
} from './appVersion';
import { installBrowserStorageMocks } from '../test/browserMocks';

describe('appVersion reload helpers', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    vi.stubGlobal('window', {
      ...window,
      location: {
        pathname: '/m/ABC123/subscription',
        search: '?foo=1',
        hash: '#top',
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saveReloadReturnPath stores current location', () => {
    saveReloadReturnPath();
    expect(sessionStorage.getItem('viwa_reload_return_path')).toBe(
      '/m/ABC123/subscription?foo=1#top',
    );
  });

  it('consumeReloadReturnPath returns path once', () => {
    sessionStorage.setItem('viwa_reload_return_path', '/m/ABC123/subscription');
    expect(consumeReloadReturnPath()).toBe('/m/ABC123/subscription');
    expect(consumeReloadReturnPath()).toBeNull();
  });

  it('isSafeReturnPath rejects protocol-relative paths', () => {
    expect(isSafeReturnPath('/m/123')).toBe(true);
    expect(isSafeReturnPath('//evil.test')).toBe(false);
  });

  it('hasAlreadyReloadedForVersion matches session marker', () => {
    markReloadTargetVersion('2.0.0');
    expect(hasAlreadyReloadedForVersion('2.0.0')).toBe(true);
    expect(hasAlreadyReloadedForVersion('3.0.0')).toBe(false);
  });
});

describe('fetchServerVersion', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns version from version.json', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.2.3' }),
    } as Response);

    await expect(fetchServerVersion()).resolves.toBe('1.2.3');
  });

  it('returns null on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    await expect(fetchServerVersion()).resolves.toBeNull();
  });

  it('returns null when fetch exceeds timeout', async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    const resultPromise = fetchServerVersion({ timeoutMs: 100 });
    await vi.advanceTimersByTimeAsync(100);
    await expect(resultPromise).resolves.toBeNull();
  });

  it('uses default timeout constant', () => {
    expect(VERSION_FETCH_TIMEOUT_MS).toBeGreaterThanOrEqual(3000);
    expect(VERSION_FETCH_TIMEOUT_MS).toBeLessThanOrEqual(5000);
  });
});
