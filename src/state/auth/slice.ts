import { CreateClientRes, SendCodeResponse } from '../../types/serverInterface/clientDTO';
import { createSlice } from '@reduxjs/toolkit';
import { checkCodeAndCreateClientThunk, sendCodeToPhoneThunk } from './thunk';
import { ACCESS_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { api } from '../../app/api';

type StateItemType<T> = {
  state: T extends [] ? T : T | null;
  isLoading: boolean;
  isReject: boolean;
};

export type AuthState = {
  sendCodeToPhone: StateItemType<SendCodeResponse>;
  checkCodeAndCreateClient: StateItemType<CreateClientRes>;
};

const initialState: AuthState = {
  sendCodeToPhone: {
    state: null,
    isLoading: false,
    isReject: false,
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
    // sendCodeToPhoneThunk
    builder.addCase(sendCodeToPhoneThunk.pending, (state) => {
      state.sendCodeToPhone.isLoading = true;
      state.sendCodeToPhone.isReject = false;
    });

    builder.addCase(sendCodeToPhoneThunk.rejected, (state, action) => {
      state.sendCodeToPhone.state = {
        result: '',
        error: action.error.code as string,
      };
      state.sendCodeToPhone.isLoading = false;
      state.sendCodeToPhone.isReject = true;
    });

    builder.addCase(sendCodeToPhoneThunk.fulfilled, (state, action) => {
      state.sendCodeToPhone.state = {
        result: action.payload,
        error: '',
      };
      state.sendCodeToPhone.isLoading = false;
      state.sendCodeToPhone.isReject = false;
    });

    // checkCodeAndCreateClientThunk
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

      const token = action.payload.token;

      if (token) {
        localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, token);
        api.saveToken(token);
      }
    });
  },
});

export const authReducer = authSlice.reducer;
