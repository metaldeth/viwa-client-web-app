import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../app/api';
import { CheckCodeResponse, SendCodeResult } from '../../types/serverInterface/clientDTO';

export const sendCodeToPhoneThunk = createAsyncThunk<SendCodeResult, string>(
  'sendCodeToPhoneAction',
  async (phoneNumber) => {
    return await api.auth.sendCodeToPhone(phoneNumber);
  },
);

export const checkCodeAndCreateClientThunk = createAsyncThunk<
  CheckCodeResponse,
  { phoneNumber: string; code: string; machineSerial?: string }
>('checkCodeAndCreateClientAction', async ({ phoneNumber, code, machineSerial }) => {
  return await api.auth.checkCodeAndCreateClient(phoneNumber, code, machineSerial);
});
