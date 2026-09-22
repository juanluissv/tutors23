import { apiSlice } from './apiSlice';
import {  chat_URL } from '../constants';


export const chatApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getChat: builder.mutation({
            query: ({ question, id, lessonId }) => ({
                url: chat_URL,
                method: 'POST',
                body: { question, id, lessonId },
            }),
        }),
    }),
});


export const { useGetChatMutation } = chatApiSlice;