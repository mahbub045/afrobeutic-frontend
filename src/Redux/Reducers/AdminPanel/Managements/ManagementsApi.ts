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
    editManagement: build.mutation({
      // Accepts an object { managementUid, body } where `body` can be
      // a plain object (JSON) or a FormData instance for file upload.
      query: ({
        managementUid,
        body,
      }: {
        managementUid: string;
        body: unknown;
      }) => ({
        url: `/admin/managements/${managementUid}`,
        method: "PATCH",
        body,
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
  useEditManagementMutation,
  useDeleteManagementMutation,
} = ManagementsListApi;
