"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * TokenRefreshMonitor component
 * Monitors the session for token refresh errors and redirects to login if needed
 */
export default function TokenRefreshMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.error === "RefreshAccessTokenError"
    ) {
      // Token refresh failed, sign out the user
      console.error("Session expired or refresh token invalid. Signing out...");
      signOut({ redirect: true, callbackUrl: "/auth/login" });
    }
  }, [session, status, router]);

  return null; // This component doesn't render anything
}
