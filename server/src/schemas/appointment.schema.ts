import { z } from 'zod';

// Create appointment schema
export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.number().int().positive('Doctor ID is required'),
    appointmentDateTime: z.string().refine(
      (val) => !isNaN(Date.parse(val)),
      {
        message: 'Invalid date time format',
      }
    ),
    duration: z.number().int().positive().optional(),
    type: z.string().min(1, 'Appointment type is required'),
    reason: z.string().optional(),
    symptoms: z.array(z.string()).optional(),
  }),
});

// Get appointments query schema
export const getAppointmentsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
    startDate: z.string().datetime('Invalid datetime format').optional(),
    endDate: z.string().datetime('Invalid datetime format').optional(),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    }
    return true;
  }, {
    message: 'End date must be after start date',
    path: ['endDate'],
  }),
});

// Update appointment status schema
export const updateAppointmentStatusSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => !isNaN(Number(val)), {
      message: 'Appointment ID must be a valid number',
    }),
  }),
  body: z.object({
    status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
    cancellationReason: z.string().optional(),
  }),
}); 