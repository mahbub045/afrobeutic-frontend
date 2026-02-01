import { baseApi } from "@/Redux/Api/BaseApi";
import {
  Booking,
  BookingsResponse,
} from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";

// Generic filter map for query params
export type BookingFilters = Record<
  string,
  string | number | boolean | undefined
>;
export type GetBookingArgs = {
  salonUid: string;
  filters?: BookingFilters;
};
export type GetSingleBookingArgs = {
  salonUid: string;
  bookingUid: string;
  filters?: BookingFilters;
};

export const BookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooking: builder.query<BookingsResponse, GetBookingArgs>({
      query: (args: GetBookingArgs) => {
        const { salonUid, filters } = args;
        const params = filters;
        return {
          url: `/salons/${salonUid}/booking-calendar`,
          method: "GET",
          params,
        };
      },
      providesTags: ["Bookings"],
    }),
    getSingleBooking: builder.query<Booking, GetSingleBookingArgs>({
      query: (args: GetSingleBookingArgs) => {
        const { salonUid, bookingUid, filters } = args;
        const params = filters;
        return {
          url: `/salons/${salonUid}/booking-calendar/${bookingUid}`,
          method: "GET",
          params,
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
      invalidatesTags: ["Bookings", "ChairsBooking", "SalonAnalytics"],
    }),
  }),
});

export const {
  useGetBookingQuery,
  useGetSingleBookingQuery,
  useEditBookingMutation,
} = BookingsApi;
