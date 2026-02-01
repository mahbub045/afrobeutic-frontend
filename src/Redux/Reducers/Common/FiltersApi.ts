import { baseApi } from "@/Redux/Api/BaseApi";

export const FiltersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEmployeeFilters: build.query({
      query: ({ salonUid }) => ({
        url: `/filters/${salonUid}/employees`,
        method: "GET",
      }),
      providesTags: ["Filters"],
    }),
    getServicesFilters: build.query({
      query: ({ salonUid }) => ({
        url: `/filters/${salonUid}/services`,
        method: "GET",
      }),
      providesTags: ["Filters"],
    }),
    getProductsFilters: build.query({
      query: ({ salonUid }) => ({
        url: `/filters/${salonUid}/products`,
        method: "GET",
      }),
      providesTags: ["Filters"],
    }),
  }),
});
export const {
  useGetEmployeeFiltersQuery,
  useGetServicesFiltersQuery,
  useGetProductsFiltersQuery,
} = FiltersApi;
