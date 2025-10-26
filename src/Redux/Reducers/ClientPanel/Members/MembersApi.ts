import { baseApi } from "@/Redux/Api/BaseApi";
import {
  MembersQueryParams,
  MembersResponse,
} from "@/Types/ClientPanel/ManageSalonTypes/MemberTypes/MemberType";

export const MembersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query<MembersResponse, MembersQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params?.page) {
          queryParams.append("page", params.page.toString());
        }

        if (params?.search) {
          queryParams.append("search", params.search);
        }

        const queryString = queryParams.toString();
        return {
          url: `/accounts/members${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
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
