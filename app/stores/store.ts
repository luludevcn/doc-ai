import { configureStore } from '@reduxjs/toolkit';
import documentReducer from './docSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    documents: documentReducer,
    ui: uiReducer,
  },
});

export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => ReturnType;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;