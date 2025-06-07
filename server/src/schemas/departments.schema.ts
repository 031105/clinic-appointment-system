import { z } from 'zod';

// ================================
// 基础类型验证
// ================================

// 部门ID参数验证
export const departmentIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Department ID must be a number').transform(Number)
  })
});

// 部门和服务ID参数验证
export const serviceIdParamSchema = z.object({
  params: z.object({
    departmentId: z.string().regex(/^\d+$/, 'Department ID must be a number').transform(Number),
    serviceId: z.string().regex(/^\d+$/, 'Service ID must be a number').transform(Number)
  })
});

// ================================
// 部门相关验证
// ================================

// 创建部门验证
export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Department name cannot be empty')
      .max(100, 'Department name cannot exceed 100 characters')
      .trim(),
    description: z.string()
      .max(500, 'Department description cannot exceed 500 characters')
      .optional(),
    emoji_icon: z.string()
      .max(10, 'Icon cannot exceed 10 characters')
      .optional(),
    head_doctor_id: z.number()
      .int('Doctor ID must be an integer')
      .positive('Doctor ID must be positive')
      .optional()
  })
});

// 更新部门验证
export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Department ID must be a number').transform(Number)
  }),
  body: z.object({
    name: z.string()
      .min(1, 'Department name cannot be empty')
      .max(100, 'Department name cannot exceed 100 characters')
      .trim()
      .optional(),
    description: z.string()
      .max(500, 'Department description cannot exceed 500 characters')
      .optional(),
    emoji_icon: z.string()
      .max(10, 'Icon cannot exceed 10 characters')
      .optional(),
    head_doctor_id: z.number()
      .int('Doctor ID must be an integer')
      .positive('Doctor ID must be positive')
      .optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )
});

// ================================
// 服务相关验证
// ================================

// 创建服务验证
export const createServiceSchema = z.object({
  params: z.object({
    departmentId: z.string().regex(/^\d+$/, 'Department ID must be a number').transform(Number)
  }),
  body: z.object({
    name: z.string()
      .min(1, 'Service name cannot be empty')
      .max(100, 'Service name cannot exceed 100 characters')
      .trim(),
    description: z.string()
      .max(500, 'Service description cannot exceed 500 characters')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .max(99999.99, 'Price cannot exceed 99999.99'),
    duration: z.number()
      .int('Duration must be an integer')
      .min(5, 'Duration must be at least 5 minutes')
      .max(480, 'Duration cannot exceed 8 hours')
  })
});

// 更新服务验证
export const updateServiceSchema = z.object({
  params: z.object({
    departmentId: z.string().regex(/^\d+$/, 'Department ID must be a number').transform(Number),
    serviceId: z.string().regex(/^\d+$/, 'Service ID must be a number').transform(Number)
  }),
  body: z.object({
    name: z.string()
      .min(1, 'Service name cannot be empty')
      .max(100, 'Service name cannot exceed 100 characters')
      .trim()
      .optional(),
    description: z.string()
      .max(500, 'Service description cannot exceed 500 characters')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .max(99999.99, 'Price cannot exceed 99999.99')
      .optional(),
    duration: z.number()
      .int('Duration must be an integer')
      .min(5, 'Duration must be at least 5 minutes')
      .max(480, 'Duration cannot exceed 8 hours')
      .optional()
  }).partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )
});

// 删除服务验证
export const deleteServiceSchema = z.object({
  params: z.object({
    departmentId: z.string().regex(/^\d+$/, 'Department ID must be a number').transform(Number),
    serviceId: z.string().regex(/^\d+$/, 'Service ID must be a number').transform(Number)
  })
});

// ================================
// 查询相关验证
// ================================

// 部门统计信息验证
export const departmentStatsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Department ID must be a number').transform(Number)
  })
});

// 部门服务列表验证
export const departmentServicesSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Department ID must be a number').transform(Number)
  })
});

// ================================
// 类型导出
// ================================

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>['body'];
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>['body'];
export type CreateServiceInput = z.infer<typeof createServiceSchema>['body'];
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>['body']; 