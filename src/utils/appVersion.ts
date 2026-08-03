export const APP_VERSION = __APP_VERSION__;

export const RELOAD_RETURN_PATH_KEY = 'viwa_reload_return_path';
export const RELOAD_TARGET_VERSION_KEY = 'viwa_reload_target_version';

export const saveReloadReturnPath = (): void => {
  if (typeof sessionStorage === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const returnPath = window.location.pathname + window.location.search + window.location.hash;
  sessionStorage.setItem(RELOAD_RETURN_PATH_KEY, returnPath);
};

export const consumeReloadReturnPath = (): string | null => {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  const path = sessionStorage.getItem(RELOAD_RETURN_PATH_KEY);
  if (path) {
    sessionStorage.removeItem(RELOAD_RETURN_PATH_KEY);
  }

  return path;
};

export const isSafeReturnPath = (path: string): boolean =>
  path.startsWith('/') && !path.startsWith('//');

export const markReloadTargetVersion = (serverVersion: string): void => {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  sessionStorage.setItem(RELOAD_TARGET_VERSION_KEY, serverVersion);
};

export const hasAlreadyReloadedForVersion = (serverVersion: string): boolean => {
  if (typeof sessionStorage === 'undefined') {
    return false;
  }

  return sessionStorage.getItem(RELOAD_TARGET_VERSION_KEY) === serverVersion;
};

export const fetchServerVersion = async (): Promise<string | null> => {
  try {
    const url = `${import.meta.env.BASE_URL}version.json?_=${Date.now()}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { version?: unknown };
    return typeof data.version === 'string' ? data.version : null;
  } catch {
    return null;
  }
};
