import { baseApi } from "@/Redux/Api/BaseApi";

export const LeadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeadsData: builder.query({
      // Accepts { salonUid, page?, page_size?, search?, created_at__gte?, created_at__lte?, ordering? }
      // and forwards them as query params
      query: ({
        salonUid,
        page,
        page_size,
        search,
        created_at__gte,
        created_at__lte,
        ordering,
      }: {
        salonUid: string;
        page?: number;
        page_size?: number;
        search?: string;
        created_at__gte?: string;
        created_at__lte?: string;
        ordering?: string;
      }) => {
        const params: Record<string, string | number> = {};
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;
        if (search && search.trim()) params.search = search;
        if (created_at__gte && created_at__gte.trim())
          params.created_at__gte = created_at__gte;
        if (created_at__lte && created_at__lte.trim())
          params.created_at__lte = created_at__lte;
        if (ordering && ordering.trim()) params.ordering = ordering;

        return {
          url: `/salons/${salonUid}/leads`,
          method: "GET",
          params,
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
