import { baseApi } from "@/Redux/Api/BaseApi";
import { customerApi } from "@/Redux/Api/CustomerBaseApi";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import accountReducer from "./CommonReducer/accountSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    account: accountReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // RTK Query stores non-serializable values (like Blob) in mutation results
        // and passes them through action.payload. We can safely ignore those here.
        ignoredPaths: [
          `${baseApi.reducerPath}.mutations`,
          `${customerApi.reducerPath}.mutations`,
        ],
        ignoredActions: [
          `${baseApi.reducerPath}/executeQuery/pending`,
          `${baseApi.reducerPath}/executeQuery/fulfilled`,
          `${baseApi.reducerPath}/executeQuery/rejected`,
          `${baseApi.reducerPath}/executeMutation/pending`,
          `${baseApi.reducerPath}/executeMutation/fulfilled`,
          `${baseApi.reducerPath}/executeMutation/rejected`,
          `${customerApi.reducerPath}/executeQuery/pending`,
          `${customerApi.reducerPath}/executeQuery/fulfilled`,
          `${customerApi.reducerPath}/executeQuery/rejected`,
          `${customerApi.reducerPath}/executeMutation/pending`,
          `${customerApi.reducerPath}/executeMutation/fulfilled`,
          `${customerApi.reducerPath}/executeMutation/rejected`,
        ],
      },
    }).concat(baseApi.middleware, customerApi.middleware),
});

// Optional but recommended for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
