import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    unverifiedDoctors: [],
  },
  reducers: {
    setUnverifiedDoctors: (state, action) => {
      state.unverifiedDoctors = action.payload;
    },
  },
});

export const { setUnverifiedDoctors } = adminSlice.actions;
export default adminSlice.reducer;
