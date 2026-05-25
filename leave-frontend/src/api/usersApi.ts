import { createApi } from "@reduxjs/toolkit/query/react";
import { cacheCurrentUser, type UserProfile } from "../auth";
import { baseQueryWithAuth } from "./baseQuery";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["CurrentUser", "Users"],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<UserProfile, void>({
      query: () => "/users/me",
      transformResponse: (profile: UserProfile) => {
        cacheCurrentUser(profile);
        return profile;
      },
      providesTags: ["CurrentUser"],
    }),

    getAdminUsers: builder.query<UserProfile[], void>({
      query: () => "/users/admin/all-users",
      providesTags: ["Users"],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
} = usersApi;
