import { ClientDataType } from '../../types/enums/clientDataType';
import { ACCESS_TOKEN_STORAGE_NAME, REFRESH_TOKEN_STORAGE_NAME } from '../../consts/env/storage';

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
