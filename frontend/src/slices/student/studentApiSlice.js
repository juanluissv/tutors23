import { apiSlice } from "../apiSlice";
import { STUDENTS_URL } from "../../constants"

export const studentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
              url: `${STUDENTS_URL}/login`,
              method: 'POST',
              body: data,
            }),
          }),
          register: builder.mutation({
            query: (data) => ({
              url: `${STUDENTS_URL}/register`,
              method: 'POST',
              body: data,
            }),
          }),
          logout: builder.mutation({
            query: () => ({
              url: `${STUDENTS_URL}/logout`,
              method: 'POST',
            }),
          }),
          getProfile: builder.query({
            query: () => ({
              url: `${STUDENTS_URL}/profile`,
            }),
            invalidatesTags: ['Students'], // Invalidate 'Profile' cache upon success
          }),
          updateProfile: builder.mutation({
            query: (data) => ({
              url: `${STUDENTS_URL}/profile`,
              method: 'PUT',
              body: data,
            }),
          }),
          invalidatesTags: ['Students'], // Invalidate 'Profile' cache upon success
    }),
})


export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetProfileQuery, useUpdateProfileMutation } = studentApiSlice;   
