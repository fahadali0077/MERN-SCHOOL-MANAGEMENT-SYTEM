import axios from 'axios';
import { authRequest, stuffAdded, authSuccess, authFailed, authError, authLogout, doneSuccess, getDeleteSuccess, getRequest, getFailed, getError } from './userSlice';

const BASE = process.env.REACT_APP_BASE_URL;

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await axios.post(`${BASE}/${role}Login`, fields);
        if (result.data.role) dispatch(authSuccess(result.data));
        else dispatch(authFailed(result.data.message));
    } catch (error) { dispatch(authError(error)); }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await axios.post(`${BASE}/${role}Reg`, fields);
        if (result.data.schoolName) dispatch(authSuccess(result.data));
        else if (result.data.school) dispatch(stuffAdded());
        else dispatch(authFailed(result.data.message));
    } catch (error) { dispatch(authError(error)); }
};

export const guestLoginUser = (role) => async (dispatch) => {
    dispatch(authRequest());
    let fields;
    if (role === 'Admin')   fields = { email: 'yogendra@12', password: 'zxc' };
    else if (role === 'Student') fields = { rollNum: '1', studentName: 'Dipesh Awasthi', password: 'zxc' };
    else if (role === 'Teacher') fields = { email: 'tony@12', password: 'zxc' };
    try {
        const result = await axios.post(`${BASE}/${role}Login`, fields);
        if (result.data.role) dispatch(authSuccess(result.data));
        else dispatch(authFailed(result.data.message));
    } catch (error) { dispatch(authError(error)); }
};

export const logoutUser = () => (dispatch) => { dispatch(authLogout()); };

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${BASE}/${address}/${id}`);
        if (result.data) dispatch(doneSuccess(result.data));
    } catch (error) { dispatch(getError(error)); }
};

export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.delete(`${BASE}/${address}/${id}`);
        if (result.data.message) dispatch(getFailed(result.data.message));
        else dispatch(getDeleteSuccess());
    } catch (error) { dispatch(getError(error)); }
};

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.put(`${BASE}/${address}/${id}`, fields);
        if (result.data.schoolName) dispatch(authSuccess(result.data));
        else dispatch(doneSuccess(result.data));
    } catch (error) { dispatch(getError(error)); }
};

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await axios.post(`${BASE}/${address}Create`, fields);
        if (result.data.message) dispatch(authFailed(result.data.message));
        else dispatch(stuffAdded(result.data));
    } catch (error) { dispatch(authError(error)); }
};
