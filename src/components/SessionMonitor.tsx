"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * SessionMonitor component that detects logout events across browser tabs
 * Uses localStorage to broadcast logout events between tabs
 */
export default function SessionMonitor() {
  const { status } = useSession();
  const router = useRouter();
  const previousStatusRef = useRef(status);

  useEffect(() => {
    // Function to handle logout detection from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      // Check if the logout event was triggered
      if (e.key === "logout-event" && e.newValue) {
        // Redirect to unauthorized page
        router.push("/unauthorized");

        // Clean up the logout event after a short delay
        setTimeout(() => {
          localStorage.removeItem("logout-event");
        }, 100);
      }
    };

    // Listen for storage events (triggered when localStorage changes in another tab)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  // Monitor session status changes
  useEffect(() => {
    // If user was authenticated but now is not (session ended)
    if (
      previousStatusRef.current === "authenticated" &&
      status === "unauthenticated"
    ) {
      // Check if we're not already on auth pages
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath.startsWith("/auth/") ||
        currentPath === "/unauthorized" ||
        currentPath === "/";

      if (!isAuthPage) {
        router.push("/unauthorized");
      }
    }

    // Update the previous status
    previousStatusRef.current = status;
  }, [status, router]);

  return null; // This component doesn't render anything
}
