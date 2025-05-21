import { z } from 'zod';

// 查询参数schema
export const getDoctorsSchema = z.object({
  query: z.object({
    departmentId: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});

export const getPatientAppointmentsSchema = z.object({
  query: z.object({
    status: z.enum(['upcoming', 'past', 'all']).optional().default('all'),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
}); 