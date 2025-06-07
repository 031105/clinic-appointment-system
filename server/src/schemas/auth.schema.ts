import { z } from 'zod';

// Common fields
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must be at most 255 characters');

// Register schema
export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional(),
    role: z.enum(['patient', 'doctor']),
    // Additional fields for doctors
    doctorInfo: z
      .object({
        specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
        qualifications: z.array(z.string()).min(1, 'At least one qualification is required'),
        experienceYears: z.number().min(0),
        departmentId: z.number(),
        consultationFee: z.number().min(0),
      })
      .optional(),
    // Additional fields for patients
    patientInfo: z
      .object({
        dateOfBirth: z.string(),
        bloodGroup: z.string().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
      })
      .optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),
});

// Login schema
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string(),
    rememberMe: z.boolean().optional(),
  }),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    password: passwordSchema,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),
});

// Change password schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  }),
});

// OTP verification schema
export const verifyOTPSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only numbers'),
    type: z.enum(['registration', 'password_reset'], {
      errorMap: () => ({ message: 'Type must be either registration or password_reset' })
    }),
  }),
});

// Resend OTP schema
export const resendOTPSchema = z.object({
  body: z.object({
    email: emailSchema,
    type: z.enum(['registration', 'password_reset'], {
      errorMap: () => ({ message: 'Type must be either registration or password_reset' })
    }),
  }),
});

// Initial registration schema (before OTP verification)
export const initialRegisterSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional(),
    role: z.enum(['patient', 'doctor']),
    // Additional fields for doctors
    doctorInfo: z
      .object({
        specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
        qualifications: z.array(z.string()).min(1, 'At least one qualification is required'),
        experienceYears: z.number().min(0),
        departmentId: z.number(),
        consultationFee: z.number().min(0),
      })
      .optional(),
    // Additional fields for patients
    patientInfo: z
      .object({
        dateOfBirth: z.string(),
        bloodGroup: z.string().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
      })
      .optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),
});

// Reset password with temporary password schema
export const resetPasswordWithTempSchema = z.object({
  body: z.object({
    email: emailSchema,
    tempPassword: z.string(),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  }),
}); 