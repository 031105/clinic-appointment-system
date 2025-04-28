import { z } from 'zod';

// Schedule schema
const scheduleItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  breakStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional(),
  breakEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional(),
  slotDuration: z.number().int().min(10).max(120).default(30),
});

// Update schedule schema
export const updateScheduleSchema = z.object({
  body: z.object({
    schedules: z.array(scheduleItemSchema),
  }),
});

// Add unavailable time schema
export const addUnavailableTimeSchema = z.object({
  body: z.object({
    startDateTime: z.string().refine(
      (val) => !isNaN(Date.parse(val)),
      {
        message: 'Invalid date time format',
      }
    ),
    endDateTime: z.string().refine(
      (val) => !isNaN(Date.parse(val)),
      {
        message: 'Invalid date time format',
      }
    ),
    reason: z.string().optional(),
  }).refine((data) => {
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);
    return end > start;
  }, {
    message: 'End date time must be after start date time',
    path: ['endDateTime'],
  }),
});

// Get schedule query schema
export const getScheduleQuerySchema = z.object({
  query: z.object({
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