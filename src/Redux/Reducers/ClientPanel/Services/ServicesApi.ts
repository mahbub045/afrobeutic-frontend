import { baseApi } from "@/Redux/Api/BaseApi";

export const ServicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicesData: builder.query({
      query: ({ salonUid }) => {
        return {
          url: `/salons/${salonUid}/services`,
          method: "GET",
        };
      },
      providesTags: ["Services"],
    }),
    editServices: builder.mutation({
      query: ({ salonUid, salonData }) => ({
        url: `/salons/${salonUid}/services`,
        method: "PATCH",
        body: salonData,
      }),
      invalidatesTags: ["Services"],
    }),
  }),
});

export const { useGetServicesDataQuery, useEditServicesMutation } =
  ServicesApi;