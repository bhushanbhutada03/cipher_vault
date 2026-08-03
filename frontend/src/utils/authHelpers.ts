import type { ApiError } from "@/types/api";

export function isEmailNotVerifiedError(error: ApiError): boolean {
  return error.status === 400 && error.message === "Please verify your email before logging in.";
}
