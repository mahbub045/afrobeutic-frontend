import { baseApi } from "@/Redux/Api/BaseApi";

export const PricingPlansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPricingPlans: builder.query({
      query: (params) => ({
        url: "/client/pricing-plans",
        method: "GET",
        params,
      }),
      providesTags: ["PricingPlans"],
    }),
  }),
});
export const { useGetPricingPlansQuery } = PricingPlansApi;
