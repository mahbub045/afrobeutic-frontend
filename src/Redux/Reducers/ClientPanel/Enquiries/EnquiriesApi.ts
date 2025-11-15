import { baseApi } from "@/Redux/Api/BaseApi";

export const EnquiriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnquiries: builder.query({
      query: (params) => ({
        url: `/support/customer-enquiries`,
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Enquiries"],
    }),
    createEnquiry: builder.mutation({
      query: (values) => ({
        url: `/support/customer-enquiries`,
        method: "POST",
        body: values,
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
    editEnquiry: builder.mutation({
      query: ({ enquiryuid, ...values }) => ({
        url: `/support/customer-enquiries/${enquiryuid}`,
        method: "PATCH",
        body: values,
      }),
      invalidatesTags: ["Enquiries"],
    }),
  }),
});
export const {
  useGetEnquiriesQuery,
  useCreateEnquiryMutation,
  useGetEnquiryDetailsQuery,
} = EnquiriesApi;
