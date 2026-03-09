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
      transformResponse: (response) => response?.data ?? response ?? [],
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
