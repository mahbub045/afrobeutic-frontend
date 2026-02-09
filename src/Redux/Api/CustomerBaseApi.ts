import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CUSTOMER_TOKEN_KEY = "customer_token";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_APIBASE_URL,
    prepareHeaders: async (headers) => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(CUSTOMER_TOKEN_KEY)
          : null;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["CustomerProfile", "CustomerBookings"],

  endpoints: (builder) => ({
    getCustomerProfile: builder.query({
      query: () => ({ url: "/consumers/profile", method: "GET" }),
      providesTags: ["CustomerProfile"],
    }),
    updateCustomerProfile: builder.mutation({
      query: (body) => ({ url: "/consumers/profile", method: "PUT", body }),
      invalidatesTags: ["CustomerProfile"],
    }),

    getCustomerBookings: builder.query({
      query: () => ({ url: "/consumers/bookings", method: "GET" }),
      providesTags: ["CustomerBookings"],
    }),

    getCustomerBooking: builder.query({
      query: (id) => ({ url: `/consumers/bookings/${id}`, method: "GET" }),
      providesTags: ["CustomerBookings"],
    }),
    cancelCustomerBooking: builder.mutation<void, string>({
      query: (id) => ({
        url: `/consumers/bookings/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["CustomerBookings"],
    }),
  }),
});

export const {
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
  useGetCustomerBookingsQuery,
  useGetCustomerBookingQuery,
  useCancelCustomerBookingMutation,
} = customerApi;
