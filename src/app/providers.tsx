"use client";

import { AccountPersistence } from "@/components/AccountPersistence";
import store from "@/Redux/Reducers/Store";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <AccountPersistence />
        {children}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastStyle={{
            fontFamily: "inherit",
          }}
          style={
            {
              "--toastify-color-success": "#027f81",
              "--toastify-color-success-rgb": "2, 127, 129",
            } as React.CSSProperties
          }
        />
      </ReduxProvider>
    </SessionProvider>
  );
}
