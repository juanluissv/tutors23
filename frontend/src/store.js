import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import authStudentReducer from "./slices/student/authStudentSlice";    
import globalReducer from './slices/student/globalSlice';

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath] : apiSlice.reducer,
        authStudent: authStudentReducer,
        global: globalReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true,
});

export default store;