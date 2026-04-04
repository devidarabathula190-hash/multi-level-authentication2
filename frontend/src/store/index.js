import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import transactionReducer from './transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    transaction: transactionReducer,
  },
});
