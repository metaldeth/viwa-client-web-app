import { RootState } from '../../app/store';

/**
 * Селектор отправки номера телефона для получения кода авторизации
 */
export const selectSendCodeToPhone = () => (state: RootState) => state.auth.sendCodeToPhone;

/**
 * Селектор номера телефона и кода подтверждения для получения токена клиента
 */
export const selectCheckCodeAndCreateClient = () => (state: RootState) =>
  state.auth.checkCodeAndCreateClient;
