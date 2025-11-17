import { baseApi } from "@/Redux/Api/BaseApi";

export const SupportTicketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportTickets: builder.query({
      // Accept optional params (e.g. { page, search }) and forward them as query params
      query: (params) => ({
        url: `/support/account-enquiries`,
        method: "GET",
        params: params || {},
      }),
      providesTags: ["SupportTickets"],
    }),
    addSupportTicket: builder.mutation({
      query: (newTicket) => ({
        url: `/support/account-enquiries`,
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: ["SupportTickets"],
    }),
    getSupportTicket: builder.query({
      query: (uid: string) => ({
        url: `/support/account-enquiries/${uid}`,
        method: "GET",
      }),
      providesTags: (uid) => [{ type: "SupportTickets", id: uid }],
    }),
  }),
});
export const {
  useGetSupportTicketsQuery,
  useAddSupportTicketMutation,
  useGetSupportTicketQuery,
} = SupportTicketsApi;
