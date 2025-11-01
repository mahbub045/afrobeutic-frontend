import { baseApi } from "@/Redux/Api/BaseApi";

export const CategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommonCategoriesData: builder.query({
      // Accept an optional params object (e.g. { category_type: 'EMPLOYEE' })
      query: (params?: Record<string, unknown>) => ({
        url: `/categories`,
        method: "GET",
        params,
      }),
      providesTags: ["CommonCategories"],
    }),
  }),
});
export const { useGetCommonCategoriesDataQuery } = CategoriesApi;
