import { baseApi } from "@/Redux/Api/BaseApi";

export const UsersListApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUserList: build.query({
      query: (params) => ({
        url: `/admin/users`,
        method: "GET",
        params,
      }),
      providesTags: ["UsersList"],
    }),
    getUserDetails: build.query({
      query: ({userUid}) => ({
        url: `/admin/users/${userUid}`,
        method: "GET",
      }),
      providesTags: ["UsersList"],
    }),
  }),
});

export const { useGetUserListQuery, useGetUserDetailsQuery } = UsersListApi;
