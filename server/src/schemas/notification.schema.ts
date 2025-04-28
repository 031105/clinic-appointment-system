import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  body: z.object({
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    reminderTiming: z.number().int().min(1).max(72).optional(),
    preferences: z.record(z.any()).optional(),
  }),
});

export const sendTestNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    type: z.enum(['appointment', 'reminder', 'system', 'other']).optional(),
  }),
}); 