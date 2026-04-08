import api from '../../utils/api';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getStudentsSuccess,
    detailsSuccess,
    getFailedTwo,
    getSubjectsSuccess,
    getSubDetailsSuccess,
    getSubDetailsRequest
} from './sclassSlice';

export const getAllSclasses = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/${address}List/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getSuccess(result.data.data || result.data));
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const getClassStudents = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/Sclass/Students/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getStudentsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const getClassDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/${address}/${id}`);
        if (result.data) {
            dispatch(detailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const getSubjectList = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const getTeacherFreeClassSubjects = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/FreeSubjectList/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};

export const getSubjectDetails = (id, address) => async (dispatch) => {
    dispatch(getSubDetailsRequest());
    try {
        const result = await api.get(`/${address}/${id}`);
        if (result.data) {
            dispatch(getSubDetailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};
