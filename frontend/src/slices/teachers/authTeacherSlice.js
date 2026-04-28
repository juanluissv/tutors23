import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    teacherInfo: localStorage.getItem("teacherInfo") ? JSON.parse(localStorage.getItem("teacherInfo")) : null,
};

const authTeacherSlice = createSlice({
    name: "authTeacher",
    initialState,
    reducers: {
        setTeacherCredentials: (state, action) => {
            state.teacherInfo = action.payload;
            localStorage.setItem("teacherInfo", JSON.stringify(action.payload));
        },
        logoutTeacher: (state, action) => {
            state.teacherInfo = null;
            localStorage.clear();
        }
    },
});

export const { setTeacherCredentials, logoutTeacher } = authTeacherSlice.actions;

export default authTeacherSlice.reducer;