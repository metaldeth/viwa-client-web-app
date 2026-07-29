export const VIWA_ENTRY_STORAGE_KEY = 'viwa_entry';
export const VIWA_SERIAL_STORAGE_KEY = 'viwa_serial';

export type LandingEntryValue = 'website';
export type RegistrationHint = LandingEntryValue | 'machine_qr';

const LANDING_ENTRY_VALUES: LandingEntryValue[] = ['website'];

export type LandingQueryParams = {
  entry?: LandingEntryValue;
  serial?: string;
};

const normalizeSerial = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const isLandingEntryValue = (value: string | null | undefined): value is LandingEntryValue =>
  Boolean(value && LANDING_ENTRY_VALUES.includes(value as LandingEntryValue));

export const parseLandingSearchParams = (search: string): LandingQueryParams => {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const entryRaw = params.get('entry');
  const entry = isLandingEntryValue(entryRaw) ? entryRaw : undefined;
  const serial = normalizeSerial(params.get('serial'));

  return { entry, serial };
};

export const persistLandingContext = (params: LandingQueryParams): void => {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  if (params.entry) {
    sessionStorage.setItem(VIWA_ENTRY_STORAGE_KEY, params.entry);
  }

  if (params.serial) {
    sessionStorage.setItem(VIWA_SERIAL_STORAGE_KEY, params.serial);
  }
};

export const getStoredLandingEntry = (): LandingEntryValue | null => {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  const value = sessionStorage.getItem(VIWA_ENTRY_STORAGE_KEY);
  return isLandingEntryValue(value) ? value : null;
};

export const getStoredLandingSerial = (): string | null => {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  return sessionStorage.getItem(VIWA_SERIAL_STORAGE_KEY);
};

export const getStoredRegistrationHint = (): RegistrationHint | undefined => {
  const entry = getStoredLandingEntry();

  if (entry === 'website') {
    return 'website';
  }

  return undefined;
};

export const clearStoredSerialAfterRegistration = (): void => {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  sessionStorage.removeItem(VIWA_SERIAL_STORAGE_KEY);
};

export const replaceBrowserUrl = (path: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.history.replaceState(null, '', path);
};

export const resolveRegisterSerial = (querySerial?: string): string | undefined => {
  return querySerial ?? getStoredLandingSerial() ?? undefined;
};
