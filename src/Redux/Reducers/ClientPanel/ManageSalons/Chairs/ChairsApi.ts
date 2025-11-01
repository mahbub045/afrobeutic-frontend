import { baseApi } from "@/Redux/Api/BaseApi";

export const ChairsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChairsData: builder.query({
      // Accepts { salonUid, page?, page_size?, search? } and forwards them as query params
      query: ({
        salonUid,
        page,
        page_size,
        search,
      }: {
        salonUid: string;
        page?: number;
        page_size?: number;
        search?: string;
      }) => {
        return {
          url: `/salons/${salonUid}/chairs`,
          method: "GET",
          params: {
            ...(page ? { page } : {}),
            ...(page_size ? { page_size } : {}),
            ...(search ? { search } : {}),
          },
        };
      },
      providesTags: ["Chairs"],
    }),
    addChair: builder.mutation({
      query: ({ salonUid, chairData }) => ({
        url: `/salons/${salonUid}/chairs`,
        method: "POST",
        body: chairData,
      }),
      invalidatesTags: ["Chairs"],
    }),
    editChair: builder.mutation({
      query: ({ salonUid, chairData, chairUid }) => ({
        url: `/salons/${salonUid}/chairs/${chairUid}`,
        method: "PATCH",
        body: chairData,
      }),
      invalidatesTags: ["Chairs"],
    }),
    deleteChair: builder.mutation({
      query: ({ salonUid, chairUid }) => ({
        url: `/salons/${salonUid}/chairs/${chairUid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chairs"],
    }),
  }),
});

export const {
  useGetChairsDataQuery,
  useAddChairMutation,
  useEditChairMutation,
  useDeleteChairMutation,
} = ChairsApi;
