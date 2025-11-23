import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession, signOut } from "next-auth/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_APIBASE_URL,
  prepareHeaders: async (headers) => {
    const session = await getSession();
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const token = storedToken || session?.user?.accessToken;

    const storedAccountId =
      typeof window !== "undefined"
        ? localStorage.getItem("activeAccountId")
        : null;

    const accountId = storedAccountId || session?.user?.account_id;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (accountId) {
      headers.set("X-ACCOUNT-ID", accountId);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    let refreshToken: string | null = null;
    if (typeof window !== "undefined") {
      refreshToken = localStorage.getItem("refreshToken");
    }
    if (!refreshToken) {
      const session = await getSession();
      refreshToken = session?.user?.refreshToken ?? null;
    }

    if (!refreshToken) {
      // No refresh token available, sign out
      // await signOut({ redirect: false });
      await logOut();
      return result;
    }

    try {
      const formData = new FormData();
      formData.append("refresh", refreshToken);

      const refreshResult = await baseQuery(
        {
          url: "/token/refresh", // Verify this endpoint matches your API
          method: "POST",
          body: formData,
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const newToken = (refreshResult.data as { access: string }).access;
        const newRefreshToken = (refreshResult.data as { refresh: string })
          .refresh;

        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", newToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
        }

        // Update the session to reflect new tokens
        const session = await getSession();
        if (session) {
          // This triggers a session update in NextAuth
          session.user.accessToken = newToken;
          if (newRefreshToken) {
            session.user.refreshToken = newRefreshToken;
          }
        }

        // Retry the original query with the new token
        result = await baseQuery(args, api, extraOptions);
      } else if (refreshResult.error) {
        // Refresh failed, sign out
        await signOut({ redirect: false });
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      await signOut({ redirect: false });
      return result;
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
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
    "LookBook",
    "Employees",
    "Leads",
    "Customers",
    "LeadsAndCustomers",
    "Enquiries",
    "SupportTickets",
    "AccountsList",
    "ManagementsList",
    "UsersList",
  ],
  endpoints: () => ({}),
});


export const logOut = async () => {

  //! TODO: Call log out Api here if needed
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("activeAccountId");
  localStorage.removeItem("logout-event");


  clearNextAuthCookies();
  clearAllCookies();


  // Sign out from NextAuth (this also clears session-related cookies)
  await signOut({ callbackUrl: "/auth/login" });
};




const clearNextAuthCookies = () => {
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

// Alternative: Use a more robust helper function
export const clearAllCookies = () => {
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`;
  });
};

export const logOutWithFullCleanup = async () => {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("activeAccountId");
  localStorage.removeItem("logout-event");

  // Option 1: Clear specific NextAuth cookies
  clearNextAuthCookies();

  // Option 2: Or clear all cookies (more aggressive)
  // clearAllCookies();

  // Sign out from NextAuth
  await signOut({ callbackUrl: "/auth/login" });
};