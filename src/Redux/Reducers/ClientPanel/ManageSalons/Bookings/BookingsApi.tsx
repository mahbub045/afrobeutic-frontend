import { baseApi } from "@/Redux/Api/BaseApi";

export const BookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooking: builder.query({
      query: ({ salonUid }) => {
        return {
          url: `/salons/${salonUid}/bookings`,
          method: "GET",
        };
      },
      providesTags: ["Bookings"],
    }),
    editBooking: builder.mutation({
      query: ({ salonUid, bookingUid, data }) => {
        return {
          url: `/salons/${salonUid}/bookings/${bookingUid}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["Bookings"],
    }),
  }),
});

export const { useGetBookingQuery, useEditBookingMutation } = BookingsApi;
