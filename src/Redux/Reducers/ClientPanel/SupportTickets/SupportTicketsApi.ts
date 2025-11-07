import { baseApi } from "@/Redux/Api/BaseApi";

export const SupportTicketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportTickets: builder.query({
      // Accept optional params (e.g. { page, search }) and forward them as query params
      query: (params) => ({
        url: `/support-tickets`,
        method: "GET",
        params: params || {},
      }),
      providesTags: ["SupportTickets"],
    }),
    addSupportTicket: builder.mutation({
      query: (newTicket) => ({
        url: `/support-tickets`,
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: ["SupportTickets"],
    }),
  }),
});
export const { useGetSupportTicketsQuery, useAddSupportTicketMutation } =
  SupportTicketsApi;
