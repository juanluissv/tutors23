import { apiSlice } from '../apiSlice'
import { ANSWERS_URL } from '../../constants'

export const studentAnswersApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getStudentNewAnswers: builder.query({
			query: (studentId) =>
				`${ANSWERS_URL}/student/${studentId}/new`,
			providesTags: (result, error, studentId) => [
				'StudentAnswers',
				{ type: 'StudentAnswers', id: String(studentId) },
			],
		}),
		getStudentAnswerById: builder.query({
			query: (answerId) => `${ANSWERS_URL}/student/${answerId}`,
			providesTags: (result, error, answerId) => [
				{ type: 'StudentAnswers', id: `DETAIL_${String(answerId)}` },
			],
		}),
	}),
})

export const {
	useGetStudentNewAnswersQuery,
	useGetStudentAnswerByIdQuery,
} = studentAnswersApiSlice
