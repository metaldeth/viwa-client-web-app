import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../app/api';
import { CheckCodeResponse, SendCodeResult } from '../../types/serverInterface/clientDTO';
import { getStoredRegistrationHint } from '../../utils/landingEntry';
import { completeFirstRegistrationNavigation, completeReturningAuthNavigation } from './navigation';

export const sendCodeToPhoneThunk = createAsyncThunk<
  SendCodeResult,
  string,
  { rejectValue: unknown }
>('sendCodeToPhoneAction', async (phoneNumber, { rejectWithValue }) => {
  try {
    return await api.auth.sendCodeToPhone(phoneNumber);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const checkCodeAndCreateClientThunk = createAsyncThunk<
  CheckCodeResponse,
  { phoneNumber: string; code: string; machineSerial?: string }
>('checkCodeAndCreateClientAction', async ({ phoneNumber, code, machineSerial }) => {
  const registrationHint = getStoredRegistrationHint();

  const response = await api.auth.checkCodeAndCreateClient(phoneNumber, code, {
    machineSerial,
    registrationHint,
  });

  if (machineSerial || registrationHint === 'website') {
    completeFirstRegistrationNavigation();
  } else {
    completeReturningAuthNavigation();
  }

  return response;
});
