import { createSlice } from "@reduxjs/toolkit";

const doctorSlice = createSlice({
  name: "doctor",
  initialState: {
    profile: null,
    isOnline: false,
  },
  reducers: {
    setDoctorProfile: (state, action) => {
      state.profile = action.payload;
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
  },
});

export const { setDoctorProfile, setOnlineStatus } = doctorSlice.actions;
export default doctorSlice.reducer;
