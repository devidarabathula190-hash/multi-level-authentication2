import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    fetchTransactionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTransactionsSuccess: (state, action) => {
      state.loading = false;
      state.transactions = action.payload;
    },
    setCurrentTransaction: (state, action) => {
      state.currentTransaction = action.payload;
    },
    transactionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchTransactionsStart, fetchTransactionsSuccess, setCurrentTransaction, transactionFailure } = transactionSlice.actions;
export default transactionSlice.reducer;
