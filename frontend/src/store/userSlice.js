import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  receivers: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchUsersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload;
    },
    fetchReceiversSuccess: (state, action) => {
      state.loading = false;
      state.receivers = action.payload;
    },
    fetchUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchUsersStart, fetchUsersSuccess, fetchReceiversSuccess, fetchUsersFailure } = userSlice.actions;
export default userSlice.reducer;
