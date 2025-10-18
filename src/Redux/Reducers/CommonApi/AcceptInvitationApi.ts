import { baseApi } from "@/Redux/Api/BaseApi";

interface AcceptInvitationPayload {
  token: string;
  first_name: string;
  last_name: string;
  email: string;
  country?: string;
  password: string;
  confirm_password: string;
}

export const AcceptInvitationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    acceptInvitation: builder.mutation({
      query: (userData: AcceptInvitationPayload) => {
        const { token, ...body } = userData;
        return {
          url: `/auth/accept-invitation/${token}/`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["AcceptInvitation"],
    }),
  }),
});

export const { useAcceptInvitationMutation } = AcceptInvitationApi;
