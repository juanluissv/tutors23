import { apiSlice } from "../apiSlice";
import {
    SCHOOL_ADMINS_URL,
    SCHOOLS_URL,
    SUBJECTS_URL,
} from "../../constants";

export const schoolAdminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        loginSchoolAdmin: builder.mutation({
            query: (data) => ({
              url: `${SCHOOL_ADMINS_URL}/login`,
              method: 'POST',
              body: data,
            }),
            invalidatesTags: ['SchoolAdmins'], 
          }),
        registerSchoolAdmin: builder.mutation({
            query: (data) => ({
              url: `${SCHOOL_ADMINS_URL}/register`,
              method: 'POST',
              body: data,
            }),
        }),
        logoutSchoolAdmin: builder.mutation({
            query: () => ({
              url: `${SCHOOL_ADMINS_URL}/logout`,
              method: 'POST',
            }),
            invalidatesTags: ['SchoolAdmins'],
        }),        
        updateSchoolAdminProfile: builder.mutation({
            query: (data) => ({
              url: `${SCHOOL_ADMINS_URL}/profile`,
              method: 'PUT',
              body: data,
            }),
            invalidatesTags: ['SchoolAdmins'],
        }),
        createSchool: builder.mutation({
            query: (data) => ({
              url: SCHOOLS_URL,
              method: 'POST',
              body: data,
            }),
            invalidatesTags: ['SchoolAdmins'],
        }),
        getSchoolById: builder.query({
            query: (id) => ({
              url: `${SCHOOLS_URL}/${id}`,
            }),
            providesTags: (result, error, id) => [
                { type: 'School', id },
            ],
        }),
        updateSchool: builder.mutation({
            query: ({ id, ...body }) => ({
              url: `${SCHOOLS_URL}/${id}`,
              method: 'PUT',
              body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'School', id },
                'SchoolAdmins',
            ],
        }),
        getSubjectsBySchool: builder.query({
            query: (schoolId) => ({
              url: `${SUBJECTS_URL}/school/${schoolId}`,
            }),
            providesTags: (result, error, schoolId) => [
                { type: 'Subject', id: `SCHOOL_LIST_${schoolId}` },
            ],
        }),
        createSubject: builder.mutation({
            query: (data) => ({
              url: SUBJECTS_URL,
              method: 'POST',
              body: data,
            }),
            invalidatesTags: (result) => {
                const tags = ['Subject']
                if (result?.school) {
                    const sid = String(
                        result.school._id ?? result.school,
                    )
                    tags.push(
                        { type: 'School', id: sid },
                        { type: 'Subject', id: `SCHOOL_LIST_${sid}` },
                    )
                }
                return tags
            },
        }),
        updateSubject: builder.mutation({
            query: ({ id, ...body }) => ({
              url: `${SUBJECTS_URL}/${id}`,
              method: 'PUT',
              body,
            }),
            invalidatesTags: (result) => {
                const tags = ['Subject']
                if (result?.school) {
                    const sid = String(
                        result.school._id ?? result.school,
                    )
                    tags.push(
                        { type: 'School', id: sid },
                        { type: 'Subject', id: `SCHOOL_LIST_${sid}` },
                    )
                }
                return tags
            },
        }),
        setSubjectTeacherEmail: builder.mutation({
            query: ({ id, email }) => ({
              url: `${SUBJECTS_URL}/${id}/teacher-email`,
              method: 'PUT',
              body: { email },
            }),
            invalidatesTags: (result) => {
                const tags = ['Subject']
                if (result?.school) {
                    const sid = String(
                        result.school._id ?? result.school,
                    )
                    tags.push(
                        { type: 'School', id: sid },
                        { type: 'Subject', id: `SCHOOL_LIST_${sid}` },
                    )
                }
                return tags
            },
        }),
    }),
});

export const {
    useLoginSchoolAdminMutation,
    useRegisterSchoolAdminMutation,
    useLogoutSchoolAdminMutation,
    useUpdateSchoolAdminProfileMutation,
    useCreateSchoolMutation,
    useGetSchoolByIdQuery,
    useUpdateSchoolMutation,
    useGetSubjectsBySchoolQuery,
    useCreateSubjectMutation,
    useUpdateSubjectMutation,
    useSetSubjectTeacherEmailMutation,
} = schoolAdminApiSlice;