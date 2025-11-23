import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

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
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQuery,
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
