import { baseApi } from "@/Redux/Api/BaseApi";

export const BillingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingInfo: builder.query({
      query: () => ({
        url: "/accounts/subscription",
        method: "GET",
      }),
      providesTags: ["BillingInfo"],
    }),
  }),
});
export const { useGetBillingInfoQuery } = BillingApi;
