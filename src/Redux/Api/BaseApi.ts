import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession, signOut } from "next-auth/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_APIBASE_URL,
  // credentials: "include",
  prepareHeaders: async (headers) => {
    const session = await getSession();
    const token = session?.user?.accessToken;

    // Get active account from localStorage (persisted across reloads)
    const storedAccountId =
      typeof window !== "undefined"
        ? localStorage.getItem("activeAccountId")
        : null;

    // Priority: stored account > session account
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
    // Try to get a new token
    const session = await getSession();
    const refreshToken = session?.user?.refreshToken;

    if (refreshToken) {
      // Try to refresh the token
      const refreshResult = await fetch(
        `${process.env.NEXT_PUBLIC_APIBASE_URL}/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        },
      );

      if (refreshResult.ok) {
        const data = await refreshResult.json();
        if (data?.access) {
          // Token refreshed - retry the original query
          result = await baseQuery(args, api, extraOptions);
        }
      } else {
        // Refresh failed - sign out
        if (typeof window !== "undefined") {
          await signOut({ redirect: true, callbackUrl: "/auth/login" });
        }
      }
    } else {
      // No refresh token - sign out
      if (typeof window !== "undefined") {
        await signOut({ redirect: true, callbackUrl: "/auth/login" });
      }
    }
  }

  return result;
};
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    //Register tag types here
    "AcceptInvitation",
    //Clients Panel tag types
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

    //Admin Panel tag types
    "AccountsList",
    "ManagementsList",
    "UsersList",
  ],
  endpoints: () => ({}),
});
