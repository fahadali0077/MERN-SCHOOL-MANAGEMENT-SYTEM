import api from '../../utils/api';
import {
    authRequest, entityAdded, authSuccess, authFailed,
    authError, authLogout, doneSuccess, getDeleteSuccess,
    getRequest, getFailed, getError,
} from './userSlice';

// FIX F-3: Use env vars for guest credentials — never hardcode them
export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await api.post(`/${role}Login`, fields);
        if (result.data.role) dispatch(authSuccess(result.data));
        else dispatch(authFailed(result.data.message));
    } catch (error) {
        // FIX F-3: dispatch serializable string, not the Axios error object
        dispatch(authError(error.message || 'Network error'));
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await api.post(`/${role}Reg`, fields);
        if (result.data.schoolName) dispatch(authSuccess(result.data));
        else if (result.data.school)  dispatch(entityAdded(result.data));
        else dispatch(authFailed(result.data.message));
    } catch (error) {
        dispatch(authError(error.message || 'Network error'));
    }
};

// FIX F-3: Guest credentials come from .env — no hardcoded values
export const guestLoginUser = (role) => async (dispatch) => {
    dispatch(authRequest());
    let fields;
    if (role === 'Admin') {
        fields = {
            email: process.env.REACT_APP_GUEST_ADMIN_EMAIL || '',
            password: process.env.REACT_APP_GUEST_ADMIN_PASSWORD || '',
        };
    } else if (role === 'Student') {
        fields = {
            rollNum: process.env.REACT_APP_GUEST_STUDENT_ROLLNUM || '',
            studentName: process.env.REACT_APP_GUEST_STUDENT_NAME || '',
            password: process.env.REACT_APP_GUEST_STUDENT_PASSWORD || '',
        };
    } else if (role === 'Teacher') {
        fields = {
            email: process.env.REACT_APP_GUEST_TEACHER_EMAIL || '',
            password: process.env.REACT_APP_GUEST_TEACHER_PASSWORD || '',
        };
    }
    try {
        const result = await api.post(`/${role}Login`, fields);
        if (result.data.role) dispatch(authSuccess(result.data));
        else dispatch(authFailed(result.data.message));
    } catch (error) {
        dispatch(authError(error.message || 'Network error'));
    }
};

export const logoutUser = () => (dispatch) => { dispatch(authLogout()); };

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/${address}/${id}`);
        if (result.data) dispatch(doneSuccess(result.data));
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.delete(`/${address}/${id}`);
        if (result.data.message) dispatch(getFailed(result.data.message));
        else dispatch(getDeleteSuccess());
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.put(`/${address}/${id}`, fields);
        if (result.data.schoolName) dispatch(authSuccess(result.data));
        else dispatch(doneSuccess(result.data));
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await api.post(`/${address}Create`, fields);
        if (result.data.message) dispatch(authFailed(result.data.message));
        else dispatch(entityAdded(result.data));
    } catch (error) {
        dispatch(authError(error.message || 'Network error'));
    }
};
