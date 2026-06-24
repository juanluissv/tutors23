import { apiSlice } from "../apiSlice";
import {
    COURSES_URL,
    PLANS_URL,
    SCHOOL_ADMINS_URL,
    SCHOOLS_URL,
    SUBJECTS_URL,
    BOOK_LESSONS_URL,
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
            query: ({ book, gradesLevel, ...body }) => {
                if (book instanceof File) {
                    const fd = new FormData();
                    if (body.title != null) {
                        fd.append('title', String(body.title));
                    }
                    if (body.description != null) {
                        fd.append('description', String(body.description));
                    }
                    if (body.school != null) {
                        fd.append('school', String(body.school));
                    }
                    if (Array.isArray(gradesLevel)) {
                        gradesLevel.forEach((id) => {
                            fd.append('gradesLevel', String(id));
                        });
                    }
                    fd.append('book', book);
                    return {
                        url: SUBJECTS_URL,
                        method: 'POST',
                        body: fd,
                    };
                }
                return {
                    url: SUBJECTS_URL,
                    method: 'POST',
                    body: { ...body, gradesLevel },
                };
            },
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
            query: ({ id, book, ...body }) => {
                if (book instanceof File) {
                    const fd = new FormData();
                    if (body.title != null) {
                        fd.append('title', String(body.title));
                    }
                    if (body.description != null) {
                        fd.append('description', String(body.description));
                    }
                    if (body.teacherEmail != null) {
                        fd.append('teacherEmail', String(body.teacherEmail));
                    }
                    fd.append('book', book);
                    return {
                        url: `${SUBJECTS_URL}/${id}`,
                        method: 'PUT',
                        body: fd,
                    };
                }
                return {
                    url: `${SUBJECTS_URL}/${id}`,
                    method: 'PUT',
                    body,
                };
            },
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
        updateSubjectBookChapters: builder.mutation({
            query: ({ id, bookChapters }) => ({
                url: `${SUBJECTS_URL}/${id}/book-chapters`,
                method: 'PUT',
                body: { bookChapters },
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
        generateSubjectBookChapterPdf: builder.mutation({
            query: ({ id, chapterId }) => ({
                url: `${SUBJECTS_URL}/${id}/book-chapters/${chapterId}/generate-pdf`,
                method: 'POST',
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
        generateBookLessonsFromChapter: builder.mutation({
            query: ({ id, chapterId }) => ({
                url: `${SUBJECTS_URL}/${id}/book-chapters/${chapterId}/generate-lessons`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'BookLesson', id: `SUBJECT_${id}` },
            ],
        }),
        getBookLessonsBySubject: builder.query({
            query: (subjectId) => ({
                url: `${SUBJECTS_URL}/${subjectId}/book-lessons`,
            }),
            providesTags: (result, error, subjectId) => [
                { type: 'BookLesson', id: `SUBJECT_${subjectId}` },
            ],
        }),
        getBookLessonByIdForSchoolAdmin: builder.query({
            query: ({ subjectId, lessonId }) => ({
                url: `${SUBJECTS_URL}/${subjectId}/book-lessons/${lessonId}`,
            }),
            providesTags: (result, error, { lessonId }) => [
                { type: 'BookLesson', id: lessonId },
            ],
        }),
        uploadSubjectBookChapterFile: builder.mutation({
            query: ({ id, chapterId, chapterFile }) => {
                const fd = new FormData()
                fd.append('chapterFile', chapterFile)
                return {
                    url: `${SUBJECTS_URL}/${id}/book-chapters/${chapterId}/file`,
                    method: 'PUT',
                    body: fd,
                }
            },
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
        deleteSubjectBookChapter: builder.mutation({
            query: ({ id, chapterId }) => ({
                url: `${SUBJECTS_URL}/${id}/book-chapters/${chapterId}`,
                method: 'DELETE',
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
        getPlansBySchool: builder.query({
            query: (schoolId) => ({
              url: `${PLANS_URL}/school/${schoolId}`,
            }),
            providesTags: (result, error, schoolId) => [
                { type: 'Plan', id: `SCHOOL_LIST_${schoolId}` },
            ],
        }),
        getPlanById: builder.query({
            query: (id) => ({
              url: `${PLANS_URL}/${id}`,
            }),
            providesTags: (result, error, id) => [
                { type: 'Plan', id },
            ],
        }),
        getPlanSubscriptions: builder.query({
            query: (planId) => ({
              url: `${PLANS_URL}/${planId}/subscriptions`,
            }),
            providesTags: (result, error, planId) => [
                { type: 'Subscription', id: `PLAN_${planId}` },
                { type: 'Plan', id: planId },
            ],
        }),
        updatePlan: builder.mutation({
            query: ({ id, ...body }) => ({
              url: `${PLANS_URL}/${id}`,
              method: 'PUT',
              body,
            }),
            invalidatesTags: (result, error, { id }) => {
                const tags = [{ type: 'Plan', id }]
                const sid = result?.school?._id ?? result?.school
                if (sid) {
                    tags.push(
                        { type: 'Plan', id: `SCHOOL_LIST_${String(sid)}` },
                    )
                }
                return tags
            },
        }),
        createPlan: builder.mutation({
            query: (body) => ({
              url: PLANS_URL,
              method: 'POST',
              body,
            }),
            invalidatesTags: (result) => {
                const tags = ['Plan']
                const sid = result?.school?._id ?? result?.school
                if (sid) {
                    tags.push(
                        { type: 'School', id: String(sid) },
                        { type: 'Plan', id: `SCHOOL_LIST_${String(sid)}` },
                    )
                }
                return tags
            },
        }),
        addTeacherToSchool: builder.mutation({
            query: ({ schoolId, ...body }) => ({
              url: `${SCHOOLS_URL}/${schoolId}/teachers`,
              method: 'POST',
              body,
            }),
            invalidatesTags: (result, error, { schoolId }) => [
                { type: 'School', id: schoolId },
                { type: 'Teachers', id: `SCHOOL_LIST_${schoolId}` },
            ],
        }),
        getTeachersBySchool: builder.query({
            query: (schoolId) => ({
              url: `${SCHOOLS_URL}/${schoolId}/teachers`,
            }),
            providesTags: (result, error, schoolId) => [
                { type: 'Teachers', id: `SCHOOL_LIST_${schoolId}` },
            ],
        }),
        addStudentToSchool: builder.mutation({
            query: ({ schoolId, ...body }) => ({
              url: `${SCHOOLS_URL}/${schoolId}/students`,
              method: 'POST',
              body,
            }),
            invalidatesTags: (result, error, { schoolId }) => [
                { type: 'School', id: schoolId },
                { type: 'Students', id: `SCHOOL_LIST_${schoolId}` },
                { type: 'Plan', id: `SCHOOL_LIST_${schoolId}` },
            ],
        }),
        getStudentsBySchool: builder.query({
            query: (schoolId) => ({
              url: `${SCHOOLS_URL}/${schoolId}/students`,
            }),
            providesTags: (result, error, schoolId) => [
                { type: 'Students', id: `SCHOOL_LIST_${schoolId}` },
            ],
        }),
        getSubjectStudentsForSchoolAdmin: builder.query({
            query: (subjectId) => ({
              url: `${SUBJECTS_URL}/${subjectId}/school-admin/students`,
            }),
            providesTags: (result, error, subjectId) => [
                { type: 'Subject', id: `STUDENTS_${subjectId}` },
            ],
        }),
        getCoursesBySubjectForSchoolAdmin: builder.query({
            query: (subjectId) => ({
              url: `${COURSES_URL}/school-admin/subject/${subjectId}`,
            }),
            providesTags: (result, error, subjectId) => [
                { type: 'Course', id: `SCHOOL_ADMIN_SUBJECT_${subjectId}` },
            ],
        }),
        getCoursePreviewForSchoolAdmin: builder.query({
            query: (courseId) => ({
              url: `${COURSES_URL}/${courseId}/school-admin/preview`,
            }),
            providesTags: (result, error, courseId) => [
                { type: 'Course', id: `${courseId}_SCHOOL_ADMIN_PREVIEW` },
                { type: 'Course', id: courseId },
            ],
        }),
        getSchoolEarnings: builder.query({
            query: ({ schoolId, months = 12 } = {}) => ({
              url: `${SCHOOLS_URL}/${schoolId}/earnings`,
              params: { months },
            }),
            providesTags: (result, error, { schoolId }) => [
                { type: 'Earnings', id: schoolId },
                { type: 'Subscription', id: `SCHOOL_${schoolId}` },
            ],
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
    useUpdateSubjectBookChaptersMutation,
    useGenerateSubjectBookChapterPdfMutation,
    useGenerateBookLessonsFromChapterMutation,
    useGetBookLessonsBySubjectQuery,
    useGetBookLessonByIdForSchoolAdminQuery,
    useUploadSubjectBookChapterFileMutation,
    useDeleteSubjectBookChapterMutation,
    useSetSubjectTeacherEmailMutation,
    useGetPlansBySchoolQuery,
    useGetPlanByIdQuery,
    useGetPlanSubscriptionsQuery,
    useUpdatePlanMutation,
    useCreatePlanMutation,
    useAddTeacherToSchoolMutation,
    useGetTeachersBySchoolQuery,
    useAddStudentToSchoolMutation,
    useGetStudentsBySchoolQuery,
    useGetSubjectStudentsForSchoolAdminQuery,
    useGetCoursesBySubjectForSchoolAdminQuery,
    useGetCoursePreviewForSchoolAdminQuery,
    useGetSchoolEarningsQuery,
} = schoolAdminApiSlice;