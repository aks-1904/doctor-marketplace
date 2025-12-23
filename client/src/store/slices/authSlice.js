import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload?.user;
      state.profile = action.payload?.profile;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
