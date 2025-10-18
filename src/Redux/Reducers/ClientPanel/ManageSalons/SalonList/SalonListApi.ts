import { baseApi } from "@/Redux/Api/BaseApi";
import {
  SalonListQueryParams,
  SalonListResponse,
} from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";

export const SalonListApi = baseApi.injectEndpoints({
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
  }),
});

export const { useGetSalonListQuery } = SalonListApi;
