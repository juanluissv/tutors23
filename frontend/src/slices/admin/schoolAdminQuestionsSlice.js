import { apiSlice } from '../apiSlice'
import { QUESTIONS_URL } from '../../constants'

export const schoolAdminQuestionsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getSchoolAdminQuestionById: builder.query({
			query: (questionId) =>
				`${QUESTIONS_URL}/schooladmin/question/${questionId}`,
			providesTags: (result, error, questionId) => [
				{
					type: 'Questions',
					id: `SCHOOLADMIN_DETAIL_${String(questionId)}`,
				},
			],
		}),
	}),
})

export const { useGetSchoolAdminQuestionByIdQuery } =
	schoolAdminQuestionsApiSlice
