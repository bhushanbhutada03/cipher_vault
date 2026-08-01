export interface RegisterRequest {
  fullName: string;
  email: string;
  loginPassword: string;
  masterPassword: string;
}

export interface RegisterResponse {
  message: string;
  success: boolean;
}

export interface LoginRequest {
  email: string;
  loginPassword: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}
