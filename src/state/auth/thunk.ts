import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../app/api';
import { CheckCodeResponse, SendCodeResult } from '../../types/serverInterface/clientDTO';
import { getStoredRegistrationHint } from '../../utils/landingEntry';
import { completeFirstRegistrationNavigation, completeReturningAuthNavigation } from './navigation';

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
  const registrationHint = getStoredRegistrationHint();

  const response = await api.auth.checkCodeAndCreateClient(phoneNumber, code, {
    machineSerial,
    registrationHint,
  });

  if (machineSerial) {
    completeFirstRegistrationNavigation();
  } else {
    completeReturningAuthNavigation();
  }

  return response;
});
