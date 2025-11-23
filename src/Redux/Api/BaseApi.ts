import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_APIBASE_URL,
  // credentials: "include",
  prepareHeaders: async (headers) => {
    const session = await getSession();
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const token = storedToken || session?.user?.accessToken;

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

  // If we get a 401 (Unauthorized), try to refresh the token
  if (result.error && result.error.status === 401) {
    // Get the stored refresh token from localStorage or fall back to session
    let refreshToken: string | null = null;
    if (typeof window !== "undefined") {
      refreshToken = localStorage.getItem("refreshToken");
    }
    if (!refreshToken) {
      const session = await getSession();
      refreshToken = session?.user?.refreshToken ?? null;
    }

    // Try to get a new token using the refresh token
    if (!refreshToken) {
      return result;
    }

    const formData = new FormData();
    formData.append("refresh", refreshToken);

    const refreshResult = await baseQuery(
      {
        url: "/token/refresh",
        method: "POST",
        body: formData,
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Store the new token
      const newToken = (refreshResult.data as { access: string }).access;
      const newRefreshToken = (refreshResult.data as { refresh: string })
        .refresh;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      // Retry the original query with the new token
      result = await baseQuery(args, api, extraOptions);
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
