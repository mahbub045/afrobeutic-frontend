import { baseApi } from "@/Redux/Api/BaseApi";

export const EnquiriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnquiries: builder.query({
      // Accept optional params (e.g. { page, search }) and forward them as query params
      query: (params) => ({
        url: `/support/customer-enquiries`,
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Enquiries"],
    }),
    addEnquiry: builder.mutation({
      query: (newTicket) => ({
        url: `/support/customer-enquiries`,
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: ["Enquiries"],
    }),
    getEnquiryDetails: builder.query({
      query: (uid: string) => ({
        url: `/support/customer-enquiries/${uid}`,
        method: "GET",
      }),
      providesTags: (uid) => [{ type: "Enquiries", id: uid }],
    }),
  }),
});
export const {
  useGetEnquiriesQuery,
  useAddEnquiryMutation,
  useGetEnquiryDetailsQuery,
} = EnquiriesApi;
