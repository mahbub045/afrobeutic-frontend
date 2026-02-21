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
      query: ({ payload }) => ({
        url: `/consumers/profile`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["CustomerProfile"],
    }),


    getCustomerBookings: builder.query<
      import("@/Types/Customer/BookingTypes").CustomerBookingsResponse,
      Record<string, unknown> | void
    >({
      query: (params) => ({
        url: "/consumers/bookings",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["CustomerBookings"],
    }),

    getCustomerBookingDetails: builder.query({
      query: (bookingUid) => ({
        url: `/consumers/bookings/${bookingUid}`,
        method: "GET",
      }),
      providesTags: ["CustomerBookings"],
    }),
    deleteCustomerBooking: builder.mutation({
      query: (bookingUid) => ({
        url: `/consumers/bookings/${bookingUid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomerBookings"],
    }),
  }),
});

export const {
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
  useGetCustomerBookingsQuery,
  useGetCustomerBookingDetailsQuery,
  useDeleteCustomerBookingMutation,
} = customerApi;
