import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import doctorReducer from "./slices/doctorSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    doctor: doctorReducer,
    admin: adminReducer,
  },
  devTools: true,
});
