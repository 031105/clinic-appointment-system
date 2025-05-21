"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Common fields
const passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
const emailSchema = zod_1.z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters');
// Register schema
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: zod_1.z.string(),
        firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters'),
        lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters'),
        phone: zod_1.z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
            .optional(),
        role: zod_1.z.enum(['patient', 'doctor']),
        // Additional fields for doctors
        doctorInfo: zod_1.z
            .object({
            specializations: zod_1.z.array(zod_1.z.string()).min(1, 'At least one specialization is required'),
            qualifications: zod_1.z.array(zod_1.z.string()).min(1, 'At least one qualification is required'),
            experienceYears: zod_1.z.number().min(0),
            departmentId: zod_1.z.number(),
            consultationFee: zod_1.z.number().min(0),
        })
            .optional(),
        // Additional fields for patients
        patientInfo: zod_1.z
            .object({
            dateOfBirth: zod_1.z.string(),
            bloodGroup: zod_1.z.string().optional(),
            height: zod_1.z.number().optional(),
            weight: zod_1.z.number().optional(),
        })
            .optional(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    }),
});
// Login schema
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: emailSchema,
        password: zod_1.z.string(),
        rememberMe: zod_1.z.boolean().optional(),
    }),
});
// Refresh token schema
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string(),
    }),
});
// Forgot password schema
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: emailSchema,
    }),
});
// Reset password schema
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string(),
        password: passwordSchema,
        confirmPassword: zod_1.z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    }),
});
// Change password schema
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string(),
        newPassword: passwordSchema,
        confirmNewPassword: zod_1.z.string(),
    }).refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "Passwords don't match",
        path: ['confirmNewPassword'],
    }),
});
//# sourceMappingURL=auth.schema.js.map