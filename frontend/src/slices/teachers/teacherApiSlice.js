import { apiSlice } from "../apiSlice";
import { COURSES_URL, SUBJECTS_URL, TEACHERS_URL } from "../../constants";

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
        getCoursesBySubjectForTeacher: builder.query({
            query: (subjectId) => ({
                url: `${COURSES_URL}/subject/${subjectId}`,
            }),
            providesTags: (result, error, subjectId) => [
                { type: 'Course', id: `SUBJECT_${subjectId}` },
            ],
        }),
        getCourseByIdForTeacher: builder.query({
            query: (courseId) => ({
              url: `${COURSES_URL}/${courseId}`,
            }),
            providesTags: (result, error, courseId) => [
                { type: 'Course', id: courseId },
            ],
        }),
        getCoursePreviewForTeacher: builder.query({
            query: (courseId) => ({
              url: `${COURSES_URL}/${courseId}/preview`,
            }),
            providesTags: (result, error, courseId) => [
                { type: 'Course', id: `${courseId}_PREVIEW` },
                { type: 'Course', id: courseId },
            ],
        }),
        updateCoursePublish: builder.mutation({
            query: ({ courseId, isPublish }) => ({
              url: `${COURSES_URL}/${courseId}/publish`,
              method: 'PATCH',
              body: { isPublish },
            }),
            invalidatesTags: (result, error, { courseId, subjectId }) => {
              const tags = [
                { type: 'Course', id: courseId },
                { type: 'Course', id: `${courseId}_PREVIEW` },
              ];
              if (subjectId) {
                tags.push({
                  type: 'Course',
                  id: `SUBJECT_${subjectId}`,
                });
                tags.push({
                  type: 'Course',
                  id: `STUDENT_PUBLISHED_${subjectId}`,
                });
              }
              return tags;
            },
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
                    if (body.gradesLevel == null) {
                        fd.append('gradesLevel', '');
                    } else {
                        fd.append('gradesLevel', String(body.gradesLevel));
                    }
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
        createCourse: builder.mutation({
            query: ({ teacherId, ...body }) => ({
                url: COURSES_URL,
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, arg) => {
                const tags = [{ type: 'Course', id: 'LIST' }];
                if (arg?.teacherId) {
                    tags.push({
                        type: 'Subject',
                        id: `TEACHER_LIST_${arg.teacherId}`,
                    });
                }
                if (arg?.subject) {
                    tags.push({
                        type: 'Course',
                        id: `SUBJECT_${arg.subject}`,
                    });
                    tags.push({
                        type: 'Course',
                        id: `STUDENT_PUBLISHED_${arg.subject}`,
                    });
                }
                return tags;
            },
        }),
        addCourseSection: builder.mutation({
            query: ({ courseId, sectionTitle }) => ({
              url: `${COURSES_URL}/${courseId}/sections`,
              method: 'POST',
              body: { sectionTitle },
            }),
            invalidatesTags: (result, error, { courseId, subjectId }) => {
              const tags = [{ type: 'Course', id: courseId }];
              if (subjectId) {
                  tags.push({ type: 'Course', id: `SUBJECT_${subjectId}` });
              }
              return tags;
            },
        }),
        addCourseLesson: builder.mutation({
            query: ({ courseId, title, sectionNumber, description, video }) => {
              const fd = new FormData();
              fd.append('title', title);
              fd.append('sectionNumber', sectionNumber);
              if (description !== undefined && description !== '') {
                  fd.append('description', description);
              }
              fd.append('video', video);
              return {
                url: `${COURSES_URL}/${courseId}/lessons`,
                method: 'POST',
                body: fd,
              };
            },
            invalidatesTags: (result, error, { courseId, subjectId }) => {
              const tags = [{ type: 'Course', id: courseId }];
              if (subjectId) {
                  tags.push({ type: 'Course', id: `SUBJECT_${subjectId}` });
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
    useGetCoursesBySubjectForTeacherQuery,
    useGetCourseByIdForTeacherQuery,
    useGetCoursePreviewForTeacherQuery,
    useUpdateCoursePublishMutation,
    useCreateCourseMutation,
    useAddCourseSectionMutation,
    useAddCourseLessonMutation,
} = teacherApiSlice;