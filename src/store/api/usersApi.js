import { apiSlice } from "@/store/api/apiSlice";

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "users",
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    getUser: builder.query({
      query: (id) => `users/${id}`,
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    searchUsers: builder.query({
      query: (q) => `users/search?q=${encodeURIComponent(q ?? "")}`,
      transformResponse: (response) => response?.data ?? response ?? [],
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetUsersQuery, useGetUserQuery, useLazySearchUsersQuery } = usersApi;
