import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    address: z.record(z.any()).optional(),
    roleName: z.enum(['admin', 'doctor', 'patient']),
    
    // Doctor specific fields (required if roleName is 'doctor')
    departmentId: z.string().optional(),
    specializations: z.array(z.string()).optional(),
    qualifications: z.record(z.any()).optional(),
    experienceYears: z.string().or(z.number()).optional(),
    consultationFee: z.string().or(z.number()).optional(),
    
    // Patient specific fields (required if roleName is 'patient')
    dateOfBirth: z.string().optional(),
    bloodGroup: z.string().optional(),
  })
  .refine(data => {
    if (data.roleName === 'doctor' && !data.departmentId) {
      return false;
    }
    return true;
  }, {
    message: 'Department ID is required for doctors',
    path: ['departmentId'],
  })
  .refine(data => {
    if (data.roleName === 'patient' && !data.dateOfBirth) {
      return false;
    }
    return true;
  }, {
    message: 'Date of birth is required for patients',
    path: ['dateOfBirth'],
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().refine(val => !isNaN(Number(val)), {
      message: 'User ID must be a valid number',
    }),
  }),
  body: z.object({
    status: z.enum(['active', 'inactive', 'suspended']),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    id: z.string().refine(val => !isNaN(Number(val)), {
      message: 'User ID must be a valid number',
    }),
  }),
  body: z.object({
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  }),
}); 