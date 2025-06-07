import { z } from 'zod';

// 创建用户的验证schema
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    role: z.enum(['admin', 'doctor'], {
      errorMap: () => ({ message: 'Role must be either admin or doctor' })
    }),
    doctorInfo: z.object({
      specialty: z.string().optional(),
      experience: z.number().min(0).optional(),
      consultation_fee: z.number().min(0).optional(),
      department_id: z.number().optional()
    }).optional()
  })
});

// 更新用户状态的验证schema
export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'inactive'], {
      errorMap: () => ({ message: 'Status must be either active or inactive' })
    })
  })
});

// 用户ID参数验证
export const userIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a valid number')
  })
});

// 查询参数验证
export const userQuerySchema = z.object({
  query: z.object({
    role: z.enum(['admin', 'doctor']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional()
  })
}); 