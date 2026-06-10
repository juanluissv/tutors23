import { apiSlice } from '../apiSlice'
import { QUESTIONS_URL } from '../../constants'

export const schoolAdminPreviousQuestionsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getSchoolAdminPreviousQuestions: builder.query({
			query: ({ page = 1, limit = 1, subject } = {}) => ({
				url: QUESTIONS_URL + '/schooladmin/previous',
				params: {
					page,
					limit,
					subject: String(subject).trim(),
				},
			}),
			providesTags: [{ type: 'Questions', id: 'SCHOOLADMIN_PREVIOUS' }],
		}),
	}),
})

export const { useGetSchoolAdminPreviousQuestionsQuery } =
	schoolAdminPreviousQuestionsApiSlice
