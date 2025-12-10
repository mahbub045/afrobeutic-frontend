import { baseApi } from "@/Redux/Api/BaseApi";

export const SalonOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalonOverviewData: builder.query({
      query: ({ salonUid }) => ({
        url: `/salons/${salonUid}/dashboard`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});
export const { useGetSalonOverviewDataQuery } = SalonOverviewApi;
