import * as z from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name cannot exceed 100 characters"),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export const changeLoginPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password cannot be the same as the current password",
  path: ["newPassword"],
});

export type ChangeLoginPasswordFormValues = z.infer<typeof changeLoginPasswordSchema>;

export const changeMasterPasswordSchema = z.object({
  currentMasterPassword: z.string().min(1, "Current master password is required"),
  newMasterPassword: z
    .string()
    .min(8, "Master password must be at least 8 characters")
    .max(100, "Master password is too long")
    .regex(/[A-Z]/, "Master password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Master password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Master password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Master password must contain at least one special character"),
  confirmMasterPassword: z.string(),
}).refine((data) => data.newMasterPassword === data.confirmMasterPassword, {
  message: "Master passwords do not match",
  path: ["confirmMasterPassword"],
}).refine((data) => data.currentMasterPassword !== data.newMasterPassword, {
  message: "New master password cannot be the same as the current master password",
  path: ["newMasterPassword"],
});

export type ChangeMasterPasswordFormValues = z.infer<typeof changeMasterPasswordSchema>;
