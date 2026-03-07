import { baseApi } from "@/Redux/Api/BaseApi";

export const WhatsAppApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWhatsAppOnboardData: build.query({
      query: ({ salonUid }) => ({
        url: `/salons/${salonUid}/whatsapp`,
        method: "GET",
      }),
      providesTags: ["WhatsAppOnBoardData"],
    }),
    getWhatsAppConfig: build.query({
      query: ({ salonUid }) => ({
        url: `/salons/${salonUid}/whatsapp-config`,
        method: "GET",
      }),
    }),
    whatsAppOnboard: build.mutation({
      query: ({ salonUid, ...wabaInfo }) => ({
        url: `/salons/${salonUid}/whatsapp`,
        method: "POST",
        body: wabaInfo,
      }),
      invalidatesTags: ["WhatsAppOnBoardData"],
    }),
    deleteWhatsAppOnboard: build.mutation({
      query: (salonUid) => ({
        url: `/salons/${salonUid}/whatsapp`,
        method: "DELETE",
      }),
      invalidatesTags: ["WhatsAppOnBoardData"],
    }),
    // /webhooks/whatsapp-status
    whatsAppWebhook: build.query({
      query: () => ({
        url: `/webhooks/whatsapp-status`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetWhatsAppOnboardDataQuery,
  useGetWhatsAppConfigQuery,
  useWhatsAppOnboardMutation,
  useDeleteWhatsAppOnboardMutation,
  useWhatsAppWebhookQuery,
} = WhatsAppApi;
