import api from '../../utils/api';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    postDone,
    doneSuccess
} from './teacherSlice';

export const getAllTeachers = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/Teachers/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data.data || result.data));
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const getTeacherDetails = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/Teacher/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await api.put(`/TeacherSubject`, { teacherId, teachSubject }, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};
