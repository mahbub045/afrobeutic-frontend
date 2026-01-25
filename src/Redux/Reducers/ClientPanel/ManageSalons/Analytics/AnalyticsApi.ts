import { baseApi } from "@/Redux/Api/BaseApi"

export const AnalyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRevenueAnalytics: build.query({
      query: ({salonUid, params}) => ({
        url: `/salons/${salonUid}/bookings`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonAnalytics"]
    }),
  }),
});

export const { useGetRevenueAnalyticsQuery } = AnalyticsApi;