import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  ShortClientResponseDTO,
  ClientDTO,
  WaterHistoryFilters,
  WaterHistoryPageDTO,
  CreateClientDto,
  CreateClientRes,
} from '../../types/serverInterface/clientDTO';
import { api } from '../../app/api';

/**
 * Получение списка клиентов
 */
export const getClientsListThunk = createAsyncThunk<ShortClientResponseDTO[]>(
  'getClientsList',
  async () => {
    return await api.loyalty.fetchClientsList();
  },
);

/**
 * Получение информации о клиенте
 *
 * @param clientId id клиента
 */
export const getClientInfoThunk = createAsyncThunk<ClientDTO, string>(
  'getClientInfo',
  async (clientId) => await api.loyalty.fetchClientInformation(clientId),
);

/**
 * Текущий клиент по организации из маршрута и Bearer из axios
 */
export const getCurrentClientInfoThunk = createAsyncThunk<ClientDTO, number>(
  'getCurrentClientInfo',
  async (organizationId) => await api.loyalty.fetchCurrentClientInformation(organizationId),
);

/**
 * Получение списка истории наливов
 *
 * @param filters фильтры
 */
export const getWaterHistoryListThunk = createAsyncThunk<WaterHistoryPageDTO, WaterHistoryFilters>(
  'getWaterHistoryList',
  async (filters) => await api.loyalty.fetchWaterHistoryList(filters),
);
