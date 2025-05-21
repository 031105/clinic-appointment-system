import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        confirmPassword: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        role: z.ZodEnum<["patient", "doctor"]>;
        doctorInfo: z.ZodOptional<z.ZodObject<{
            specializations: z.ZodArray<z.ZodString, "many">;
            qualifications: z.ZodArray<z.ZodString, "many">;
            experienceYears: z.ZodNumber;
            departmentId: z.ZodNumber;
            consultationFee: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            specializations: string[];
            qualifications: string[];
            experienceYears: number;
            departmentId: number;
            consultationFee: number;
        }, {
            specializations: string[];
            qualifications: string[];
            experienceYears: number;
            departmentId: number;
            consultationFee: number;
        }>>;
        patientInfo: z.ZodOptional<z.ZodObject<{
            dateOfBirth: z.ZodString;
            bloodGroup: z.ZodOptional<z.ZodString>;
            height: z.ZodOptional<z.ZodNumber>;
            weight: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            dateOfBirth: string;
            bloodGroup?: string | undefined;
            height?: number | undefined;
            weight?: number | undefined;
        }, {
            dateOfBirth: string;
            bloodGroup?: string | undefined;
            height?: number | undefined;
            weight?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        password: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "doctor" | "patient";
        confirmPassword: string;
        phone?: string | undefined;
        doctorInfo?: {
            specializations: string[];
            qualifications: string[];
            experienceYears: number;
            departmentId: number;
            consultationFee: number;
        } | undefined;
        patientInfo?: {
            dateOfBirth: string;
            bloodGroup?: string | undefined;
            height?: number | undefined;
            weight?: number | undefined;
        } | undefined;
    }, {
        password: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "doctor" | "patient";
        confirmPassword: string;
        phone?: string | undefined;
        doctorInfo?: {
            specializations: string[];
            qualifications: string[];
            experienceYears: number;
            departmentId: number;
            consultationFee: number;
        } | undefined;
        patientInfo?: {
            dateOfBirth: string;
            bloodGroup?: string | undefined;
            height?: number | undefined;
            weight?: number | undefined;
        } | undefined;
    }>, {
        password: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "doctor" | "patient";
        confirmPassword: string;
        phone?: string | undefined;
        doctorInfo?: {
            specializations: string[];
            qualifications: string[];
            experienceYears: number;
            departmentId: number;
            consultationFee: number;
        } | undefined;
        patientInfo?: {
            dateOfBirth: string;
            bloodGroup?: string | undefined;
            height?: number | undefined;
            weight?: number | undefined;
        } | undefined;
    }, {
        password: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "doctor" | "patient";
        confirmPassword: string;
        phone?: string | undefined;
        doctorInfo?: {
            specializations: string[];
            qualifications: string[];
            experienceYears: number;
            departmentId: number;
            consultationFee: number;
        } | undefined;
        patientInfo?: {
            dateOfBirth: string;
            bloodGroup?: string | undefined;
            height?: number | undefined;
            weight?: number | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "doctor" | "patient";
        confirmPassword: string;
        phone?: string | undefined;
        doctorInfo?: {
            specializations: string[];
            qualifications: string[];
            experienceYears: number;
            departmentId: number;
            consultationFee: number;
        } | undefined;
        patientInfo?: {
            dateOfBirth: string;
            bloodGroup?: string | undefined;
            height?: number | undefined;
            weight?: number | undefined;
        } | undefined;
    };
}, {
    body: {
        password: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "doctor" | "patient";
        confirmPassword: string;
        phone?: string | undefined;
        doctorInfo?: {
            specializations: string[];
            qualifications: string[];
            experienceYears: number;
            departmentId: number;
            consultationFee: number;
        } | undefined;
        patientInfo?: {
            dateOfBirth: string;
            bloodGroup?: string | undefined;
            height?: number | undefined;
            weight?: number | undefined;
        } | undefined;
    };
}>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        rememberMe: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        password: string;
        email: string;
        rememberMe?: boolean | undefined;
    }, {
        password: string;
        email: string;
        rememberMe?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        email: string;
        rememberMe?: boolean | undefined;
    };
}, {
    body: {
        password: string;
        email: string;
        rememberMe?: boolean | undefined;
    };
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    body: z.ZodObject<{
        refreshToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        refreshToken: string;
    }, {
        refreshToken: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        refreshToken: string;
    };
}, {
    body: {
        refreshToken: string;
    };
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
    };
}, {
    body: {
        email: string;
    };
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        token: z.ZodString;
        password: z.ZodString;
        confirmPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        token: string;
        confirmPassword: string;
    }, {
        password: string;
        token: string;
        confirmPassword: string;
    }>, {
        password: string;
        token: string;
        confirmPassword: string;
    }, {
        password: string;
        token: string;
        confirmPassword: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        token: string;
        confirmPassword: string;
    };
}, {
    body: {
        password: string;
        token: string;
        confirmPassword: string;
    };
}>;
export declare const changePasswordSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
        confirmNewPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    }, {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    }>, {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    }, {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    };
}, {
    body: {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    };
}>;
