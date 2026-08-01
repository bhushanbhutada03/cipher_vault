import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Enter your full name"),
    email: z
      .string()
      .min(1, "Enter your email address")
      .email("Enter a valid email address"),
    loginPassword: z
      .string()
      .min(8, "Login password must be at least 8 characters"),
    masterPassword: z
      .string()
      .min(8, "Master password must be at least 8 characters"),
    confirmMasterPassword: z.string().min(1, "Confirm your master password"),
  })
  .refine((data) => data.masterPassword === data.confirmMasterPassword, {
    message: "Master passwords do not match",
    path: ["confirmMasterPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
