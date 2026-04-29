import { apiSlice } from "../apiSlice";
import { SUBJECTS_URL, TEACHERS_URL } from "../../constants";

export const teacherApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        loginTeacher: builder.mutation({
            query: (data) => ({
              url: `${TEACHERS_URL}/login`,
              method: 'POST',
              body: data,
            }),
            invalidatesTags: ['Questions'], 
          }),
        registerTeacher: builder.mutation({
            query: (data) => ({
              url: `${TEACHERS_URL}/register`,
              method: 'POST',
              body: data,
            }),
        }),
        logoutTeacher: builder.mutation({
            query: () => ({
              url: `${TEACHERS_URL}/logout`,
              method: 'POST',
            }),
            invalidatesTags: ['Questions'],
        }),
        getTeacherProfile: builder.query({
            query: () => ({
                url: `${TEACHERS_URL}/profile`,
            }),
            providesTags: [{ type: 'Teachers', id: 'PROFILE' }],
        }),
        updateTeacherProfile: builder.mutation({
            query: (body) => ({
                url: `${TEACHERS_URL}/profile`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'Teachers', id: 'PROFILE' }],
        }),
        getSubjectsByTeacherId: builder.query({
            query: (teacherId) => ({
              url: `${SUBJECTS_URL}/teacher/${teacherId}`,
            }),
            providesTags: (result, error, teacherId) => [
                { type: 'Subject', id: `TEACHER_LIST_${teacherId}` },
            ],
        }),
        getSubjectStudentsForTeacher: builder.query({
            query: (subjectId) => ({
              url: `${SUBJECTS_URL}/${subjectId}/teacher/students`,
            }),
            providesTags: (result, error, subjectId) => [
                { type: 'Subject', id: `STUDENTS_${subjectId}` },
            ],
        }),
        updateSubjectByTeacher: builder.mutation({
            query: ({ id, teacherId, book, ...body }) => {
                if (book instanceof File) {
                    const fd = new FormData();
                    if (body.title != null) {
                        fd.append('title', String(body.title));
                    }
                    if (body.description != null) {
                        fd.append('description', String(body.description));
                    }
                    if (body.grade == null) {
                        fd.append('grade', '');
                    } else {
                        fd.append('grade', String(body.grade));
                    }
                    fd.append(
                        'isCoursePublish',
                        body.isCoursePublish ? 'true' : 'false',
                    );
                    fd.append('book', book);
                    return {
                        url: `${SUBJECTS_URL}/${id}/teacher`,
                        method: 'PUT',
                        body: fd,
                    };
                }
                return {
                    url: `${SUBJECTS_URL}/${id}/teacher`,
                    method: 'PUT',
                    body: { ...body },
                };
            },
            invalidatesTags: (result, error, { id, teacherId }) => {
                const tags = [];
                if (teacherId) {
                    tags.push({
                        type: 'Subject',
                        id: `TEACHER_LIST_${teacherId}`,
                    });
                }
                if (id) {
                    tags.push({ type: 'Subject', id });
                }
                return tags;
            },
        }),
        addStudentEmailToSubject: builder.mutation({
            query: ({ subjectId, email }) => ({
                url: `${SUBJECTS_URL}/${subjectId}/teacher/student-email`,
                method: 'PUT',
                body: { email },
            }),
            invalidatesTags: (result, error, { teacherId, subjectId }) => {
                const tags = [];
                if (teacherId) {
                    tags.push({
                        type: 'Subject',
                        id: `TEACHER_LIST_${teacherId}`,
                    });
                }
                if (subjectId) {
                    tags.push({ type: 'Subject', id: subjectId });
                    tags.push({ type: 'Subject', id: `STUDENTS_${subjectId}` });
                }
                return tags;
            },
        }),
    }),
});

export const {
    useLoginTeacherMutation,
    useRegisterTeacherMutation,
    useLogoutTeacherMutation,
    useGetTeacherProfileQuery,
    useUpdateTeacherProfileMutation,
    useGetSubjectsByTeacherIdQuery,
    useUpdateSubjectByTeacherMutation,
    useAddStudentEmailToSubjectMutation,
    useGetSubjectStudentsForTeacherQuery,
} = teacherApiSlice;