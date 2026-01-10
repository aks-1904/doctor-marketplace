import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    profile: null,
    unverifiedDoctors: [],
    approvedDoctors: [],
    allUsers: [],
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
    setApprovedDoctors: (state, action) => {
      state.approvedDoctors = action.payload;
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
  },
});

export const {
  setUnverifiedDoctors,
  setAdminProfile,
  setAdminInitialState,
  setApprovedDoctors,
  setAllUsers,
} = adminSlice.actions;
export default adminSlice.reducer;
