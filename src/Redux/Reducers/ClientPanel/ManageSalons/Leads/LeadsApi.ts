import { baseApi } from "@/Redux/Api/BaseApi";

export const LeadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeadsData: builder.query({
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
          url: `/salons/${salonUid}/leads`,
          method: "GET",
          // fetchBaseQuery will pick up `params` and serialize them into the URL
          params: {
            ...(page ? { page } : {}),
            ...(page_size ? { page_size } : {}),
            ...(search ? { search } : {}),
          },
        };
      },
      providesTags: ["Leads"],
    }),
    addLead: builder.mutation({
      query: ({ salonUid, leadsData }) => ({
        url: `/salons/${salonUid}/leads`,
        method: "POST",
        body: leadsData,
      }),
      invalidatesTags: ["Leads"],
    }),
    editLead: builder.mutation({
      query: ({ salonUid, leadsData, leadsUid }) => ({
        url: `/salons/${salonUid}/leads/${leadsUid}`,
        method: "PATCH",
        body: leadsData,
      }),
      invalidatesTags: ["Leads"],
    }),
  }),
});

export const { useGetLeadsDataQuery, useAddLeadMutation, useEditLeadMutation } =
  LeadsApi;
