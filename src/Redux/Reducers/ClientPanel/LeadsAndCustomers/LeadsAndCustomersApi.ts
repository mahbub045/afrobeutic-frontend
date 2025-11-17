import { baseApi } from "@/Redux/Api/BaseApi";

export const LeadsAndCustomersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeadsAndCustomers: builder.query({
      query: (params) => ({
        url: `/lead-customer`,
        method: "GET",
        params: params || {},
      }),
      providesTags: ["LeadsAndCustomers"],
    }),
  }),
});
export const { useGetLeadsAndCustomersQuery } = LeadsAndCustomersApi;
