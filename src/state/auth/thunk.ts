import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../app/api';
import { CreateClientDto, CreateClientRes } from '../../types/serverInterface/clientDTO';

/**
 * Отправка номера телефона для получения кода авторизации (код авторизации приходит по звонку с сервиса)
 * А запрос возвращает количество секунд между запросами
 *
 * @param phoneNumber номер телефона
 */
export const sendCodeToPhoneThunk = createAsyncThunk<string, string>(
  'sendCodeToPhoneAction',
  async (phoneNumber) => {
    return await api.auth.sendCodeToPhone(phoneNumber);
  },
);

/**
 * Отправка номера телефона и кода подтверждения для получения токена клиента
 *
 * @param phoneNumber номер телефона
 * @param code код
 * @param data dto информации клиента
 */
export const checkCodeAndCreateClientThunk = createAsyncThunk<
  CreateClientRes,
  { phoneNumber: string; code: string; data: CreateClientDto }
>('checkCodeAndCreateClientAction', async ({ phoneNumber, code, data }) => {
  return await api.auth.checkCodeAndCreateClient(phoneNumber, code, data);
});
