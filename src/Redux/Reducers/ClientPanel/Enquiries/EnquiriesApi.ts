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
    createEnquiry: builder.mutation({
      query: (payload) => ({
        url: `/support/customer-enquiries`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Enquiries"],
    }),
    getEnquiryDetails: builder.query({
      query: (enquiryuid) => ({
        url: `/support/customer-enquiries/${enquiryuid}`,
        method: "GET",
      }),
      providesTags: ["Enquiries"],
    }),
  }),
});
export const {
  useGetEnquiriesQuery,
  useCreateEnquiryMutation,
  useGetEnquiryDetailsQuery,
} = EnquiriesApi;
