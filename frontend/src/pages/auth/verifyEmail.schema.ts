import { z } from "zod";

export const verifyEmailSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 characters"),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
