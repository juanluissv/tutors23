import { apiSlice } from '../apiSlice'
import { QUESTIONS_URL } from '../../constants'

export const teacherQuestionsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getQuestionsByTeacherId: builder.query({
			query: (teacherId) => ({
				url: `${QUESTIONS_URL}/teacher/${teacherId}`,
			}),
			providesTags: (result, error, teacherId) => [
				{ type: 'Questions', id: `TEACHER_${teacherId}` },
			],
		}),
		getQuestionByIdForTeacher: builder.query({
			query: (questionId) => ({
				url: `${QUESTIONS_URL}/teacher/question/${questionId}`,
			}),
			providesTags: (result, error, questionId) => [
				{ type: 'Questions', id: `DETAIL_${questionId}` },
			],
		}),
	}),
})

export const {
	useGetQuestionsByTeacherIdQuery,
	useGetQuestionByIdForTeacherQuery,
} = teacherQuestionsApiSlice
