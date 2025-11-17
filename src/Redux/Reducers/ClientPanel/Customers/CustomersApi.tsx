import { baseApi } from "@/Redux/Api/BaseApi";

export const CustomersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      // Accept optional params (e.g. { page, search }) and forward them as query params
      query: (params) => ({
        url: `/customers`,
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Customers"],
    }),
    getCustomerById: builder.query({
      query: (customeruid: string) => ({
        url: `/customers/${customeruid}`,
        method: "GET",
      }),
      providesTags: ["Customers"],
    }),
  }),
});
export const { useGetCustomersQuery, useGetCustomerByIdQuery } = CustomersApi;
