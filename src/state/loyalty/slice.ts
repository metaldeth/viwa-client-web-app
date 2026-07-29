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
import { mergeClientProfileFromServer } from './mergeClientProfile';

type StateItemType<T> = {
  state: T extends [] ? T : T | null;
  isLoading: boolean;
  isReject: boolean;
};

type ClientProfileSliceState = StateItemType<ClientProfileDTO> & {
  /** Bumped on WS/PATCH merges to guard against stale GET full-replace. */
  localRevision: number;
  pendingFetchRevision: number | null;
};

type WaterHistoryListState = StateItemType<WaterHistoryDTO[]> & {
  totalElements: number | null;
};

export type LoyaltyState = {
  clientList: StateItemType<ShortClientResponseDTO[]>;
  clientProfile: ClientProfileSliceState;
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
    localRevision: 0,
    pendingFetchRevision: null,
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
  reducers: {
    patchClientProfile: (
      state,
      action: PayloadAction<Partial<ClientProfileDTO> & { id: string }>,
    ) => {
      state.clientProfile.localRevision += 1;

      if (!state.clientProfile.state) {
        state.clientProfile.state = action.payload as ClientProfileDTO;
      } else {
        state.clientProfile.state = {
          ...state.clientProfile.state,
          ...action.payload,
          qrPayload: action.payload.qrPayload ?? state.clientProfile.state.qrPayload,
        };
      }
      state.clientProfile.isLoading = false;
      state.clientProfile.isReject = false;
    },
  },
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
      state.clientProfile.pendingFetchRevision = state.clientProfile.localRevision;
      if (state.clientProfile.state === null) {
        state.clientProfile.isLoading = true;
      }
      state.clientProfile.isReject = false;
    });

    builder.addCase(getCurrentClientProfileThunk.rejected, (state) => {
      state.clientProfile.isLoading = false;
      state.clientProfile.isReject = true;
    });

    builder.addCase(getCurrentClientProfileThunk.fulfilled, (state, action) => {
      const preserveVolatile =
        state.clientProfile.pendingFetchRevision !== null &&
        state.clientProfile.localRevision > state.clientProfile.pendingFetchRevision;

      state.clientProfile.state = mergeClientProfileFromServer(
        state.clientProfile.state,
        action.payload,
        { preserveVolatileFromCurrent: preserveVolatile },
      );
      state.clientProfile.pendingFetchRevision = null;
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

export const { patchClientProfile } = loyaltySlice.actions;
export const loyaltyReducer = loyaltySlice.reducer;
