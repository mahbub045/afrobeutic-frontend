import { baseApi } from "@/Redux/Api/BaseApi";

export const ChairsBookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChairsBookingData: builder.query({
      // Accepts { salonUid, chairUid?, page?, page_size?, search? } and forwards them as query params
      query: ({
        salonUid,
        chairUid,
        page,
        page_size,
        search,
      }: {
        salonUid: string;
        chairUid?: string;
        page?: number;
        page_size?: number;
        search?: string;
      }) => {
        // If chairUid is provided, fetch bookings for specific chair
        const url = chairUid
          ? `/salons/${salonUid}/chairs/${chairUid}/bookings`
          : `/salons/${salonUid}/chairs/bookings`;

        return {
          url,
          method: "GET",
          params: {
            ...(page ? { page } : {}),
            ...(page_size ? { page_size } : {}),
            ...(search ? { search } : {}),
          },
        };
      },
      providesTags: ["ChairsBooking", "Bookings"],
    }),
    addChairBooking: builder.mutation({
      query: ({ salonUid, chairUid, chairBookingData }) => ({
        url: `/salons/${salonUid}/chairs/${chairUid}/bookings`,
        method: "POST",
        body: chairBookingData,
      }),
      invalidatesTags: ["ChairsBooking","Bookings"],
    }),
    editChairBooking: builder.mutation({
      query: ({ salonUid, chairUid, bookingUid, chairBookingData }) => ({
        url: `/salons/${salonUid}/chairs/${chairUid}/bookings/${bookingUid}`,
        method: "PATCH",
        body: chairBookingData,
      }),
      invalidatesTags: ["ChairsBooking"],
    }),
  }),
});

export const {
  useGetChairsBookingDataQuery,
  useAddChairBookingMutation,
  useEditChairBookingMutation,
} = ChairsBookingApi;
