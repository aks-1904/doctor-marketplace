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
  },
});

export const { setUnverifiedDoctors, setAdminProfile } = adminSlice.actions;
export default adminSlice.reducer;
