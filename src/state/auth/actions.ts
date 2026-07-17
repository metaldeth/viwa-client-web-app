import { checkCodeAndCreateClientThunk, sendCodeToPhoneThunk } from './thunk';
import { CreateClientDto } from '../../types/serverInterface/clientDTO';
import { AppDispatch } from '../../app/store';

/**
 * Отправка номера телефона для получения кода авторизации
 *
 * @param phoneNumber номер телефона
 */
export const sendCodeToPhoneAction = (phoneNumber: string) => (dispatch: AppDispatch) =>
  dispatch(sendCodeToPhoneThunk(phoneNumber));

/**
 * Отправка номера телефона и кода подтверждения для получения токена клиента
 *
 * @param phoneNumber номер телефона
 * @param code код
 * @param data dto информации клиента
 */
export const checkCodeAndCreateClientAction =
  (phoneNumber: string, code: string, data: CreateClientDto) => (dispatch: AppDispatch) =>
    dispatch(checkCodeAndCreateClientThunk({ phoneNumber, code, data }));
