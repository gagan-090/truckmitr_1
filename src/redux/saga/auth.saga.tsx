import { call, put, takeLatest } from "redux-saga/effects";
import { COUNTRIES_LIST_ACTION, COUNTRIES_LIST, CIRCLE_LOADING, PHONE_SEND_OTP_ACTION, PHONE_SIGNUP_ACTION, PHONE_SIGNUP_LOADING, PHONE_VERIFY_OTP_ACTION, SEND_OTP_LOADING, SOCIAL_LOGIN_ACTION, SOCIAL_SIGNUP_ACTION, VERIFY_OTP_LOADING } from "@ollnine/redux/actions/types";
import axios from "@ollnine/lib/axios/index";
import { showToast } from "@ollnine/hooks/toast";
import { AxiosResponse } from "axios";
import { navigate, replace } from "@ollnine/stacks/navigation";
import { STACKS } from "@ollnine/stacks/stacks";
import { END_POINTS } from "@ollnine/utils/config";

interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    error: string,
    redirect: string
}

function* countriesList(): Generator<any, AxiosResponse<ApiResponse>, any> {
    return yield axios.get(END_POINTS.COUNTRIES_LIST);
}

export function* countriesListSaga(): Generator {
    try {
        const response: AxiosResponse<ApiResponse> = yield call(countriesList);
        yield put({ type: COUNTRIES_LIST, payload: response?.data?.data });
    } catch (error) {
        console.log(error)
    }
}

function* phoneSendOtp(payload: any): Generator<any, AxiosResponse<ApiResponse>, any> {
    let formData = new FormData()
    Object.keys(payload).forEach(element => {
        formData.append(element, payload[element])
    });
    return yield axios.post(END_POINTS.PHONE_SEND_OTP, formData)
}

export function* phoneSendOtpSaga(action: any): Generator<any, void, any> {
    try {
        yield put({ type: SEND_OTP_LOADING, payload: true });
        const response: AxiosResponse<ApiResponse> = yield call(phoneSendOtp, action.payload);
        yield put({ type: SEND_OTP_LOADING, payload: false });
        showToast(response?.data?.error || response?.data?.message)
        if (response?.data?.success) {
            action.payload?.resend ? replace(STACKS.OTP, action.payload) : navigate(STACKS.OTP, action.payload)
        }
    } catch (error) {
        yield put({ type: SEND_OTP_LOADING, payload: false });
    }
}

function* phoneVerifyOtp(payload: any): Generator<any, AxiosResponse<ApiResponse>, any> {
    let formData = new FormData()
    Object.keys(payload).forEach(element => {
        formData.append(element, payload[element])
    });
    return yield axios.post(END_POINTS.PHONE_VERIFY_OTP, formData)
}

export function* phoneVerifyOtpSaga(action: any): Generator<any, void, any> {
    try {
        yield put({ type: VERIFY_OTP_LOADING, payload: true });
        const response: AxiosResponse<ApiResponse> = yield call(phoneVerifyOtp, action.payload);
        yield put({ type: VERIFY_OTP_LOADING, payload: false });
        showToast(response?.data?.error || response?.data?.message)
        if (response?.data?.success) {
            if (response?.data?.redirect === `NAME_SCREEN`) {
                navigate(STACKS.NAME, action?.payload)
            } else if (response?.data?.redirect === `MAIN_SCREEN`) {
                navigate(STACKS.MAIN)
            }
        }
    } catch (error) {
        yield put({ type: VERIFY_OTP_LOADING, payload: false });
    }
}

function* phoneSignup(payload: any): Generator<any, AxiosResponse<ApiResponse>, any> {
    let formData = new FormData()
    Object.keys(payload).forEach(element => {
        formData.append(element, payload[element])
    });
    return yield axios.post(END_POINTS.PHONE_SIGNUP, formData)
}

export function* phoneSignupSaga(action: any): Generator<any, void, any> {
    try {
        yield put({ type: PHONE_SIGNUP_LOADING, payload: true });
        const response: AxiosResponse<ApiResponse> = yield call(phoneSignup, action.payload);
        yield put({ type: PHONE_SIGNUP_LOADING, payload: false });
        showToast(response?.data?.error || response?.data?.message)
        if (response?.data?.success) {
            navigate(STACKS.MAIN)
        }
    } catch (error) {
        yield put({ type: PHONE_SIGNUP_LOADING, payload: false });
    }
}

function* socialLogin(payload: any): Generator<any, AxiosResponse<ApiResponse>, any> {
    let formData = new FormData()
    Object.keys(payload).forEach(element => {
        formData.append(element, payload[element])
    });
    return yield axios.post(END_POINTS.SOCIAL_LOGIN, formData)
}

export function* socialLoginSaga(action: any): Generator<any, void, any> {
    try {
        yield put({ type: CIRCLE_LOADING, payload: true });
        const response: AxiosResponse<ApiResponse> = yield call(socialLogin, action.payload);
        yield put({ type: CIRCLE_LOADING, payload: false });
        if (response?.data?.success) {
            if (response?.data?.redirect === `MAIN_SCREEN`) {
                setTimeout(() => {
                    navigate(STACKS.MAIN)
                }, 10);
            }
        } else {
            if (response?.data?.redirect === `GENDER_SCREEN`) {
                setTimeout(() => {
                    navigate(STACKS.GENDER, action?.payload)
                }, 10);
            }
            showToast(response?.data?.error || response?.data?.message)
        }
    } catch (error) {
        yield put({ type: CIRCLE_LOADING, payload: false });
    }
}

function* socialSignup(payload: any): Generator<any, AxiosResponse<ApiResponse>, any> {
    let formData = new FormData()
    Object.keys(payload).forEach(element => {
        formData.append(element, payload[element])
    });
    return yield axios.post(END_POINTS.SOCIAL_SIGNUP, formData)
}

export function* socialSignupSaga(action: any): Generator<any, void, any> {
    try {
        yield put({ type: PHONE_SIGNUP_LOADING, payload: true });
        const response: AxiosResponse<ApiResponse> = yield call(socialSignup, action.payload);
        yield put({ type: PHONE_SIGNUP_LOADING, payload: false });
        if (response?.data?.success) {
            if (response?.data?.redirect === `MAIN_SCREEN`) {
                navigate(STACKS.MAIN)
            }
        }
        showToast(response?.data?.error || response?.data?.message)
    } catch (error) {
        yield put({ type: PHONE_SIGNUP_LOADING, payload: false });
    }
}

export function* authSaga(): Generator<any, void, any> {
    yield takeLatest(COUNTRIES_LIST_ACTION, countriesListSaga)
    yield takeLatest(PHONE_SEND_OTP_ACTION, phoneSendOtpSaga);
    yield takeLatest(PHONE_VERIFY_OTP_ACTION, phoneVerifyOtpSaga),
        yield takeLatest(PHONE_SIGNUP_ACTION, phoneSignupSaga),
        yield takeLatest(SOCIAL_LOGIN_ACTION, socialLoginSaga),
        yield takeLatest(SOCIAL_SIGNUP_ACTION, socialSignupSaga)
}

export default authSaga;
