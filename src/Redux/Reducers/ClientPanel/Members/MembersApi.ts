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
    inviteMember: builder.mutation({
      query: (userData) => ({
        url: `/accounts/invite`,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Members"],
    }),
    editMember: builder.mutation({
      query: ({ uid, ...memberData }) => ({
        url: `/accounts/members/${uid}`,
        method: "PUT",
        body: memberData,
      }),
      invalidatesTags: ["Members"],
    }),
    deleteMember: builder.mutation({
      query: (uid) => ({
        url: `/accounts/members/${uid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Members"],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useInviteMemberMutation,
  useEditMemberMutation,
  useDeleteMemberMutation,
} = MembersApi;
