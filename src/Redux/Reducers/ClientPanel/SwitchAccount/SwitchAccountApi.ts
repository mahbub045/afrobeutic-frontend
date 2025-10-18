import { baseApi } from "@/Redux/Api/BaseApi";
import {
  AccountAccesserQueryParams,
  AccountAccesserResponse,
} from "@/Types/ClientPanel/SwitchAccountTypes/SwitchAccounType";

export const SwitchAccountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountAccesser: builder.query<
      AccountAccesserResponse,
      AccountAccesserQueryParams | void
    >({
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
          url: `/accounts/access${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["AccountAccesser"],
    }),
  }),
});

export const { useGetAccountAccesserQuery } = SwitchAccountApi;
