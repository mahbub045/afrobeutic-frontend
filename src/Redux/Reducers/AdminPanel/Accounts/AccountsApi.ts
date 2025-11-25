import { baseApi } from "@/Redux/Api/BaseApi";

export const AccountsListApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAccountsList: build.query({
      query: (params) => ({
        url: `/admin/accounts`,
        method: "GET",
        params,
      }),
      providesTags: ["AccountsList"],
    }),
    getAccountDetails: build.query({
      query: (accountUid) => ({
        url: `/admin/accounts/${accountUid}`,
        method: "GET",
      }),
      providesTags: ["AccountsList"],
    }),
  }),
});

export const { useGetAccountsListQuery, useGetAccountDetailsQuery } =
  AccountsListApi;
