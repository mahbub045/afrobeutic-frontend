import { baseApi } from "@/Redux/Api/BaseApi";

export const ViewReceiptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    viewReceipt: builder.mutation({
      query: ({ salonUid, bookingUid }) => {
        return {
          url: `/salons/${salonUid}/bookings/${bookingUid}/receipt`,
          method: "GET",
        };
      },
      invalidatesTags: ["Receipt"],
    }),
  }),
});
export const { useViewReceiptMutation } = ViewReceiptApi;
