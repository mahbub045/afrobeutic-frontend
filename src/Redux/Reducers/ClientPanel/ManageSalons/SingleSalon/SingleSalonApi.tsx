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
        method: "PATCH",
        body: salonData,
      }),
      invalidatesTags: ["SingleSalon"],
    }),
    deleteSingleSalon: builder.mutation({
      query: ({ salonUid }) => ({
        url: `/salons/${salonUid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SingleSalon"],
    }),
  }),
});

export const {
  useGetSingleSalonDataQuery,
  useEditSingleSalonMutation,
  useDeleteSingleSalonMutation,
} = SingleSalonApi;
