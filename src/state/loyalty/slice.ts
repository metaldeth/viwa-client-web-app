import {
  getCurrentClientProfileThunk,
  getClientsListThunk,
  getWaterHistoryListThunk,
} from './thunk';
import {
  ClientProfileDTO,
  CreateClientRes,
  SendCodeResponse,
  ShortClientResponseDTO,
  WaterHistoryDTO,
  WaterHistoryPageDTO,
} from '../../types/serverInterface/clientDTO';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type StateItemType<T> = {
  state: T extends [] ? T : T | null;
  isLoading: boolean;
  isReject: boolean;
};

type WaterHistoryListState = StateItemType<WaterHistoryDTO[]> & {
  totalElements: number | null;
};

export type LoyaltyState = {
  clientList: StateItemType<ShortClientResponseDTO[]>;
  clientProfile: StateItemType<ClientProfileDTO>;
  waterHistoryList: WaterHistoryListState;
  sendCodeToPhone: StateItemType<SendCodeResponse>;
  checkCodeAndCreateClient: StateItemType<CreateClientRes>;
};

const initialState: LoyaltyState = {
  clientList: {
    state: [],
    isLoading: false,
    isReject: false,
  },
  clientProfile: {
    state: null,
    isLoading: false,
    isReject: false,
  },
  waterHistoryList: {
    state: [],
    totalElements: null,
    isLoading: false,
    isReject: false,
  },
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

export const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getClientsListThunk.pending, (state) => {
      state.clientList.isLoading = true;
      state.clientList.isReject = false;
    });

    builder.addCase(getClientsListThunk.rejected, (state) => {
      state.clientList.isLoading = false;
      state.clientList.isReject = true;
    });

    builder.addCase(getClientsListThunk.fulfilled, (state, action) => {
      state.clientList.state = action.payload;
      state.clientList.isLoading = false;
      state.clientList.isReject = false;
    });

    builder.addCase(getCurrentClientProfileThunk.pending, (state) => {
      state.clientProfile.state = null;
      state.clientProfile.isLoading = true;
      state.clientProfile.isReject = false;
    });

    builder.addCase(getCurrentClientProfileThunk.rejected, (state) => {
      state.clientProfile.isLoading = false;
      state.clientProfile.isReject = true;
    });

    builder.addCase(getCurrentClientProfileThunk.fulfilled, (state, action) => {
      state.clientProfile.state = action.payload;
      state.clientProfile.isLoading = false;
      state.clientProfile.isReject = false;
    });

    builder.addCase(getWaterHistoryListThunk.pending, (state) => {
      state.waterHistoryList.state = null;
      state.waterHistoryList.totalElements = null;
      state.waterHistoryList.isLoading = true;
      state.waterHistoryList.isReject = false;
    });

    builder.addCase(getWaterHistoryListThunk.rejected, (state) => {
      state.waterHistoryList.isLoading = false;
      state.waterHistoryList.isReject = true;
    });

    builder.addCase(
      getWaterHistoryListThunk.fulfilled,
      (state, action: PayloadAction<WaterHistoryPageDTO>) => {
        state.waterHistoryList.state = action.payload.content;
        state.waterHistoryList.totalElements = action.payload.totalElements;
        state.waterHistoryList.isLoading = false;
        state.waterHistoryList.isReject = false;
      },
    );
  },
});

export const loyaltyReducer = loyaltySlice.reducer;
