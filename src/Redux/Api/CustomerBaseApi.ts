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

    getCustomerBookingDetails: builder.query<
      import("@/Types/Customer/BookingTypes").CustomerBookingDetail,
      string
    >({
      query: (bookingUid) => ({
        url: `/consumers/bookings/${bookingUid}`,
        method: "GET",
      }),
      providesTags: ["CustomerBookings"],
    }),
    downloadReceipt: builder.mutation<
      { url: string; fileName?: string },
      string
    >({
      query: (bookingUid) => ({
        url: `/consumers/bookings/${bookingUid}/receipt`,
        method: "GET",
        /* customer side expects binary PDF/stream; convert to object URL for download */
        responseHandler: async (response) => {
          const blob = await response.blob();
          const disposition = response.headers.get("Content-Disposition");
          let fileName: string | undefined;

          if (disposition) {
            const match = /filename="?([^";]+)"?/i.exec(disposition);
            if (match?.[1]) {
              fileName = match[1];
            }
          }

          if (typeof window === "undefined") {
            return { url: "", fileName } as { url: string; fileName?: string };
          }

          const url = window.URL.createObjectURL(blob);
          return { url, fileName } as { url: string; fileName?: string };
        },
      }),
      invalidatesTags: ["CustomerProfile"],
    }),
  }),
});

export const {
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
  useGetCustomerBookingsQuery,
  useGetCustomerBookingDetailsQuery,
  useDownloadReceiptMutation,
} = customerApi;
