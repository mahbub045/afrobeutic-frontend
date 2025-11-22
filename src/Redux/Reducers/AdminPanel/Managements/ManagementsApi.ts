import { baseApi } from "@/Redux/Api/BaseApi";
import { register } from "module";

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
    registerManagement: build.mutation({
      query: (payload) => ({
        url: `/admin/managements-register`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ManagementsList"],
    }),
  }),
});

export const { useGetManagementsListQuery, useRegisterManagementMutation } = ManagementsListApi;