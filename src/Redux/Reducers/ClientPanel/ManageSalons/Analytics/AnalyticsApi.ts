import { baseApi } from "@/Redux/Api/BaseApi";

export const AnalyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRevenueAnalytics: build.query({
      query: ({ salonUid, params }) => ({
        url: `/salons/${salonUid}/bookings`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonAnalytics"],
    }),
    downloadRevenueReport: build.mutation({
      query: ({ salonUid, bookingUid }) => ({
        url: `/salons/${salonUid}/bookings/${bookingUid}/receipt`,
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          return blob;
        },
      }),
      invalidatesTags: ["SalonAnalytics"],
    }),
    getServiceCategotyiesRevenue: build.query({
      query: ({ salonUid, params }) => ({
        url: `/salons/${salonUid}/analytics/service-categories`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonAnalytics"],
    }),
    getProductCategoriesRevenue: build.query({
      query: ({ salonUid, params }) => ({
        url: `/salons/${salonUid}/analytics/product-categories`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonAnalytics"],
    }),
    getServiceRevenue: build.query({
      query: ({ salonUid, params }) => ({
        url: `/salons/${salonUid}/analytics/service-revenue`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonAnalytics"],
    }),
    getProductRevenue: build.query({
      query: ({ salonUid, params }) => ({
        url: `/salons/${salonUid}/analytics/product-revenue`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonAnalytics"],
    }),
  }),
});

export const {
  useGetRevenueAnalyticsQuery,
  useDownloadRevenueReportMutation,
  useGetServiceCategotyiesRevenueQuery,
  useGetProductCategoriesRevenueQuery,
  useGetServiceRevenueQuery,
  useGetProductRevenueQuery,
} = AnalyticsApi;
