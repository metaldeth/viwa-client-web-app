import { ClientDataType } from '../../types/enums/clientDataType';
import { ACCESS_TOKEN_STORAGE_NAME } from '../../consts/env/storage';

/**
 * Проверка наличия токенов
 */
export const hasAuthTokens = () => {
  const clientToken = localStorage.getItem(ClientDataType.CLIENT_TOKEN);
  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME);

  return Boolean(clientToken && accessToken);
};
