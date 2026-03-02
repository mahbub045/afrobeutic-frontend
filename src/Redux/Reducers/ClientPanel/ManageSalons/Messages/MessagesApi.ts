import { baseApi } from "@/Redux/Api/BaseApi";
import { Message } from "@/Types/ClientPanel/ManageSalonTypes/MessagesTypes/MessagesTypes";

export const MessagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query<Message[], { salonUid: string; page?: number }>({
      query: ({ salonUid, page }) => ({
        url: `/salons/${salonUid}/messages`,
        method: "GET",
        params: page ? { page } : undefined,
      }),
    }),
  }),
});

export const { useGetMessagesQuery } = MessagesApi;
