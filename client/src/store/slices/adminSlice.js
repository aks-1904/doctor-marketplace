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
    addApprovedDoctors: (state, action) => {
      state.approvedDoctors.push(action.payload);
    },
    removeUnverifiedDoctors: (state, action) => {
      state.unverifiedDoctors = state.unverifiedDoctors.filter(
        (doc) => doc?._id !== action.payload?._id
      );
    },
    removeApprovedDoctor: (state, action) => {
      state.approvedDoctors = state.approvedDoctors.filter(
        (doc) => doc?._id !== action.payload?._id
      );
    },
  },
});

export const {
  setUnverifiedDoctors,
  setAdminProfile,
  setAdminInitialState,
  setApprovedDoctors,
  setAllUsers,
  addApprovedDoctors,
  removeUnverifiedDoctors,
  removeApprovedDoctor,
} = adminSlice.actions;
export default adminSlice.reducer;
