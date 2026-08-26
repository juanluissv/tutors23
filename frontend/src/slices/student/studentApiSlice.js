import { apiSlice } from "../apiSlice";
import { BOOK_LESSONS_URL, COURSES_URL, STUDENTS_URL } from "../../constants"

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
          getCourseWatchForStudent: builder.query({
            query: (courseId) => ({
              url: `${COURSES_URL}/${courseId}/watch`,
            }),
            providesTags: (result, error, courseId) => [
              { type: 'Course', id: `STUDENT_WATCH_${courseId}` },
            ],
          }),
          getStudentSubjectCourses: builder.query({
            query: (subjectId) => ({
              url: `${COURSES_URL}/student/subject/${subjectId}`,
            }),
            providesTags: (result, error, subjectId) => [
              { type: 'Course', id: `STUDENT_PUBLISHED_${subjectId}` },
            ],
          }),
          subscribe: builder.mutation({
            query: (data) => ({
              url: `${STUDENTS_URL}/subscribe`,
              method: 'POST',
              body: data,
            }),
            invalidatesTags: [
                'Students',
                'Subscription',
                'Earnings',
            ],
          }),
          getAvailableSubscriptionSubjects: builder.query({
            query: (subscriptionId) => ({
              url: `${STUDENTS_URL}/subscriptions/${subscriptionId}/available-subjects`,
            }),
            providesTags: (result, error, subscriptionId) => [
              { type: 'Subscription', id: `AVAILABLE_${subscriptionId}` },
            ],
          }),
          selectSubscriptionSubjects: builder.mutation({
            query: ({ subscriptionId, subjectIds }) => ({
              url: `${STUDENTS_URL}/subscriptions/${subscriptionId}/subjects`,
              method: 'PUT',
              body: { subjectIds },
            }),
            invalidatesTags: [
              'Students',
              'Subscription',
            ],
          }),
          getBookLessonsBySubjectForStudent: builder.query({
            query: (subjectId) => ({
              url: `${BOOK_LESSONS_URL}/subject/${subjectId}`,
            }),
            providesTags: (result, error, subjectId) => [
              { type: 'BookLesson', id: `SUBJECT_${subjectId}` },
            ],
          }),
          getBookLessonById: builder.query({
            query: (lessonId) => ({
              url: `${BOOK_LESSONS_URL}/${lessonId}`,
            }),
            providesTags: (result, error, lessonId) => [
              { type: 'BookLesson', id: lessonId },
            ],
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
    useGetCourseWatchForStudentQuery,
    useGetStudentSubjectCoursesQuery,
    useSubscribeMutation,
    useGetAvailableSubscriptionSubjectsQuery,
    useSelectSubscriptionSubjectsMutation,
    useGetBookLessonsBySubjectForStudentQuery,
    useGetBookLessonByIdQuery,
} = studentApiSlice;
