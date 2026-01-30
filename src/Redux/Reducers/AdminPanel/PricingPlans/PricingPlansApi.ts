import { baseApi } from "@/Redux/Api/BaseApi";

export const PricingPlansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPricingPlans: builder.query({
      query: (params) => ({
        url: "/admin/pricing-plans",
        method: "GET",
        params,
      }),
      providesTags: ["PricingPlans"],
    }),
    addPricingPlan: builder.mutation({
      query: ({ payload }) => ({
        url: "/admin/pricing-plans",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["PricingPlans"],
    }),
    updatePricingPlan: builder.mutation({
      query: ({ uid, payload }) => ({
        url: `/admin/pricing-plans/${uid}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["PricingPlans"],
    }),
    deletePricingPlan: builder.mutation({
      query: ({ uid }) => ({
        url: `/admin/pricing-plans/${uid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PricingPlans"],
    }),
  }),
});

export const {
  useGetPricingPlansQuery,
  useAddPricingPlanMutation,
  useUpdatePricingPlanMutation,
  useDeletePricingPlanMutation,
} = PricingPlansApi;
