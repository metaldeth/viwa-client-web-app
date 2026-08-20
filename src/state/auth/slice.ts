import {
  CheckCodeResponse,
  SendCodeResponse,
  SendCodeResult,
} from '../../types/serverInterface/clientDTO';
import { createSlice } from '@reduxjs/toolkit';
import { checkCodeAndCreateClientThunk, sendCodeToPhoneThunk } from './thunk';
import { api } from '../../app/api';

type StateItemType<T> = {
  state: T extends [] ? T : T | null;
  isLoading: boolean;
  isReject: boolean;
};

export type AuthState = {
  sendCodeToPhone: StateItemType<SendCodeResponse> & {
    lastError: unknown;
    lastResult: SendCodeResult | null;
  };
  checkCodeAndCreateClient: StateItemType<CheckCodeResponse>;
};

const initialState: AuthState = {
  sendCodeToPhone: {
    state: null,
    isLoading: false,
    isReject: false,
    lastError: null,
    lastResult: null,
  },
  checkCodeAndCreateClient: {
    state: null,
    isLoading: false,
    isReject: false,
  },
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(sendCodeToPhoneThunk.pending, (state) => {
      state.sendCodeToPhone.isLoading = true;
      state.sendCodeToPhone.isReject = false;
      state.sendCodeToPhone.lastError = null;
      state.sendCodeToPhone.lastResult = null;
    });

    builder.addCase(sendCodeToPhoneThunk.rejected, (state, action) => {
      state.sendCodeToPhone.state = {
        result: '',
        error: action.error.code as string,
      };
      state.sendCodeToPhone.isLoading = false;
      state.sendCodeToPhone.isReject = true;
      state.sendCodeToPhone.lastError = action.payload ?? action.error;
      state.sendCodeToPhone.lastResult = null;
    });

    builder.addCase(sendCodeToPhoneThunk.fulfilled, (state, action) => {
      state.sendCodeToPhone.state = {
        result: String(action.payload.cooldownSeconds),
        error: '',
      };
      state.sendCodeToPhone.isLoading = false;
      state.sendCodeToPhone.isReject = false;
      state.sendCodeToPhone.lastError = null;
      state.sendCodeToPhone.lastResult = action.payload;
    });

    builder.addCase(checkCodeAndCreateClientThunk.pending, (state) => {
      state.checkCodeAndCreateClient.isLoading = true;
      state.checkCodeAndCreateClient.isReject = false;
    });

    builder.addCase(checkCodeAndCreateClientThunk.rejected, (state) => {
      state.checkCodeAndCreateClient.isLoading = false;
      state.checkCodeAndCreateClient.isReject = true;
    });

    builder.addCase(checkCodeAndCreateClientThunk.fulfilled, (state, action) => {
      state.checkCodeAndCreateClient.state = action.payload;
      state.checkCodeAndCreateClient.isLoading = false;
      state.checkCodeAndCreateClient.isReject = false;

      const { accessToken, refreshToken, client } = action.payload;

      if (accessToken && refreshToken) {
        api.saveTokens(accessToken, refreshToken, client.id);
      }
    });
  },
});

export const authReducer = authSlice.reducer;
