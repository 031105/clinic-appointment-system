import { z } from 'zod';

export const updatePatientProfileSchema = z.object({
  body: z.object({
    height: z.number().optional(),
    weight: z.number().optional(),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    medicalHistory: z.string().optional(),
  }),
});

export const addAllergySchema = z.object({
  body: z.object({
    allergyName: z.string().min(1, 'Allergy name is required'),
    severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
    reaction: z.string().min(1, 'Reaction description is required'),
    notes: z.string().optional(),
  }),
});

export const updateAllergySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    allergyName: z.string().optional(),
    severity: z.enum(['MILD', 'MODERATE', 'SEVERE']).optional(),
    reaction: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const addEmergencyContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    isPrimary: z.boolean().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateEmergencyContactSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phoneNumber: z.string().optional(),
    isPrimary: z.boolean().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
}); 