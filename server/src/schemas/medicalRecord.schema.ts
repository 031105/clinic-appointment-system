import { z } from 'zod';

export const createMedicalRecordSchema = z.object({
  body: z.object({
    appointmentId: z.string().or(z.number()).refine(val => !isNaN(Number(val)), {
      message: 'Appointment ID must be a valid number',
    }),
    patientId: z.string().or(z.number()).refine(val => !isNaN(Number(val)), {
      message: 'Patient ID must be a valid number',
    }),
    diagnosis: z.array(z.string()).min(1, 'At least one diagnosis is required'),
    symptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
    prescription: z.object({}).passthrough(), // Allow any structure for prescription data
    testResults: z.object({}).passthrough().optional(), // Optional test results
    notes: z.string().optional(),
    followUpDate: z.string().optional().refine(val => {
      if (!val) return true;
      return !isNaN(Date.parse(val));
    }, {
      message: 'Follow-up date must be a valid date string',
    }),
  }),
});

export const updateMedicalRecordSchema = z.object({
  params: z.object({
    id: z.string().refine(val => !isNaN(Number(val)), {
      message: 'Medical record ID must be a valid number',
    }),
  }),
  body: z.object({
    diagnosis: z.array(z.string()).optional(),
    symptoms: z.array(z.string()).optional(),
    prescription: z.object({}).passthrough().optional(),
    testResults: z.object({}).passthrough().optional(),
    notes: z.string().optional(),
    followUpDate: z.string().optional().refine(val => {
      if (!val) return true;
      return !isNaN(Date.parse(val));
    }, {
      message: 'Follow-up date must be a valid date string',
    }),
  }),
}); 