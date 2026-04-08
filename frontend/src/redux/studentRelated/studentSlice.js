import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    studentsList: [],
    loading: false,
    error: null,
    response: null,
    statestatus: 'idle',
};

const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        // FIX F-5: renamed stuffDone → studentOperationDone
        studentOperationDone: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
            state.statestatus = 'added';
        },
        getSuccess: (state, action) => {
            state.studentsList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        underStudentControl: (state) => {
            state.loading = false;
            state.response = null;
            state.error = null;
            state.statestatus = 'idle';
        },
    },
});

const { studentOperationDone, ...rest } = studentSlice.actions;

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    underStudentControl,
} = studentSlice.actions;

export { studentOperationDone };
// Backward-compatible alias so existing code using stuffDone still works
export const stuffDone = studentOperationDone;

export const studentReducer = studentSlice.reducer;
