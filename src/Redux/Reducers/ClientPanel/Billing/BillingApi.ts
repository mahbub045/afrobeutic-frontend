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

    createOrUpdateSubscription: builder.mutation<
      unknown,
      { pricing_plan: string; payment_method_id: string }
    >({
      query: ({ pricing_plan, payment_method_id }) => {
        const formData = new FormData();
        formData.append("pricing_plan", pricing_plan);
        formData.append("payment_method_id", payment_method_id);

        return {
          url: "/accounts/subscription",
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: ["BillingInfo"],
    }),

    // New: update auto-renew for the current subscription. Backend accepts
    // a PATCH to the same endpoint with `auto_renew` field.
    updateSubscriptionAutoRenew: builder.mutation<
      unknown,
      { auto_renew: boolean }
    >({
      query: ({ auto_renew }) => {
        const formData = new FormData();
        formData.append("auto_renew", String(auto_renew));

        return {
          url: "/accounts/subscription",
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: ["BillingInfo"],
    }),
  }),
});
export const {
  useGetBillingInfoQuery,
  useCreateOrUpdateSubscriptionMutation,
  useUpdateSubscriptionAutoRenewMutation,
} = BillingApi;
