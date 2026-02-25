import { baseApi } from "@/Redux/Api/BaseApi";

export const MetaConfigurationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMetaConfigInfo: build.query({
      query: () => ({
        url: `/accounts/meta-config`,
        method: "GET",
      }),
      providesTags: ["MetaConfigurationData"],
    }),
    passMetaConfigInfo: build.mutation({
      query: ({ ...metaConfigInfo }) => ({
        url: `/accounts/meta-config`,
        method: "POST",
        body: metaConfigInfo,
      }),
      invalidatesTags: ["MetaConfigurationData"],
    }),
    deleteMetaConfigInfo: build.mutation({
      query: () => ({
        url: `/accounts/meta-config`,
        method: "DELETE",
      }),
      invalidatesTags: ["MetaConfigurationData"],
    }),
  }),
});
export const {
  useGetMetaConfigInfoQuery,
  usePassMetaConfigInfoMutation,
  useDeleteMetaConfigInfoMutation,
} = MetaConfigurationApi;
