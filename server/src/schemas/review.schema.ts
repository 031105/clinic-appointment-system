import { z } from 'zod';

export const submitReviewSchema = z.object({
  body: z.object({
    appointmentId: z.string().or(z.number()).refine(val => !isNaN(Number(val)), {
      message: 'Appointment ID must be a valid number',
    }),
    rating: z.string().or(z.number()).refine(val => {
      const rating = Number(val);
      return !isNaN(rating) && rating >= 1 && rating <= 5;
    }, {
      message: 'Rating must be a number between 1 and 5',
    }),
    comment: z.string().optional(),
    isAnonymous: z.boolean().optional(),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().refine(val => !isNaN(Number(val)), {
      message: 'Review ID must be a valid number',
    }),
  }),
  body: z.object({
    rating: z.string().or(z.number()).refine(val => {
      const rating = Number(val);
      return !isNaN(rating) && rating >= 1 && rating <= 5;
    }, {
      message: 'Rating must be a number between 1 and 5',
    }).optional(),
    comment: z.string().optional(),
    isAnonymous: z.boolean().optional(),
  }),
}); 