import { baseApi } from "@/Redux/Api/BaseApi";

export const ManagementsListApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getManagementsList: build.query({
      query: (params) => ({
        url: `/admin/managements`,
        method: "GET",
        params,
      }),
      providesTags: ["ManagementsList"],
    }),
  }),
});

export const { useGetManagementsListQuery } = ManagementsListApi;
