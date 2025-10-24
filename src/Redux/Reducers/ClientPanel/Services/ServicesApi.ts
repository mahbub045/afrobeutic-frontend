import { baseApi } from "@/Redux/Api/BaseApi";

export const ServicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicesData: builder.query({
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
          url: `/salons/${salonUid}/services`,
          method: "GET",
          // fetchBaseQuery will pick up `params` and serialize them into the URL
          params: {
            ...(page ? { page } : {}),
            ...(page_size ? { page_size } : {}),
            ...(search ? { search } : {}),
          },
        };
      },
      providesTags: ["Services"],
    }),
    addServices: builder.mutation({
      query: ({ salonUid, serviceData }) => ({
        url: `/salons/${salonUid}/services`,
        method: "POST",
        body: serviceData,
      }),
      invalidatesTags: ["Services"],
    }),
    editServices: builder.mutation({
      query: ({ salonUid, serviceData }) => ({
        url: `/salons/${salonUid}/services`,
        method: "PATCH",
        body: serviceData,
      }),
      invalidatesTags: ["Services"],
    }),
  }),
});

export const {
  useGetServicesDataQuery,
  useAddServicesMutation,
  useEditServicesMutation,
} = ServicesApi;
