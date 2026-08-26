import { z } from "zod"

const newPasswordSchema = z.string().min(12, "Password must be at least 12 characters.")

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("A valid email address is required."),
}).strict()

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required."),
  password: newPasswordSchema,
}).strict()

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: newPasswordSchema,
}).strict()

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
