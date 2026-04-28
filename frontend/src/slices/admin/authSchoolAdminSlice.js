import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    schoolAdminInfo: localStorage.getItem("schoolAdminInfo") ? JSON.parse(localStorage.getItem("schoolAdminInfo")) : null,
};

const authSchoolAdminSlice = createSlice({
    name: "authSchoolAdmin",
    initialState,
    reducers: {
        setSchoolAdminCredentials: (state, action) => {
            state.schoolAdminInfo = action.payload;
            localStorage.setItem("schoolAdminInfo", JSON.stringify(action.payload));
        },
        logoutSchoolAdmin: (state, action) => {
            state.schoolAdminInfo = null;
            localStorage.clear();
        }
    },
});

export const { setSchoolAdminCredentials, logoutSchoolAdmin } = authSchoolAdminSlice.actions;

export default authSchoolAdminSlice.reducer;