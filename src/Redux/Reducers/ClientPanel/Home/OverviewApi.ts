import { baseApi } from "@/Redux/Api/BaseApi";
import type {
  OverviewStatsQueryParams,
  OverviewStatsResponse,
} from "@/Types/ClientPanel/Home/OverviewTypes";

export const overviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverviewStats: builder.query<
      OverviewStatsResponse,
      OverviewStatsQueryParams | undefined
    >({
      query: (params) => ({
        url: "/accounts/dashboard",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: ["OverviewStats"],
    }),
  }),
});
export const { useGetOverviewStatsQuery } = overviewApi;
