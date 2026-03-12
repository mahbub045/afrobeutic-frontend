import { baseApi } from "@/Redux/Api/BaseApi";

export const PricingPlansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPricingPlans: builder.query({
      query: (params) => ({
        url: "/accounts/pricing-plans",
        method: "GET",
        params,
      }),
      providesTags: ["PricingPlans"],
    }),
    // validate subscription endpoint to check if user can subscribe to a plan before showing the subscribe dialog
    validateSubscription: builder.mutation({
      query: (payload) => ({
        url: `/accounts/subscription/validation`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});
export const { useGetPricingPlansQuery, useValidateSubscriptionMutation } =
  PricingPlansApi;
