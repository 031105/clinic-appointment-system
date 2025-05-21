import { z } from 'zod';
export declare const getDoctorsSchema: z.ZodObject<{
    query: z.ZodObject<{
        departmentId: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        offset: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        limit?: string | undefined;
        offset?: string | undefined;
        departmentId?: string | undefined;
    }, {
        limit?: string | undefined;
        offset?: string | undefined;
        departmentId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit?: string | undefined;
        offset?: string | undefined;
        departmentId?: string | undefined;
    };
}, {
    query: {
        limit?: string | undefined;
        offset?: string | undefined;
        departmentId?: string | undefined;
    };
}>;
export declare const getPatientAppointmentsSchema: z.ZodObject<{
    query: z.ZodObject<{
        status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["upcoming", "past", "all"]>>>;
        limit: z.ZodOptional<z.ZodString>;
        offset: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "all" | "upcoming" | "past";
        limit?: string | undefined;
        offset?: string | undefined;
    }, {
        limit?: string | undefined;
        offset?: string | undefined;
        status?: "all" | "upcoming" | "past" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        status: "all" | "upcoming" | "past";
        limit?: string | undefined;
        offset?: string | undefined;
    };
}, {
    query: {
        limit?: string | undefined;
        offset?: string | undefined;
        status?: "all" | "upcoming" | "past" | undefined;
    };
}>;
