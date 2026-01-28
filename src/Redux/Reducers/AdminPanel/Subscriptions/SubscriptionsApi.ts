import { baseApi } from "@/Redux/Api/BaseApi";

export const SubscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query({
      query: (params) => ({
        url: `/admin/subscriptions`,
        method: "GET",
        params,
      }),
      providesTags: ["SubscriptionsList"],
    }),
    // Additional endpoints can be defined here
    getSubscriptionDetails: builder.query({
      query: ({ subscriptionUid }) => ({
        url: `/admin/subscriptions/${subscriptionUid}`,
        method: "GET",
      }),
      providesTags: ["SubscriptionsList"],
    }),
  }),
});

export const { useGetSubscriptionsQuery, useGetSubscriptionDetailsQuery } =
  SubscriptionsApi;
