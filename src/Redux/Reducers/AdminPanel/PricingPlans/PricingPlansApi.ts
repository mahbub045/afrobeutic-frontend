import { baseApi } from "@/Redux/Api/BaseApi";

export const PricingPlansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPricingPlans: builder.query({
      query: () => ({
        url: "/admin/pricing-plans",
        method: "GET",
      }),
      providesTags: ["PricingPlans"],
    }),
  }),
});

export const { useGetPricingPlansQuery } = PricingPlansApi;
