import { apiSlice } from '../apiSlice'
import { QUESTIONS_URL } from '../../constants'

export const teacherPreviousQuestionsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getTeacherPreviousQuestions: builder.query({
			query: ({ page = 1, limit = 1, subject } = {}) => ({
				url: QUESTIONS_URL + '/teacher/previous',
				params:
					subject != null && String(subject).trim() !== ''
						? { page, limit, subject: String(subject).trim() }
						: { page, limit },
			}),
			providesTags: [{ type: 'Questions', id: 'TEACHER_PREVIOUS' }],
		}),
	}),
})

export const { useGetTeacherPreviousQuestionsQuery } =
	teacherPreviousQuestionsApiSlice
