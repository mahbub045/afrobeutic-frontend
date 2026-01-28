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
  }),
});

export const { useGetSubscriptionsQuery } = SubscriptionsApi;
