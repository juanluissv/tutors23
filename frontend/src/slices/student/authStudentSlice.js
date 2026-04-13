import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    studentInfo: localStorage.getItem("studentInfo") ? JSON.parse(localStorage.getItem("studentInfo")) : null,
};

const authStudentSlice = createSlice({
    name: "authStudent",
    initialState,
    reducers: {
        setStudentCredentials: (state, action) => {
            state.studentInfo = action.payload;
            localStorage.setItem("studentInfo", JSON.stringify(action.payload));
        },
        logoutStudent: (state, action) => {
            state.studentInfo = null;
            localStorage.clear();
        }
    },
});

export const { setStudentCredentials, logoutStudent } = authStudentSlice.actions;

export default authStudentSlice.reducer;