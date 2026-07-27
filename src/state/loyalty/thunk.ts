import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  ShortClientResponseDTO,
  ClientProfileDTO,
  WaterHistoryFilters,
  WaterHistoryPageDTO,
} from '../../types/serverInterface/clientDTO';
import { api } from '../../app/api';

export const getClientsListThunk = createAsyncThunk<ShortClientResponseDTO[]>(
  'getClientsList',
  async () => {
    return await api.loyalty.fetchClientsList();
  },
);

export const getCurrentClientProfileThunk = createAsyncThunk<ClientProfileDTO>(
  'getCurrentClientProfile',
  async () => await api.loyalty.fetchCurrentClientProfile(),
);

export const getWaterHistoryListThunk = createAsyncThunk<WaterHistoryPageDTO, WaterHistoryFilters>(
  'getWaterHistoryList',
  async (filters) => await api.loyalty.fetchWaterHistoryList(filters),
);
