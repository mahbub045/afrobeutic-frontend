import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession, signOut } from "next-auth/react";

// Mutex to prevent concurrent refresh token calls
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_APIBASE_URL,
  prepareHeaders: async (headers) => {
    // Prioritize localStorage for tokens (single source of truth)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const accountId =
      typeof window !== "undefined"
        ? localStorage.getItem("activeAccountId")
        : null;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (accountId) {
      headers.set("X-ACCOUNT-ID", accountId);
    }
    return headers;
  },
});

// Centralized token refresh function with mutex
const refreshAccessToken = async (): Promise<string | null> => {
  // If already refreshing, wait for the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      let refreshToken: string | null = null;

      // Try localStorage first
      if (typeof window !== "undefined") {
        refreshToken = localStorage.getItem("refreshToken");
      }

      // Fallback to session if not in localStorage
      if (!refreshToken) {
        const session = await getSession();
        refreshToken = session?.user?.refreshToken ?? null;
      }

      if (!refreshToken) {
        console.error("No refresh token available");
        await logOut();
        return null;
      }

      const formData = new FormData();
      formData.append("refresh", refreshToken);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APIBASE_URL}/token/refresh`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const newToken = data.access;
      const newRefreshToken = data.refresh;

      // Update localStorage (single source of truth)
      if (typeof window !== "undefined") {
        localStorage.setItem("token", newToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }
      }

      return newToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      await logOut();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized
  if (result.error && result.error.status === 401) {
    // Attempt to refresh the token
    const newToken = await refreshAccessToken();

    if (newToken) {
      // Retry the original request with the new token
      // The new token will be automatically picked up by prepareHeaders
      result = await baseQuery(args, api, extraOptions);
    }
    // If refresh failed, user is already logged out by refreshAccessToken
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    // Common Tags
    "UserProfile",
    // Client Panlel Tags
    "AcceptInvitation",
    "CommonCategories",
    "Members",
    "AccountAccesser",
    "SalonList",
    "SingleSalon",
    "Services",
    "Products",
    "Chairs",
    "ChairsBooking",
    "Bookings",
    "IndividualBookings",
    "Receipt",
    "LookBook",
    "Employees",
    "Leads",
    "Customers",
    "LeadsAndCustomers",
    "Enquiries",
    "SupportTickets",
    "SalonAnalytics",
    // Admin Panel Tags
    "ManagementsList",
    "CustomersList",
    "AccountsList",
    "SalonsList",
    "EnquiryList",
    "PricingPlans",
    "SubscriptionsList",
  ],
  endpoints: () => ({}),
});

export const logOut = async () => {
  try {
    // Get tokens before clearing them
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("token");
      refreshToken = localStorage.getItem("refreshToken");
    }

    // Fallback to session if not in localStorage
    if (!accessToken || !refreshToken) {
      const session = await getSession();
      accessToken = accessToken || session?.user?.accessToken || null;
      refreshToken = refreshToken || session?.user?.refreshToken || null;
    }

    // Call logout API if tokens are available
    if (refreshToken && accessToken) {
      const formData = new FormData();
      formData.append("refresh_token", refreshToken);

      await fetch(`${process.env.NEXT_PUBLIC_APIBASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }).catch((error) => {
        // Log error but don't block logout
        console.error("Logout API call failed:", error);
      });
    }
  } catch (error) {
    console.error("Error during logout API call:", error);
  } finally {
    // Always clear local data regardless of API call success
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("activeAccountId");
      localStorage.removeItem("logout-event");
    }

    // Clear cookies
    clearNextAuthCookies();
    clearAllCookies();

    // Sign out from NextAuth
    await signOut({ callbackUrl: "/auth/login" });
  }
};

const clearNextAuthCookies = () => {
  if (typeof window === "undefined") return;

  const cookiesToRemove = [
    "next-auth.session-token",
    "next-auth.csrf-token",
    "next-auth.callback-url",
    "next-auth.pkce.code_verifier",
    "__Secure-next-auth.session-token",
    "__Secure-next-auth.csrf-token",
    "__Secure-next-auth.callback-url",
    "__Host-next-auth.csrf-token",
  ];

  cookiesToRemove.forEach((cookieName) => {
    // Clear for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    // Clear for secure flag variants
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`;

    // Clear for SameSite variants
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;`;
  });
};

export const clearAllCookies = () => {
  if (typeof window === "undefined") return;

  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`;
  });
};

export const logOutWithFullCleanup = async () => {
  await logOut();
};
