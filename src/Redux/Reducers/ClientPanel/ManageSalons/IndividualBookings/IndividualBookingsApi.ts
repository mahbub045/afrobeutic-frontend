import { baseApi } from "@/Redux/Api/BaseApi";

export const IndividualBookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIndividualBookings: builder.query({
      query: ({ params, salonUid }) => ({
        url: `/salon/${salonUid}/bookings`,
        method: "GET",
        params,
      }),
      providesTags: ["IndividualBookings"],
    }),
    updateIndividualBookingStatus: builder.mutation({
      query: ({ salonUid, bookingUid, data }) => ({
        url: `/salon/${salonUid}/bookings/${bookingUid}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["IndividualBookings"],
    }),
  }),
});

export const {
  useGetIndividualBookingsQuery,
  useUpdateIndividualBookingStatusMutation,
} = IndividualBookingsApi;
