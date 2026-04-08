import api from '../../utils/api';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './noticeSlice';

export const getAllNotices = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/${address}List/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data.data || result.data));
        }
    } catch (error) {
        dispatch(getError(error.message || 'An error occurred'));
    }
};
