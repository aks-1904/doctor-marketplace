import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    profile: null,
    unverifiedDoctors: [],
  },
  reducers: {
    setAdminProfile: (state, action) => {
      state.profile = action.payload;
    },
    setUnverifiedDoctors: (state, action) => {
      state.unverifiedDoctors = action.payload;
    },
    setAdminInitialState: (state, _) => {
      state.profile = null;
      state.unverifiedDoctors = [];
    },
  },
});

export const { setUnverifiedDoctors, setAdminProfile, setAdminInitialState } =
  adminSlice.actions;
export default adminSlice.reducer;
