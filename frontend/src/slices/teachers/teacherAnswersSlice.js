import { apiSlice } from '../apiSlice'
import { ANSWERS_URL } from '../../constants'

export const teacherAnswersApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getTeacherAnswerById: builder.query({
			query: (answerId) => `${ANSWERS_URL}/teacher/${answerId}`,
			providesTags: (result, error, answerId) => [
				{
					type: 'Questions',
					id: `TEACHER_ANSWER_${String(answerId)}`,
				},
			],
		}),
		createTeacherAnswer: builder.mutation({
			query: ({ questionId, description }) => ({
				url: `${ANSWERS_URL}/teacher/question/${questionId}`,
				method: 'POST',
				body: { description },
			}),
			invalidatesTags: (result, error, arg) => {
				const tags = ['Questions', 'StudentAnswers', {
					type: 'Questions',
					id: 'TEACHER_PREVIOUS',
				}]
				if (arg?.questionId != null) {
					tags.push({
						type: 'Questions',
						id: `DETAIL_${String(arg.questionId)}`,
					})
				}
				if (arg?.teacherId != null) {
					tags.push({
						type: 'Questions',
						id: `TEACHER_${String(arg.teacherId)}`,
					})
				}
				return tags
			},
		}),
		uploadTeacherAnswerVideo: builder.mutation({
			async queryFn (
				{ answerId, videoBlob },
				_api,
				_extraOptions,
				baseQuery,
			) {
				if (!(videoBlob instanceof Blob)) {
					return {
						error: {
							status: 400,
							data: {
								message:
									'Video must be a Blob or File. Try '
									+ 'recording again.',
							},
						},
					}
				}

				const formData = new FormData()
				const file =
					videoBlob instanceof File
						? videoBlob
						: new File(
							[videoBlob],
							'recording.webm',
							{
								type:
									videoBlob.type && videoBlob.type !== ''
										? videoBlob.type
										: 'video/webm',
							},
						)
				formData.append('video', file)

				const result = await baseQuery({
					url:
						`${ANSWERS_URL}/teacher/${answerId}/video`,
					method: 'POST',
					body: formData,
				})
				if (result.error) {
					return { error: result.error }
				}
				return { data: result.data }
			},
			invalidatesTags: (result, error, arg) => {
				const tags = ['Questions', 'StudentAnswers', {
					type: 'Questions',
					id: 'TEACHER_PREVIOUS',
				}]
				const qFromResult =
					result?.question != null ? String(result.question) : null
				const qFromArg =
					arg?.questionId != null ? String(arg.questionId) : null
				const qid = qFromResult || qFromArg
				if (qid) {
					tags.push({
						type: 'Questions',
						id: `DETAIL_${qid}`,
					})
				}
				if (arg?.teacherId != null) {
					tags.push({
						type: 'Questions',
						id: `TEACHER_${String(arg.teacherId)}`,
					})
				}
				if (arg?.answerId != null) {
					tags.push({
						type: 'Questions',
						id: `TEACHER_ANSWER_${String(arg.answerId)}`,
					})
				}
				return tags
			},
		}),
	}),
})

export const {
	useGetTeacherAnswerByIdQuery,
	useCreateTeacherAnswerMutation,
	useUploadTeacherAnswerVideoMutation,
} = teacherAnswersApiSlice
