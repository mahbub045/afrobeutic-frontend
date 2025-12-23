import { baseApi } from "@/Redux/Api/BaseApi";

type ViewReceiptArgs = {
  salonUid: string;
  bookingUid: string;
};

type ViewReceiptResponse = {
  url: string;
  fileName?: string;
};

export const ViewReceiptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    viewReceipt: builder.mutation<ViewReceiptResponse, ViewReceiptArgs>({
      query: ({ salonUid, bookingUid }) => {
        return {
          url: `/salons/${salonUid}/bookings/${bookingUid}/receipt`,
          method: "GET",
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

            // Create a serializable object URL for use in the UI
            if (typeof window === "undefined") {
              return { url: "", fileName } as ViewReceiptResponse;
            }

            const url = window.URL.createObjectURL(blob);

            return { url, fileName } as ViewReceiptResponse;
          },
        };
      },
      invalidatesTags: ["Receipt"],
    }),
  }),
});
export const { useViewReceiptMutation } = ViewReceiptApi;
