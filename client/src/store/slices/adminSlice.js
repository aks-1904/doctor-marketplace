import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    pendingDoctors: [],
  },
  reducers: {
    setPendingDoctors: (state, action) => {
      state.pendingDoctors = action.payload;
    },
  },
});

export const { setPendingDoctors } = adminSlice.actions;
export default adminSlice.reducer;
