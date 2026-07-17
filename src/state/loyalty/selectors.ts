import { RootState } from '../../app/store';

/**
 * Получение списка клиентов
 */
export const selectClientList = () => (state: RootState) => state.loyalty.clientList;

/**
 * Получение информации о клиенте
 */
export const selectClientInfo = () => (state: RootState) => state.loyalty.clientInfo;

/**
 * Получение списка истории наливов
 */
export const selectWaterHistoryList = () => (state: RootState) => state.loyalty.waterHistoryList;
