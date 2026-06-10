import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { arg }) => {
        if (
            typeof arg === 'object'
            && arg !== null
            && 'body' in arg
            && arg.body instanceof FormData
        ) {
            headers.delete('Content-Type')
        }
        return headers
    },
});

export const apiSlice = createApi({
    baseQuery,
    tagTypes: [
        'Chat',
        'Students',
        'Teachers',
        'SchoolAdmins',
        'School',
        'Subject',
        'Plan',
        'Subscription',
        'Earnings',
        'Course',
        'Questions',
        'StudentAnswers',
    ],
    endpoints: (builder) => ({})
});


