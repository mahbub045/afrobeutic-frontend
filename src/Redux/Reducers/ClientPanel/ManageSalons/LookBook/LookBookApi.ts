import { baseApi } from "@/Redux/Api/BaseApi";

export const LookBookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLookBookData: builder.query({
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
          url: `/salons/${salonUid}/lookbook`,
          method: "GET",
          params: {
            ...(page ? { page } : {}),
            ...(page_size ? { page_size } : {}),
            ...(search ? { search } : {}),
          },
        };
      },
      providesTags: ["LookBook"],
    }),
    addLookBook: builder.mutation({
      query: ({ salonUid, lookBookData }) => ({
        url: `/salons/${salonUid}/lookbook`,
        method: "POST",
        body: lookBookData,
      }),
      invalidatesTags: ["LookBook"],
    }),
    lookBookDetails: builder.query({
      query: ({ salonUid, lookBookUid }) => ({
        url: `/salons/${salonUid}/lookbook/${lookBookUid}`,
        method: "GET",
      }),
      providesTags: ["LookBook"],
    }),
    editLookBook: builder.mutation({
      query: ({ salonUid, lookBookData, lookBookUid }) => ({
        url: `/salons/${salonUid}/lookbook/${lookBookUid}`,
        method: "PATCH",
        body: lookBookData,
      }),
      invalidatesTags: ["LookBook"],
    }),
  }),
});

export const {
  useGetLookBookDataQuery,
  useAddLookBookMutation,
  useLookBookDetailsQuery,
  useEditLookBookMutation,
} = LookBookApi;
