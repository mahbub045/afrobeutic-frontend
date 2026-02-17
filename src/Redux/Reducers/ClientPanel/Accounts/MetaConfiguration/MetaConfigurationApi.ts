import { baseApi } from "@/Redux/Api/BaseApi";

export const MetaConfigurationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    passMetaConfigInfo: build.mutation({
      query: ({ ...metaConfigInfo }) => ({
        url: `/accounts/meta-config`,
        method: "POST",
        body: metaConfigInfo,
      }),
      invalidatesTags: ["MetaConfigurationData"],
    }),
  }),
});
export const { usePassMetaConfigInfoMutation } = MetaConfigurationApi;
