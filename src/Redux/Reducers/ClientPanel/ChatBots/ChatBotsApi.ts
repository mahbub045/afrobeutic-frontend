import { baseApi } from "@/Redux/Api/BaseApi";

export const ChatBotsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatBots: builder.query({
      query: (params) => ({
        url: "/chatbots",
        method: "GET",
        params,
      }),
      providesTags: ["ChatBots"],
    }),
  }),
});

export const { useGetChatBotsQuery } = ChatBotsApi;
