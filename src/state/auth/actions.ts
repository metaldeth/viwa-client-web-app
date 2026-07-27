import { checkCodeAndCreateClientThunk, sendCodeToPhoneThunk } from './thunk';
import { AppDispatch } from '../../app/store';

export const sendCodeToPhoneAction = (phoneNumber: string) => (dispatch: AppDispatch) =>
  dispatch(sendCodeToPhoneThunk(phoneNumber));

export const checkCodeAndCreateClientAction =
  (phoneNumber: string, code: string, machineSerial?: string) => (dispatch: AppDispatch) =>
    dispatch(checkCodeAndCreateClientThunk({ phoneNumber, code, machineSerial }));
