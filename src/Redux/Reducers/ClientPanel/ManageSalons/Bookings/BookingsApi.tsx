import { baseApi } from "@/Redux/Api/BaseApi";

export const BookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooking: builder.query({
      query: ({ salonUid }) => {
        return {
          url: `/salons/${salonUid}/booking-calendar`,
          method: "GET",
        };
      },
      providesTags: ["Bookings"],
    }),
    getSingleBooking: builder.query({
      query: ({ salonUid, bookingUid }) => {
        return {
          url: `/salons/${salonUid}/booking-calendar/${bookingUid}`,
          method: "GET",
        };
      },
      providesTags: ["Bookings"],
    }),
    editBooking: builder.mutation({
      query: ({ salonUid, bookingUid, data }) => {
        return {
          url: `/salons/${salonUid}/booking-calendar/${bookingUid}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["Bookings"],
    }),
  }),
});

export const {
  useGetBookingQuery,
  useGetSingleBookingQuery,
  useEditBookingMutation,
} = BookingsApi;
