import { AppDispatch } from '../../app/store';
import {
  getCurrentClientProfileThunk,
  getClientsListThunk,
  getWaterHistoryListThunk,
} from './thunk';
import { WaterHistoryFilters } from '../../types/serverInterface/clientDTO';

export const getClientsListAction = () => (dispatch: AppDispatch) =>
  dispatch(getClientsListThunk());

export const getCurrentClientProfileAction = () => (dispatch: AppDispatch) =>
  dispatch(getCurrentClientProfileThunk());

export const getWaterHistoryListAction =
  (filters: WaterHistoryFilters) => (dispatch: AppDispatch) =>
    dispatch(getWaterHistoryListThunk(filters));
