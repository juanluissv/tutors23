import { apiSlice } from '../apiSlice'
import { QUESTIONS_URL } from '../../constants'

export const questionsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createStudentQuestion: builder.mutation({
            query: (body) => ({
                url: `${QUESTIONS_URL}/student`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Questions'],
        }),
        getStudentQuestionById: builder.query({
            query: (questionId) =>
                `${QUESTIONS_URL}/student/question/${questionId}`,
            providesTags: (result, error, questionId) => [
                {
                    type: 'Questions',
                    id: `DETAIL_${String(questionId)}`,
                },
            ],
        }),
        uploadStudentQuestionVideo: builder.mutation({
            async queryFn ({ questionId, videoBlob }, _api, _extraOptions, baseQuery) {
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
                        `${QUESTIONS_URL}/student/${questionId}/video`,
                    method: 'POST',
                    body: formData,
                })
                if (result.error) {
                    return { error: result.error }
                }
                return { data: result.data }
            },
            invalidatesTags: (result, error, arg) => {
                const tags = ['Questions']
                if (arg?.questionId != null) {
                    tags.push({
                        type: 'Questions',
                        id: `DETAIL_${String(arg.questionId)}`,
                    })
                }
                return tags
            },
        }),
    }),
})

export const {
    useCreateStudentQuestionMutation,
    useGetStudentQuestionByIdQuery,
    useUploadStudentQuestionVideoMutation,
} = questionsApiSlice
