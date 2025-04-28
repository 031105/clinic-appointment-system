import { z } from 'zod';

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Department name must be at least 2 characters'),
    description: z.string().optional(),
    location: z.string().optional(),
    contactNumber: z.string().optional(),
    headDoctorId: z.number().int().optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().refine(val => !isNaN(Number(val)), {
      message: 'Department ID must be a valid number',
    }),
  }),
  body: z.object({
    name: z.string().min(2, 'Department name must be at least 2 characters').optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    contactNumber: z.string().optional(),
    headDoctorId: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
}); 