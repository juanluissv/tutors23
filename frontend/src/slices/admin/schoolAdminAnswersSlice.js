import { apiSlice } from '../apiSlice'
import { ANSWERS_URL } from '../../constants'

export const schoolAdminAnswersApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getSchoolAdminAnswerById: builder.query({
			query: (answerId) => `${ANSWERS_URL}/schooladmin/${answerId}`,
			providesTags: (result, error, answerId) => [
				{
					type: 'StudentAnswers',
					id: `SCHOOLADMIN_DETAIL_${String(answerId)}`,
				},
			],
		}),
	}),
})

export const { useGetSchoolAdminAnswerByIdQuery } =
	schoolAdminAnswersApiSlice
