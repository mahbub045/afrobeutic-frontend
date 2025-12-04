import { baseApi } from "@/Redux/Api/BaseApi";
import { AcceptInvitationPayloadProps } from "@/Types/ClientPanel/AcceptInvitationTypes/AcceptInvitationType";

export const AcceptInvitationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    acceptInvitation: builder.mutation({
      query: (userData: AcceptInvitationPayloadProps) => {
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
