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
    registerManagement: build.mutation({
      query: (payload) => ({
        url: `/admin/managements-register`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ManagementsList"],
    }),
    deleteManagement: build.mutation({
      query: (managementUid) => ({
        url: `/admin/managements/${managementUid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ManagementsList"],
    }),
  }),
});

export const {
  useGetManagementsListQuery,
  useRegisterManagementMutation,
  useDeleteManagementMutation,
} = ManagementsListApi;
