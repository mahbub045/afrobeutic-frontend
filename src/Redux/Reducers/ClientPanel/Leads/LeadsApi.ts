import { baseApi } from "@/Redux/Api/BaseApi";

export const LeadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeadsData: builder.query({
      query: ({
        page,
        page_size,
        search,
        created_at__gte,
        created_at__lte,
        source,
        ordering,
      }: {
        page?: number;
        page_size?: number;
        search?: string;
        created_at__gte?: string;
        created_at__lte?: string;
        source?: string;
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
        if (source && source.trim()) params.source = source;
        if (ordering && ordering.trim()) params.ordering = ordering;

        return {
          url: `/leads`,
          method: "GET",
          params,
        };
      },
      providesTags: ["Leads"],
    }),
    addLead: builder.mutation({
      query: ({ leadsData }) => ({
        url: `/leads`,
        method: "POST",
        body: leadsData,
      }),
      invalidatesTags: ["Leads"],
    }),
    editLead: builder.mutation({
      query: ({ leadsData, leadsUid }) => ({
        url: `/leads/${leadsUid}`,
        method: "PATCH",
        body: leadsData,
      }),
      invalidatesTags: ["Leads"],
    }),
  }),
});

export const { useGetLeadsDataQuery, useAddLeadMutation, useEditLeadMutation } =
  LeadsApi;
