import { baseApi } from "@/Redux/Api/BaseApi";

export const UserProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfileData: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["UserProfile"],
    }),
    editProfile: builder.mutation({
      query: (profileData) => ({
        url: "/auth/me",
        method: "PATCH",
        body: profileData,
      }),
      invalidatesTags: ["UserProfile"],
    }),
  }),
});
export const { useGetProfileDataQuery, useEditProfileMutation } =
  UserProfileApi;
