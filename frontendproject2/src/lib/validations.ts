import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/,
    "Password must contain at least one special character",
  );

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
});
export const signupDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export const loginDefaultValues = {
  email: "",
  password: "",
};
export type SignupFormValues = z.infer<typeof signupSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export const forgotPasswordValues = {
  email: "",
};

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;




export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const resetPasswordValues = {
  newPassword: "",
  confirmPassword: "",
};

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
});

export const updateProfileDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
};

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;


export const otpSchema=z.object({
  otp:z
  .string()
  .length(6,'code must be exactly 6 digits.')
  .regex(/^\d{6}$/,'code must contain only numbers.')
})

export const otpDefaultValues={
  otp:""
}
export type OTPFormValues=z.infer<typeof otpSchema>