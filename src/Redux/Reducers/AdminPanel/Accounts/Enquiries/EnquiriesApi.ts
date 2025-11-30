import { baseApi } from "@/Redux/Api/BaseApi";

export const EnquiryListApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEnquiryList: build.query({
      query: ({ params, accountUid }) => ({
        url: `/admin/accounts/${accountUid}/enquiries`,
        method: "GET",
        params,
      }),
      providesTags: ["EnquiryList"],
    }),
    getEnquiryDetails: build.query({
      query: ({ accountUid, enquiryUid }) => ({
        url: `/admin/accounts/${accountUid}/enquiries/${enquiryUid}`,
        method: "GET",
      }),
      providesTags: ["EnquiryList"],
    }),
  }),
});

export const { useGetEnquiryListQuery, useGetEnquiryDetailsQuery } =
  EnquiryListApi;
