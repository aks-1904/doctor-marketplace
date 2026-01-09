import { createSlice } from "@reduxjs/toolkit";

const patientSlice = createSlice({
  name: "patient",
  initialState: {
    profile: null,
    doctors: [],
    callHistory: [],
  },
  reducers: {
    setPatientProfile: (state, action) => {
      state.profile = action.payload;
    },
    setDoctors: (state, action) => {
      state.doctors = action.payload;
    },
  },
});

export const { setPatientProfile, setDoctors } = patientSlice.actions;
export default patientSlice.reducer;
