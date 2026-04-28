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
        getSubjectsByTeacherId: builder.query({
            query: (teacherId) => ({
              url: `${SUBJECTS_URL}/teacher/${teacherId}`,
            }),
            providesTags: (result, error, teacherId) => [
                { type: 'Subject', id: `TEACHER_LIST_${teacherId}` },
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
    }),
});

export const {
    useLoginTeacherMutation,
    useRegisterTeacherMutation,
    useLogoutTeacherMutation,
    useGetSubjectsByTeacherIdQuery,
    useUpdateSubjectByTeacherMutation,
} = teacherApiSlice;