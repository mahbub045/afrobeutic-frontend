"use client";

import { AccountPersistence } from "@/components/AccountPersistence";
import store from "@/Redux/Reducers/Store";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { SessionProvider } from "next-auth/react";
import type { CSSProperties, ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

function StripeProviders({ children }: { children: ReactNode }) {
  if (!stripePromise) {
    // Keep the app functional even if Stripe isn't configured.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable card payments.",
      );
    }
    return <>{children}</>;
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <AccountPersistence />
        <StripeProviders>{children}</StripeProviders>
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
            } as CSSProperties
          }
        />
      </ReduxProvider>
    </SessionProvider>
  );
}
