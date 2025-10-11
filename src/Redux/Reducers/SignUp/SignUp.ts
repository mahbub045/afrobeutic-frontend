import { baseApi } from "@/Redux/Api/BaseApi";

export const SignUpApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: `/auth/register`,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["SignUp"],
    }),
  }),
});

export const { useRegisterUserMutation } = SignUpApi;
