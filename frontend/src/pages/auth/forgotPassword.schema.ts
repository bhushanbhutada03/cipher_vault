import { z } from "zod";

export const requestOtpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 characters"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RequestOtpFormValues = z.infer<typeof requestOtpSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
