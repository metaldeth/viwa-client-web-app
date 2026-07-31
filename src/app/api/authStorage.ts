import { ACCESS_TOKEN_STORAGE_NAME, REFRESH_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { ClientDataType } from '../../types/enums/clientDataType';

export type AccessTokenChangeListener = (accessToken: string | null) => void;

const accessTokenListeners = new Set<AccessTokenChangeListener>();
let storageListenerInstalled = false;

function notifyAccessTokenChange(accessToken: string | null): void {
  for (const listener of accessTokenListeners) {
    listener(accessToken);
  }
}

function ensureCrossTabAccessTokenListener(): void {
  if (storageListenerInstalled || typeof window === 'undefined') {
    return;
  }

  storageListenerInstalled = true;
  window.addEventListener('storage', (event) => {
    if (event.key === ACCESS_TOKEN_STORAGE_NAME) {
      notifyAccessTokenChange(event.newValue);
    }
  });
}

/**
 * Subscribe to client access-token changes (same-tab saves/clears and cross-tab `storage`).
 * Used by the subscription WebSocket to reconnect, disconnect, or connect after refresh.
 */
export function subscribeAccessTokenChanges(listener: AccessTokenChangeListener): () => void {
  ensureCrossTabAccessTokenListener();
  accessTokenListeners.add(listener);
  return () => accessTokenListeners.delete(listener);
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME);
}

export function saveAccessToken(accessToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, accessToken);
  notifyAccessTokenChange(accessToken);
}

export function saveAuthTokens(accessToken: string, refreshToken: string, clientId?: string): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, refreshToken);

  if (clientId) {
    localStorage.setItem(ClientDataType.CLIENT_TOKEN, clientId);
  }

  notifyAccessTokenChange(accessToken);
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_NAME);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_NAME);
  localStorage.removeItem(ClientDataType.CLIENT_TOKEN);
  notifyAccessTokenChange(null);
}
