import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import patientReducer from "./slices/patientSlice";
import doctorReducer from "./slices/doctorSlice";
import adminReducer from "./slices/adminSlice";

// for persist the data using react-persist
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // persist only auth
};

const rootReducer = combineReducers({
  auth: authReducer,
  patient: patientReducer,
  doctor: doctorReducer,
  admin: adminReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: import.meta.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
