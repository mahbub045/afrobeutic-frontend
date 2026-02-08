import { baseApi } from "@/Redux/Api/BaseApi";

export const WhatsAppApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWhatsAppOnboardData: build.query({
      query: (salonUid) => ({
        url: `/salons/${salonUid}/whatsapp`,
        method: "GET",
      }),
      providesTags: ["WhatsAppOnBoardData"],
    }),
    whatsAppOnboard: build.mutation({
      query: ({ salonUid, ...wabaInfo }) => ({
        url: `/salons/${salonUid}/whatsapp`,
        method: "POST",
        body: wabaInfo,
      }),
      invalidatesTags: ["WhatsAppOnBoardData"],
    }),
  }),
});

export const { useGetWhatsAppOnboardDataQuery, useWhatsAppOnboardMutation } =
  WhatsAppApi;
