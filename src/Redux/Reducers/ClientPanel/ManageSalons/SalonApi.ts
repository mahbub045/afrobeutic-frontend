import { baseApi } from "@/Redux/Api/BaseApi";
import {
  SalonListQueryParams,
  SalonListResponse,
} from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";

export const SalonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalonList: builder.query<SalonListResponse, SalonListQueryParams | void>(
      {
        query: (params) => {
          const queryParams = new URLSearchParams();

          if (params?.page) {
            queryParams.append("page", params.page.toString());
          }

          if (params?.search) {
            queryParams.append("search", params.search);
          }

          const queryString = queryParams.toString();
          return {
            url: `/salons${queryString ? `?${queryString}` : ""}`,
            method: "GET",
          };
        },
        providesTags: ["SalonList"],
      },
    ),
    addSalon: builder.mutation({
      query: (salonData) => ({
        url: `/salons`,
        method: "POST",
        body: salonData,
      }),
      invalidatesTags: ["SalonList"],
    }),
  }),
});

export const { useGetSalonListQuery, useAddSalonMutation } = SalonApi;
