import { baseApi } from "@/Redux/Api/BaseApi";

export const IndividualBookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIndividualBookings: builder.query({
      query: ({ params, salonUid }) => ({
        url: `/salons/${salonUid}/bookings`,
        method: "GET",
        params,
      }),
      providesTags: ["IndividualBookings"],
    }),
    updateIndividualBookingStatus: builder.mutation({
      query: ({ salonUid, bookingUid, data }) => ({
        url: `/salons/${salonUid}/bookings/${bookingUid}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["IndividualBookings", "SalonAnalytics"],
    }),
  }),
});

export const {
  useGetIndividualBookingsQuery,
  useUpdateIndividualBookingStatusMutation,
} = IndividualBookingsApi;
