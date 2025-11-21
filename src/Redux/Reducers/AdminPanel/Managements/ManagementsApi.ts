import { baseApi } from "@/Redux/Api/BaseApi";

export const ManagementsListApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getManagementsList: build.query({
      query: () => ({
        url: `/admin/managements`,
        method: "GET",
      }),
      providesTags: ["ManagementsList"],
    }),
  }),
});

export const { useGetManagementsListQuery } = ManagementsListApi;
