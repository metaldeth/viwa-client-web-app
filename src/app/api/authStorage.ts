import { ACCESS_TOKEN_STORAGE_NAME, REFRESH_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { ClientDataType } from '../../types/enums/clientDataType';

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME);
}

export function saveAccessToken(accessToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, accessToken);
}

export function saveAuthTokens(accessToken: string, refreshToken: string, clientId?: string): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, refreshToken);

  if (clientId) {
    localStorage.setItem(ClientDataType.CLIENT_TOKEN, clientId);
  }
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_NAME);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_NAME);
  localStorage.removeItem(ClientDataType.CLIENT_TOKEN);
}
