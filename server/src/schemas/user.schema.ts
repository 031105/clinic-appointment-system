import { z } from 'zod';

// Update profile schema
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    phone: z.string().optional(),
    address: z.record(z.any()).optional(),
    profileImage: z.string().optional(),
  }),
});

// Change password schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

// Update notification preferences schema
export const updateNotificationPreferencesSchema = z.object({
  body: z.object({
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    reminderTiming: z.number().min(1).max(72).optional(), // hours before appointment
    preferences: z.object({
      appointmentReminders: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
      newsUpdates: z.boolean().optional(),
    }).optional(),
  }),
}); 