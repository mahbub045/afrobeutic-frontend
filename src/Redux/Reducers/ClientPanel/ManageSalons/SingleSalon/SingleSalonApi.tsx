import { baseApi } from "@/Redux/Api/BaseApi";

export const SingleSalonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSingleSalonData: builder.query({
      query: ({ salonUid }) => {
        return {
          url: `/salons/${salonUid}`,
          method: "GET",
        };
      },
      providesTags: ["SingleSalon"],
    }),
    editSingleSalon: builder.mutation({
      query: ({ salonUid, salonData }) => ({
        url: `/salons/${salonUid}`,
        method: "PUT",
        body: salonData,
      }),
      invalidatesTags: ["SingleSalon"],
    }),
  }),
});

export const { useGetSingleSalonDataQuery, useEditSingleSalonMutation } =
  SingleSalonApi;
