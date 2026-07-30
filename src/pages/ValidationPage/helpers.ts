import { ClientDataType } from '../../types/enums/clientDataType';
import { ACCESS_TOKEN_STORAGE_NAME, REFRESH_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { POST_AUTH_HOME_PATH } from '../../state/auth/navigation';

const trimTrailingSlashes = (path: string) => path.replace(/\/+$/, '');

export const getMachineSerialFromPath = (pathname: string): string | null => {
  const match = pathname.match(/^\/m\/([^/]+)/);
  return match?.[1] ?? null;
};

export const getMachineAuthPath = (pathname: string): string | null => {
  const serial = getMachineSerialFromPath(pathname);
  if (!serial) {
    return null;
  }

  return `/m/${serial}/auth`;
};

export const isReturningAuthRoute = (pathname: string): boolean => {
  const path = trimTrailingSlashes(pathname);

  if (path === '/auth') {
    return true;
  }

  return path.startsWith('/auth/sms/');
};

export const isClientAuthRoute = (pathname: string): boolean => {
  if (isReturningAuthRoute(pathname)) {
    return true;
  }

  const serial = getMachineSerialFromPath(pathname);
  if (!serial) {
    return false;
  }

  const path = trimTrailingSlashes(pathname);
  const authBase = `/m/${serial}/auth`;

  if (path === authBase) {
    return true;
  }

  return path.startsWith(`${authBase}/sms/`);
};

export const shouldRedirectToClientAuth = (pathname: string): boolean => {
  if (!getMachineSerialFromPath(pathname)) {
    return false;
  }

  return !isClientAuthRoute(pathname);
};

export const getReturningAuthPath = (): string => '/auth';

export const getMachineEntryRedirectPath = (authed: boolean): string =>
  authed ? POST_AUTH_HOME_PATH : 'auth';

export const redirectToClientAuth = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const { pathname } = window.location;

  if (isReturningAuthRoute(pathname)) {
    return;
  }

  const authPath = getMachineAuthPath(pathname);
  if (authPath) {
    const normalizedPath = trimTrailingSlashes(pathname);

    if (normalizedPath !== authPath && shouldRedirectToClientAuth(pathname)) {
      window.location.replace(authPath);
    }

    return;
  }

  window.location.replace(getReturningAuthPath());
};

export const hasAuthTokens = (): boolean => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME);

  if (refreshToken) {
    return true;
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME);
  return Boolean(accessToken);
};

export const clearClientAuthStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_NAME);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_NAME);
  localStorage.removeItem(ClientDataType.CLIENT_TOKEN);
};
