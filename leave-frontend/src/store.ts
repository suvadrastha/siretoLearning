import { configureStore } from "@reduxjs/toolkit";
import { leavesApi } from "./api/leavesApi";
import { usersApi } from "./api/usersApi";

export const store = configureStore({
  reducer: {
    [leavesApi.reducerPath]: leavesApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(leavesApi.middleware, usersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
