import { baseApi } from "@/Redux/Api/BaseApi";

export const ProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductsData: builder.query({
      // Accepts { salonUid, page?, page_size?, search? } and forwards them as query params
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
        ordering?: string;
      }) => {
        return {
          url: `/salons/${salonUid}/products`,
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
      providesTags: ["Products"],
    }),
    addProduct: builder.mutation({
      query: ({ salonUid, productData }) => ({
        url: `/salons/${salonUid}/products`,
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Products"],
    }),
    editProduct: builder.mutation({
      query: ({ salonUid, productData, productUid }) => ({
        url: `/salons/${salonUid}/products/${productUid}`,
        method: "PATCH",
        body: productData,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: builder.mutation({
      query: ({ salonUid, productUid }) => ({
        url: `/salons/${salonUid}/products/${productUid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    getProductCategories: builder.query({
      query: () => ({
        url: `/product-categories`,
        method: "GET",
      }),
      providesTags: ["Products"],
    }),
    getProductSubCategories: builder.query({
      query: (productUid: string) => ({
        url: `/product-categories/${productUid}/subcategories`,
        method: "GET",
      }),
      providesTags: ["Products"],
    }),
    addProductSubCategory: builder.mutation({
      query: ({ productUid, subCategoryData }) => ({
        url: `/product-categories/${productUid}/subcategories`,
        method: "POST",
        body: subCategoryData,
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsDataQuery,
  useAddProductMutation,
  useEditProductMutation,
  useDeleteProductMutation,
  useGetProductCategoriesQuery,
  useGetProductSubCategoriesQuery,
  useAddProductSubCategoryMutation,
} = ProductsApi;