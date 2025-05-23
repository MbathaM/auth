import axios from "redaxios";
import { atomWithStorage } from "jotai/utils";
import { getDefaultStore } from "jotai";
import type {
  SignupParams,
  LoginParams,
  VerifyParams,
  ForgotPasswordParams,
  ResetPasswordParams,
  User,
  Data,
} from "./types";

export const tokenAtom = atomWithStorage<string | null>("auth_token", null);
const store = getDefaultStore(); // Used outside React components

const API_URL = "http://localhost:3000";
const BASE_PATH = "/api/auth/";

// --- API Calls ---
async function signup(
  params: SignupParams
): Promise<{ message?: string; user?: User; error?: string; status: number }> {
  try {
    const res = await axios.post(`${API_URL}${BASE_PATH}signup`, params);
    return { message: res.data.message, user: res.data.user, status: res.status };
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message || "Failed to register user";
    return { error: msg, status: err?.response?.status || 500 };
  }
}

async function login(
  params: LoginParams
): Promise<{ message?: string; token?: string; error?: string; status: number }> {
  try {
    const res = await axios.post(`${API_URL}${BASE_PATH}login`, params);
    const { token } = res.data;
    store.set(tokenAtom, token);
    return { message: res.data.message, token, status: res.status };
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message || "Failed to login";
    return { error: msg, status: err?.response?.status || 500 };
  }
}

async function verify(
  params: VerifyParams
): Promise<{ message?: string; error?: string; status: number }> {
  try {
    const res = await axios.post(`${API_URL}${BASE_PATH}verify`, params);
    return { message: res.data.message, status: res.status };
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message || "Failed to verify";
    return { error: msg, status: err?.response?.status || 500 };
  }
}

async function forgotPassword(
  params: ForgotPasswordParams
): Promise<{ message?: string; error?: string; status: number }> {
  try {
    const res = await axios.post(
      `${API_URL}${BASE_PATH}forgot-password`,
      params
    );
    return { message: res.data.message, status: res.status };
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message || "Failed to process request";
    return { error: msg, status: err?.response?.status || 500 };
  }
}

async function resetPassword(
  params: ResetPasswordParams
): Promise<{ message?: string; error?: string; status: number }> {
  try {
    const res = await axios.post(
      `${API_URL}${BASE_PATH}reset-password`,
      params
    );
    return { message: res.data.message, status: res.status };
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message || "Failed to reset password";
    return { error: msg, status: err?.response?.status || 500 };
  }
}

async function getSession(): Promise<{ data?: Data; error?: string; status: number }> {
  try {
    const token = store.get(tokenAtom);
    const res = await axios.post(
      `${API_URL}${BASE_PATH}get-session`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { data: res.data.data, status: res.status };
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message;
    return { error: msg, status: err?.response?.status || 500 };
  }
}

async function logout(): Promise<{ message?: string; error?: string; status: number }> {
  try {
    const token = store.get(tokenAtom);
    const res = await axios.post(
      `${API_URL}${BASE_PATH}logout`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    store.set(tokenAtom, null);
    return { message: res.data.message, status: res.status };
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message || "Failed to logout";
    return { error: msg, status: err?.response?.status || 500 };
  }
}

export { signup, login, verify, forgotPassword, resetPassword, getSession, logout };
