import { z } from 'zod';

export const getDoctorAppointmentsSchema = z.object({
  query: z.object({
    status: z.enum(['all', 'scheduled', 'completed', 'cancelled', 'no-show']).optional().default('all'),
    type: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});

export const getDoctorAppointmentByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Appointment ID must be a number'),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Appointment ID must be a number'),
  }),
  body: z.object({
    status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
    notes: z.string().optional(),
  }),
});

export const updateAppointmentNotesSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Appointment ID must be a number'),
  }),
  body: z.object({
    notes: z.string(),
  }),
}); 