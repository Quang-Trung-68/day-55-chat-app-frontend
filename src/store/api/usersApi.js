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
  }),
});

export const { useGetUsersQuery, useGetUserQuery } = usersApi;
