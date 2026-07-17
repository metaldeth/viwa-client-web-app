import { AppDispatch } from '../../app/store';
import { getClientInfoThunk, getClientsListThunk, getWaterHistoryListThunk } from './thunk';
import { WaterHistoryFilters } from '../../types/serverInterface/clientDTO';

/**
 * Получение списка клиентов
 */
export const getClientsListAction = () => (dispatch: AppDispatch) =>
  dispatch(getClientsListThunk());

/**
 * Получение информации о клиенте
 *
 * @param clientId id клиента
 */
export const getClientInfoAction = (clientId: string) => (dispatch: AppDispatch) =>
  dispatch(getClientInfoThunk(clientId));

/**
 * Получение списка истории наливов
 *
 * @param filters фильтры
 */
export const getWaterHistoryListAction =
  (filters: WaterHistoryFilters) => (dispatch: AppDispatch) =>
    dispatch(getWaterHistoryListThunk(filters));
