import { createSlice } from "@reduxjs/toolkit";

const patientSlice = createSlice({
  name: "patient",
  initialState: {
    profile: null,
    doctors: [],
    callHistory: [],
    appointments: [],
  },
  reducers: {
    setPatientProfile: (state, action) => {
      state.profile = action.payload;
    },
    setDoctors: (state, action) => {
      state.doctors = action.payload;
    },
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    setPatientInitialState: (state, action) => {
      state.profile = null;
      state.doctors = [];
      state.callHistory = [];
      state.appointments = [];
    },
  },
});

export const {
  setPatientProfile,
  setDoctors,
  setAppointments,
  addAppointment,
  setPatientInitialState,
} = patientSlice.actions;
export default patientSlice.reducer;
