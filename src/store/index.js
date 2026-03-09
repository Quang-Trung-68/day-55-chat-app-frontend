import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/store/api/apiSlice";
import "@/store/api/authApi";
import "@/store/api/usersApi";
import "@/store/api/conversationsApi";
import authReducer from "@/store/authSlice";

const appReducer = combineReducers({
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const rootReducer = (state, action) => {
  if (action.type === "store/reset") {
    state = undefined; // reset toàn bộ về initialState
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
