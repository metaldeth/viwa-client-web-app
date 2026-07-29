import {
  VIWA_ENTRY_STORAGE_KEY,
  VIWA_SERIAL_STORAGE_KEY,
  clearStoredSerialAfterRegistration,
  getStoredLandingEntry,
  getStoredLandingSerial,
  getStoredRegistrationHint,
  parseLandingSearchParams,
  persistLandingContext,
  replaceBrowserUrl,
  resolveRegisterSerial,
} from './landingEntry';
import { installBrowserStorageMocks, installHistoryMock } from '../test/browserMocks';

describe('landingEntry', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    installHistoryMock('/');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('CW05-1: parses entry=website and stores session keys', () => {
    const parsed = parseLandingSearchParams('?entry=website&serial=VIWA-000004');

    expect(parsed).toEqual({
      entry: 'website',
      serial: 'VIWA-000004',
    });

    persistLandingContext(parsed);

    expect(sessionStorage.getItem(VIWA_ENTRY_STORAGE_KEY)).toBe('website');
    expect(sessionStorage.getItem(VIWA_SERIAL_STORAGE_KEY)).toBe('VIWA-000004');
    expect(getStoredLandingEntry()).toBe('website');
    expect(getStoredLandingSerial()).toBe('VIWA-000004');
    expect(getStoredRegistrationHint()).toBe('website');
  });

  it('ignores unknown entry values', () => {
    const parsed = parseLandingSearchParams('?entry=unknown');

    expect(parsed.entry).toBeUndefined();
    persistLandingContext(parsed);
    expect(getStoredLandingEntry()).toBeNull();
    expect(getStoredRegistrationHint()).toBeUndefined();
  });

  it('resolveRegisterSerial prefers query serial over stored serial', () => {
    sessionStorage.setItem(VIWA_SERIAL_STORAGE_KEY, 'VIWA-OLD001');

    expect(resolveRegisterSerial('VIWA-NEW001')).toBe('VIWA-NEW001');
    expect(resolveRegisterSerial()).toBe('VIWA-OLD001');
  });

  it('clearStoredSerialAfterRegistration removes only serial key', () => {
    persistLandingContext({ entry: 'website', serial: 'VIWA-000004' });

    clearStoredSerialAfterRegistration();

    expect(getStoredLandingSerial()).toBeNull();
    expect(getStoredLandingEntry()).toBe('website');
  });

  it('replaceBrowserUrl updates address bar', () => {
    replaceBrowserUrl('/home');

    expect(window.location.pathname).toBe('/home');
  });
});
