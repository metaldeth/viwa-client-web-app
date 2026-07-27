import { RootState } from '../../app/store';

export const selectClientList = () => (state: RootState) => state.loyalty.clientList;

export const selectClientProfile = () => (state: RootState) => state.loyalty.clientProfile;

export const selectWaterHistoryList = () => (state: RootState) => state.loyalty.waterHistoryList;
