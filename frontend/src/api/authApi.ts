import { axiosInstance } from "@/api/axiosInstance";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "@/types/auth";

export const authApi = {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await axiosInstance.post<RegisterResponse>(
      "/api/auth/register",
      payload
    );
    return data;
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await axiosInstance.post<LoginResponse>(
      "/api/auth/login",
      payload
    );
    return data;
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>(
      "/api/auth/forgot-password",
      payload
    );
    return data;
  },

  async resendOtp(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>(
      "/api/auth/forgot-password/resend-otp",
      payload
    );
    return data;
  },

  async verifyOtp(payload: VerifyOtpRequest): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>(
      "/api/auth/verify-otp",
      payload
    );
    return data;
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>(
      "/api/auth/reset-password",
      payload
    );
    return data;
  },
};
