import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: 'idle',
    userDetails: [],
    tempDetails: [],
    loading: false,
    // FIX F-2: Do NOT rehydrate full user from localStorage — only token is stored
    currentUser: null,
    currentRole: null,
    error: null,
    response: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        authRequest: (state) => { state.status = 'loading'; },
        // FIX F-5: renamed underControl → resetUserStatus (old name kept as export alias below)
        resetUserStatus: (state) => { state.status = 'idle'; state.response = null; },
        // FIX F-5: renamed stuffAdded → entityAdded (old name kept as export alias below)
        entityAdded: (state, action) => {
            state.status = 'added';
            state.response = null;
            state.error = null;
            state.tempDetails = action.payload;
        },
        authSuccess: (state, action) => {
            state.status = 'success';
            state.currentUser = action.payload;
            state.currentRole = action.payload.role;
            // FIX F-2: Store only the JWT token, not the full user object
            if (action.payload.token) {
                localStorage.setItem('token', action.payload.token);
            }
            state.response = null;
            state.error = null;
        },
        authFailed: (state, action) => { state.status = 'failed'; state.response = action.payload; },
        authError: (state, action) => { state.status = 'error'; state.error = action.payload; },
        authLogout: (state) => {
            // FIX F-2: remove token from localStorage (not 'user')
            localStorage.removeItem('token');
            state.currentUser = null;
            state.status = 'idle';
            state.error = null;
            state.currentRole = null;
        },
        doneSuccess: (state, action) => {
            state.userDetails = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getDeleteSuccess: (state) => { state.loading = false; state.error = null; state.response = null; },
        getRequest: (state) => { state.loading = true; },
        getFailed: (state, action) => { state.response = action.payload; state.loading = false; state.error = null; },
        getError: (state, action) => { state.loading = false; state.error = action.payload; },
    },
});

const { resetUserStatus, entityAdded, ...rest } = userSlice.actions;

export const {
    authRequest,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
} = userSlice.actions;

// Named exports — new names
export { resetUserStatus, entityAdded };
// Backward-compatible aliases so existing components don't break
export const underControl = resetUserStatus;
export const stuffAdded = entityAdded;

export const userReducer = userSlice.reducer;
