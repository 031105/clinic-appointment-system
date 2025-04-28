import { api } from './httpClient';
import { User } from './userService';
import { Department } from './doctorService';

// 用户管理参数
export interface UserManagementParams {
  page?: number;
  limit?: number;
  role?: 'admin' | 'doctor' | 'patient';
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// 系统统计数据
export interface SystemStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  newUsersThisMonth: number;
  newDoctorsThisMonth: number;
  appointmentsThisMonth: number;
  appointmentStatusDistribution: {
    scheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
}

// 科室管理请求
export interface DepartmentRequest {
  name: string;
  description?: string;
}

// 管理员服务
export const adminService = {
  /**
   * 获取用户列表 (仅管理员)
   * @param params 查询参数
   * @returns 用户列表及分页信息
   */
  getUsers: async (params?: UserManagementParams): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    return await api.get<{
      users: User[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/admin/users', params);
  },
  
  /**
   * 通过ID获取用户 (仅管理员)
   * @param id 用户ID
   * @returns 用户信息
   */
  getUserById: async (id: number): Promise<User> => {
    return await api.get<User>(`/admin/users/${id}`);
  },
  
  /**
   * 更新用户信息 (仅管理员)
   * @param id 用户ID
   * @param userData 用户数据
   * @returns 更新后的用户信息
   */
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    return await api.patch<User>(`/admin/users/${id}`, userData);
  },
  
  /**
   * 停用用户账户 (仅管理员)
   * @param id 用户ID
   */
  deactivateUser: async (id: number): Promise<void> => {
    await api.patch(`/admin/users/${id}/deactivate`);
  },
  
  /**
   * 激活用户账户 (仅管理员)
   * @param id 用户ID
   */
  activateUser: async (id: number): Promise<void> => {
    await api.patch(`/admin/users/${id}/activate`);
  },
  
  /**
   * 获取系统统计数据 (仅管理员)
   * @returns 系统统计数据
   */
  getSystemStats: async (): Promise<SystemStats> => {
    return await api.get<SystemStats>('/admin/stats');
  },
  
  /**
   * 获取每月用户注册统计
   * @param year 年份
   * @returns 月度用户注册统计
   */
  getUserRegistrationStats: async (year: number): Promise<{
    months: string[];
    patients: number[];
    doctors: number[];
  }> => {
    return await api.get<{
      months: string[];
      patients: number[];
      doctors: number[];
    }>('/admin/stats/user-registrations', { year });
  },
  
  /**
   * 获取每月预约统计
   * @param year 年份
   * @returns 月度预约统计
   */
  getAppointmentStats: async (year: number): Promise<{
    months: string[];
    scheduled: number[];
    completed: number[];
    cancelled: number[];
    noShow: number[];
  }> => {
    return await api.get<{
      months: string[];
      scheduled: number[];
      completed: number[];
      cancelled: number[];
      noShow: number[];
    }>('/admin/stats/appointments', { year });
  },
  
  /**
   * 获取科室列表
   * @returns 科室列表
   */
  getDepartments: async (): Promise<Department[]> => {
    return await api.get<Department[]>('/admin/departments');
  },
  
  /**
   * 添加新科室
   * @param departmentData 科室数据
   * @returns 创建的科室
   */
  createDepartment: async (departmentData: DepartmentRequest): Promise<Department> => {
    return await api.post<Department>('/admin/departments', departmentData);
  },
  
  /**
   * 更新科室信息
   * @param id 科室ID
   * @param departmentData 科室数据
   * @returns 更新后的科室
   */
  updateDepartment: async (id: number, departmentData: DepartmentRequest): Promise<Department> => {
    return await api.patch<Department>(`/admin/departments/${id}`, departmentData);
  },
  
  /**
   * 删除科室
   * @param id 科室ID
   */
  deleteDepartment: async (id: number): Promise<void> => {
    await api.delete(`/admin/departments/${id}`);
  },
  
  /**
   * 审核医生评价
   * @param reviewId 评价ID
   * @param approved 是否批准
   * @param reason 拒绝原因(可选)
   */
  moderateReview: async (reviewId: number, approved: boolean, reason?: string): Promise<void> => {
    await api.patch(`/admin/reviews/${reviewId}/moderate`, {
      approved,
      reason
    });
  },
  
  /**
   * 获取系统日志
   * @param params 查询参数
   * @returns 系统日志
   */
  getSystemLogs: async (params?: {
    page?: number;
    limit?: number;
    level?: 'info' | 'warn' | 'error';
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    return await api.get('/admin/system-logs', params);
  }
}; 