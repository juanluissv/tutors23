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
            providesTags: ['Students'],
          }),
          updateProfile: builder.mutation({
            query: (data) => ({
              url: `${STUDENTS_URL}/profile`,
              method: 'PUT',
              body: data,
            }),
            invalidatesTags: ['Students'],
          }),
          getMySubjects: builder.query({
            query: () => ({
              url: `${STUDENTS_URL}/mysubjects`,
            }),
            providesTags: ['Students'],
          }),
    }),
})


export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
    useGetMySubjectsQuery,
} = studentApiSlice;
