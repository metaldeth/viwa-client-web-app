import { ClientDataType } from '../../types/enums/clientDataType';
import { ACCESS_TOKEN_STORAGE_NAME, REFRESH_TOKEN_STORAGE_NAME } from '../../consts/env/storage';

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

export const isClientAuthRoute = (pathname: string): boolean => {
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

export const redirectToClientAuth = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const { pathname } = window.location;

  if (!shouldRedirectToClientAuth(pathname)) {
    return;
  }

  const authPath = getMachineAuthPath(pathname);
  if (!authPath) {
    return;
  }

  const normalizedPath = trimTrailingSlashes(pathname);
  if (normalizedPath === authPath) {
    return;
  }

  window.location.replace(authPath);
};

export const hasAuthTokens = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME);
  const clientId = localStorage.getItem(ClientDataType.CLIENT_TOKEN);

  return Boolean(accessToken && refreshToken && clientId);
};

export const clearClientAuthStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_NAME);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_NAME);
  localStorage.removeItem(ClientDataType.CLIENT_TOKEN);
};
