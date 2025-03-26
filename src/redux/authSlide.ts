import { createSlice } from '@reduxjs/toolkit';

import { UserInfo } from '@/types/auth';

interface AuthState {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
}

const initialState: AuthState = {
  isAuthenticated: true,
  userInfo: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.userInfo = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userInfo = null;
    },
    updateUserInfo(state, action) {
      state.userInfo = action.payload;
    },
  },
});

export const authAction = authSlice.actions;

export const authReducer = authSlice.reducer;
