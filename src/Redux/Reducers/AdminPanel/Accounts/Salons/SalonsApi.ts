import { baseApi } from "@/Redux/Api/BaseApi";

export const SalonsListApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSalonList: build.query({
      query: ({ params, accountUid }) => ({
        url: `/admin/accounts/${accountUid}/salons`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonsList"],
    }),
    getSalonDetails: build.query({
      query: ({ accountUid, salonUid }) => ({
        url: `/admin/accounts/${accountUid}/salons/${salonUid}`,
        method: "GET",
      }),
      providesTags: ["SalonsList"],
    }),
  }),
});

export const { useGetSalonListQuery, useGetSalonDetailsQuery } = SalonsListApi;
