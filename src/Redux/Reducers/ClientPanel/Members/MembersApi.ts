import { baseApi } from "@/Redux/Api/BaseApi";

export const MembersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query({
      query: () => ({
        url: `/accounts/members`,
        method: "GET",
      }),
      providesTags: ["Members"],
    }),
    inviteUser: builder.mutation({
      query: (userData) => ({
        url: `/accounts/invite`,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Members"],
    }),
  }),
});

export const { useGetMembersQuery, useInviteUserMutation } = MembersApi;
