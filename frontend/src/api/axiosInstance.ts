import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/constants/env";
import { tokenService } from "@/services/tokenService";
import { authEvents } from "@/services/authEvents";
import type { ApiError } from "@/types/api";

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/verify-otp",
  "/api/auth/reset-password",
];

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const isPublic = PUBLIC_PATHS.some((path) => config.url?.startsWith(path));
  if (!isPublic) {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      error?: string;
      message?: string;
      messages?: Record<string, string>;
      remainingSeconds?: number;
      remainingAttempts?: number;
    }>
  ) => {
    const status = error.response?.status ?? 0;
    const isPublic = PUBLIC_PATHS.some((path) =>
      error.config?.url?.startsWith(path)
    );
    const responseData = error.response?.data;

    if (status === 401 && !isPublic) {
      tokenService.clearToken();
      authEvents.emit("session-expired");
    }

    const apiError: ApiError = {
      status,
      error: responseData?.error,
      message:
        responseData?.message ??
        responseData?.messages?.[Object.keys(responseData.messages)[0]] ??
        error.message ??
        "Something went wrong. Please try again.",
      fieldErrors: responseData?.messages,
      remainingSeconds: responseData?.remainingSeconds,
      remainingAttempts: responseData?.remainingAttempts,
    };

    return Promise.reject(apiError);
  }
);
