import { apiSlice } from '../apiSlice'
import { QUESTIONS_URL } from '../../constants'

export const studentPreviousQuestionsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getStudentPreviousQuestions: builder.query({
			query: ({ page = 1, limit = 1, subject } = {}) => ({
				url: QUESTIONS_URL + '/student/previous',
				params:
					subject != null && String(subject).trim() !== ''
						? { page, limit, subject: String(subject).trim() }
						: { page, limit },
			}),
			providesTags: [{ type: 'Questions', id: 'STUDENT_PREVIOUS' }],
		}),
	}),
})

export const { useGetStudentPreviousQuestionsQuery } =
	studentPreviousQuestionsApiSlice
