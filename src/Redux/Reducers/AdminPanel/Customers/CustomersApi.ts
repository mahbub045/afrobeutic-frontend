import { baseApi } from "@/Redux/Api/BaseApi";

export const CustomersListApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomerList: build.query({
      query: (params) => ({
        url: `/admin/users`,
        method: "GET",
        params,
      }),
      providesTags: ["CustomersList"],
    }),
    getCustomerDetails: build.query({
      query: ({ customerUid }) => ({
        url: `/admin/users/${customerUid}`,
        method: "GET",
      }),
      providesTags: ["CustomersList"],
    }),
  }),
});

export const { useGetCustomerListQuery, useGetCustomerDetailsQuery } =
  CustomersListApi;
