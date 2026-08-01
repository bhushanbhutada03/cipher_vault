import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/authApi";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "@/types/auth";
import type { ApiError } from "@/types/api";

export function useLoginMutation() {
  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: (payload) => authApi.login(payload),
  });
}

export function useRegisterMutation() {
  return useMutation<RegisterResponse, ApiError, RegisterRequest>({
    mutationFn: (payload) => authApi.register(payload),
  });
}

export function useForgotPasswordMutation() {
  return useMutation<{ message: string }, ApiError, ForgotPasswordRequest>({
    mutationFn: (payload) => authApi.forgotPassword(payload),
  });
}

export function useResendOtpMutation() {
  return useMutation<{ message: string }, ApiError, ForgotPasswordRequest>({
    mutationFn: (payload) => authApi.resendOtp(payload),
  });
}

export function useVerifyOtpMutation() {
  return useMutation<{ message: string }, ApiError, VerifyOtpRequest>({
    mutationFn: (payload) => authApi.verifyOtp(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation<{ message: string }, ApiError, ResetPasswordRequest>({
    mutationFn: (payload) => authApi.resetPassword(payload),
  });
}
