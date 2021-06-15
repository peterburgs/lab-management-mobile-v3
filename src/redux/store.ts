import {configureStore, ThunkAction, Action} from '@reduxjs/toolkit';
import {useDispatch, useSelector, TypedUseSelectorHook} from 'react-redux';

// Import slices
import authReducer from './reducers/authSlice';
import userReducer from './reducers/userSlice';
import scheduleReducer from './reducers/scheduleSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    schedule: scheduleReducer,
  },
  devTools: process.env.NODE_ENV === 'development',
});

export type RootState = ReturnType<typeof store.getState>;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
