import { baseApi } from "@/Redux/Api/BaseApi";

export const AccountsListApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAccountsList: build.query({
      query: () => ({
        url: `/admin/accounts`,
        method: "GET",
      }),
      providesTags: ["AccountsList"],
    }),
  }),
});

export const { useGetAccountsListQuery } = AccountsListApi;
