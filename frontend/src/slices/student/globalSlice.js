// globalSlice.js
import { createSlice } from '@reduxjs/toolkit';

const globalSlice = createSlice({
    name: 'global',
    initialState: {
        triggerNewRect: false,
        triggerNewRect2: false,
    },
    reducers: {
        callNewRect: (state) => {
            state.triggerNewRect = true;
        },
        resetNewRect: (state) => {
            state.triggerNewRect = false;
        },
        callNewRect2: (state) => {
            state.triggerNewRect2 = true;
        },
        resetNewRect2: (state) => {
            state.triggerNewRect2 = false;
        },
    },
});

export const { callNewRect, resetNewRect, callNewRect2, resetNewRect2 } = globalSlice.actions;
export default globalSlice.reducer;