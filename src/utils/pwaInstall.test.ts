import {
  PWA_INSTALL_DISMISS_KEY,
  detectPwaPlatform,
  dismissPwaInstallPrompt,
  isPwaInstallDismissed,
  isPwaLikelyInstalled,
  isStandaloneDisplayMode,
  resolveDefaultInstallTab,
  shouldShowPwaInstallPrompt,
} from './pwaInstall';
import { createStorageMock } from '../test/browserMocks';

describe('pwaInstall utilities', () => {
  it('detects android and ios user agents', () => {
    expect(detectPwaPlatform('Mozilla/5.0 (Linux; Android 14)')).toBe('android');
    expect(detectPwaPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('ios');
    expect(detectPwaPlatform('Mozilla/5.0 (Windows NT 10.0)')).toBe('desktop');
  });

  it('detects iPadOS 13+ desktop UA via Macintosh and maxTouchPoints', () => {
    expect(
      detectPwaPlatform({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        maxTouchPoints: 5,
      }),
    ).toBe('ios');

    expect(
      detectPwaPlatform({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        maxTouchPoints: 0,
      }),
    ).toBe('desktop');
  });

  it('resolves default install tab from platform', () => {
    expect(resolveDefaultInstallTab('ios')).toBe('ios');
    expect(resolveDefaultInstallTab('android')).toBe('android');
  });

  it('treats standalone and dismissed states as hidden', () => {
    expect(
      shouldShowPwaInstallPrompt({
        platform: 'android',
        standalone: true,
        dismissed: false,
        installed: false,
      }),
    ).toBe(false);

    expect(
      shouldShowPwaInstallPrompt({
        platform: 'android',
        standalone: false,
        dismissed: true,
        installed: false,
      }),
    ).toBe(false);
  });

  it('shows prompt only on mobile android/ios when eligible', () => {
    expect(
      shouldShowPwaInstallPrompt({
        platform: 'android',
        standalone: false,
        dismissed: false,
        installed: false,
      }),
    ).toBe(true);

    expect(
      shouldShowPwaInstallPrompt({
        platform: 'desktop',
        standalone: false,
        dismissed: false,
        installed: false,
      }),
    ).toBe(false);
  });

  it('does not assume installed without confirmation', () => {
    expect(isPwaLikelyInstalled({ standalone: false, installedRelatedApps: false })).toBe(false);
    expect(isPwaLikelyInstalled({ standalone: true, installedRelatedApps: false })).toBe(true);
  });

  it('persists dismiss key in localStorage without auth keys', () => {
    const localStorage = createStorageMock();

    expect(isPwaInstallDismissed(localStorage)).toBe(false);
    dismissPwaInstallPrompt(localStorage);
    expect(localStorage.getItem(PWA_INSTALL_DISMISS_KEY)).toBe('1');
    expect(isPwaInstallDismissed(localStorage)).toBe(true);
  });

  it('reads iOS standalone flag', () => {
    vi.stubGlobal('window', {
      matchMedia: () => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      navigator: { standalone: true },
    });

    expect(isStandaloneDisplayMode()).toBe(true);
    vi.unstubAllGlobals();
  });
});
