import { createSlice } from "@reduxjs/toolkit";

const doctorSlice = createSlice({
  name: "doctor",
  initialState: {
    profile: null,
    isOnline: false,
    appointments: [],
  },
  reducers: {
    setDoctorProfile: (state, action) => {
      state.profile = action.payload;
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    setDoctorInitialState: (state, action) => {
      state.profile = null;
      state.isOnline = false;
    },
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
    updateAppointment: (state, action) => {
      state.appointments.forEach((app) => {
        if (app?._id === action.payload?._id) {
          app = action.payload?.data;
        }
      });
    },
  },
});

export const {
  setDoctorProfile,
  setOnlineStatus,
  setDoctorInitialState,
  updateAppointment,
  setAppointments,
} = doctorSlice.actions;
export default doctorSlice.reducer;
