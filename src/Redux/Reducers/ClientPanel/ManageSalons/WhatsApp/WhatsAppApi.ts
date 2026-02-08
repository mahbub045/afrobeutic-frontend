import { baseApi } from "@/Redux/Api/BaseApi";

export const WhatsAppApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
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

export const { useWhatsAppOnboardMutation } = WhatsAppApi;
