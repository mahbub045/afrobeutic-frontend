import { baseApi } from "@/Redux/Api/BaseApi";

export const adminOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverviewStats: builder.query({
      query: (params) => ({
        url: "/admin/dashboard",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: ["AdminOverviewStats"],
    }),
  }),
});
export const { useGetAdminOverviewStatsQuery } = adminOverviewApi;
