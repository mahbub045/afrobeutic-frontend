import { baseApi } from "@/Redux/Api/BaseApi";

export const UserProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["UserProfile"],
    }),
  }),
});
export const { useGetUserProfileQuery } = UserProfileApi;
