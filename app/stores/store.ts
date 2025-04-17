import { configureStore } from '@reduxjs/toolkit';
import documentReducer from './docSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    documents: documentReducer,
    ui: uiReducer,
  },
});

// 添加 AppThunk 类型定义
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => ReturnType;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;