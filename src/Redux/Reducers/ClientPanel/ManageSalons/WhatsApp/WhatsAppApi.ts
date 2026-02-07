import { baseApi } from "@/Redux/Api/BaseApi";

export const WhatsAppApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    passWABAInfo: build.mutation({
      query: ({ salonUid, ...wabaInfo }) => ({
        url: `/salons/${salonUid}/whatsapp-onboard`,
        method: "POST",
        body: wabaInfo,
      }),
      invalidatesTags: ["SalonData"],
    }),
  }),
});

export const { usePassWABAInfoMutation } = WhatsAppApi;
