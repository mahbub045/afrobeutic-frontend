import { baseApi } from "@/Redux/Api/BaseApi";

export const ServicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicesData: builder.query({
      // Accepts { salonUid, page?, page_size?, search?, ordering? } and forwards them as query params
      query: ({
        salonUid,
        page,
        page_size,
        search,
        ordering,
      }: {
        salonUid: string;
        page?: number;
        page_size?: number;
        search?: string;
        ordering?: string; // expected values: 'price' | '-price'
      }) => {
        return {
          url: `/salons/${salonUid}/services`,
          method: "GET",
          // fetchBaseQuery will pick up `params` and serialize them into the URL
          params: {
            ...(page ? { page } : {}),
            ...(page_size ? { page_size } : {}),
            ...(search ? { search } : {}),
            ...(ordering ? { ordering } : {}),
          },
        };
      },
      providesTags: ["Services"],
    }),
    addService: builder.mutation({
      query: ({ salonUid, serviceData }) => ({
        url: `/salons/${salonUid}/services`,
        method: "POST",
        body: serviceData,
      }),
      invalidatesTags: ["Services"],
    }),
    editService: builder.mutation({
      query: ({ salonUid, serviceData, serviceUid }) => ({
        url: `/salons/${salonUid}/services/${serviceUid}`,
        method: "PATCH",
        body: serviceData,
      }),
      invalidatesTags: ["Services"],
    }),
    deleteService: builder.mutation({
      query: ({ salonUid, serviceUid }) => ({
        url: `/salons/${salonUid}/services/${serviceUid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Services"],
    }),
    getServiceCategories: builder.query({
      query: () => ({
        url: `/service-categories`,
        method: "GET",
      }),
      providesTags: ["Services"],
    }),
    getServiceSubCategories: builder.query({
      query: (categoryUid: string) => ({
        url: `/service-categories/${categoryUid}/subcategories`,
        method: "GET",
      }),
      providesTags: ["Services"],
    }),
  }),
});

export const {
  useGetServicesDataQuery,
  useAddServiceMutation,
  useEditServiceMutation,
  useDeleteServiceMutation,
  useGetServiceCategoriesQuery,
  useGetServiceSubCategoriesQuery,
} = ServicesApi;
