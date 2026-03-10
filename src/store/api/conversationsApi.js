import { apiSlice } from "@/store/api/apiSlice";

export const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createConversation: builder.mutation({
      query: (body) => ({
        url: "conversations",
        method: "POST",
        body,
      }),
      transformResponse: (response) => response?.data ?? response,
    }),
    getConversations: builder.query({
      query: () => ({ url: `conversations` }),
      // Thêm latest_message: null vào mỗi conversation để có sẵn cho updateQueryData
      transformResponse: (response) =>
        (response?.data ?? response ?? []).map((c) => ({
          ...c,
          latest_message: null, // sẽ được điền bởi getLatestMessage hoặc socket
        })),
    }),
    getConversationUser: builder.query({
      query: (id) => ({ url: `conversations/${id}/users` }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    getConversation: builder.query({
      query: (id) => ({ url: `conversations/${id}` }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    getMessages: builder.query({
      query: ({ id, params }) => ({
        url: `conversations/${id}/messages`,
        params,
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    getLatestMessage: builder.query({
      query: (id) => `conversations/${id}/latest-message`,
      transformResponse: (response) => response?.data ?? response,
      // Khi fetch thành công, cập nhật luôn vào cache getConversations
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        try {
          const { data: message } = await queryFulfilled;
          if (!message) return;
          dispatch(
            conversationsApi.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                const item = draft.find(
                  (c) => c.conversation_id === conversationId ||
                         String(c.conversation_id) === String(conversationId),
                );
                if (item && !item.latest_message) {
                  item.latest_message = message;
                }
              },
            ),
          );
        } catch {
          // Ignore
        }
      },
    }),
    createMessage: builder.mutation({
      query: ({ conversationId, ...body }) => ({
        url: `conversations/${conversationId}/messages`,
        method: "POST",
        body,
      }),
      transformResponse: (response) => response?.data ?? response,
    }),
  }),
});

export const {
  useCreateConversationMutation,
  useGetConversationsQuery,
  useGetConversationQuery,
  useGetConversationUserQuery,
  useGetMessagesQuery,
  useGetLatestMessageQuery,
  useCreateMessageMutation,
} = conversationsApi;
