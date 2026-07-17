import { configureStore } from '@reduxjs/toolkit';
import { loyaltyReducer } from '../state/loyalty/slice';
import { authReducer } from '../state/auth/slice';

export const store = configureStore({
  devTools: true,

  reducer: {
    loyalty: loyaltyReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
