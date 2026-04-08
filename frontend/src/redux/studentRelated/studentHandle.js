import api from '../../utils/api';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    studentOperationDone,
} from './studentSlice';

export const getAllStudents = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/Students/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            // Handle both paginated { data: [...] } and plain array responses
            dispatch(getSuccess(result.data.data || result.data));
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const updateStudentFields = (id, fields, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.put(`/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(studentOperationDone());
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const removeStuff = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.put(`/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(studentOperationDone());
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};
