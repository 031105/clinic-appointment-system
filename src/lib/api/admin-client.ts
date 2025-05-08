import httpClient, { handleApiResponse } from './http-client';

// 用户管理接口类型
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role_name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 用户创建请求类型
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: number;
}

// 用户更新请求类型
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  email?: string;
}

// 用户权限类型
export interface Permission {
  id: number;
  name: string;
  description: string;
  module: string;
}

// 角色类型
export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

// 部门类型
export interface Department {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  doctorCount?: number;
}

// 部门创建/更新请求类型
export interface DepartmentRequest {
  name: string;
  description: string;
  imageUrl?: string;
}

// 服务类型
export interface Service {
  id: number;
  departmentId: number;
  name: string;
  price: number;
  duration: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 服务创建/更新请求类型
export interface ServiceRequest {
  name: string;
  price: number;
  duration: number;
  description?: string;
}

// 预约类型
export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDateTime: string;
  endDateTime: string;
  status: string;
  type: string;
  reason: string;
  symptoms: string[];
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: number;
    userId: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    }
  };
  doctor?: {
    id: number;
    userId: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    }
  };
}

// 统计数据类型
export interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  recentAppointments: Appointment[];
  appointmentsByStatus: Record<string, number>;
  appointmentsByDepartment: Array<{
    department: string;
    count: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

// 管理员API客户端
const adminClient = {
  //=====================================================
  // 仪表盘和统计
  //=====================================================
  
  // 获取仪表盘统计数据
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await httpClient.get('/admin/dashboard');
      return handleApiResponse<DashboardStats>(response);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  //=====================================================
  // 用户管理
  //=====================================================
  
  // 获取所有用户
  getUsers: async (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{users: User[], total: number}> => {
    try {
      const response = await httpClient.get('/admin/users', { params });
      return handleApiResponse<{users: User[], total: number}>(response);
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  // 获取单个用户
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await httpClient.get(`/admin/users/${id}`);
      return handleApiResponse<User>(response);
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // 创建用户
  createUser: async (data: CreateUserRequest): Promise<User> => {
    try {
      const response = await httpClient.post('/admin/users', data);
      return handleApiResponse<User>(response);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // 更新用户
  updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
    try {
      const response = await httpClient.put(`/admin/users/${id}`, data);
      return handleApiResponse<User>(response);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // 更新用户状态 (激活/停用)
  updateUserStatus: async (id: number, status: 'active' | 'inactive'): Promise<User> => {
    try {
      const response = await httpClient.put(`/admin/users/${id}/status`, { status });
      return handleApiResponse<User>(response);
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  },

  // 重置用户密码
  resetUserPassword: async (id: number): Promise<{token: string}> => {
    try {
      const response = await httpClient.post(`/admin/users/${id}/reset-password`);
      return handleApiResponse<{token: string}>(response);
    } catch (error) {
      console.error('Reset user password error:', error);
      throw error;
    }
  },

  // 删除用户
  deleteUser: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(`/admin/users/${id}`);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  //=====================================================
  // 角色和权限管理
  //=====================================================
  
  // 获取所有角色
  getRoles: async (): Promise<Role[]> => {
    try {
      const response = await httpClient.get('/admin/roles');
      return handleApiResponse<Role[]>(response);
    } catch (error) {
      console.error('Get roles error:', error);
      throw error;
    }
  },

  // 获取角色详情
  getRoleById: async (id: number): Promise<Role> => {
    try {
      const response = await httpClient.get(`/admin/roles/${id}`);
      return handleApiResponse<Role>(response);
    } catch (error) {
      console.error('Get role error:', error);
      throw error;
    }
  },

  // 创建角色
  createRole: async (data: {name: string; description: string}): Promise<Role> => {
    try {
      const response = await httpClient.post('/admin/roles', data);
      return handleApiResponse<Role>(response);
    } catch (error) {
      console.error('Create role error:', error);
      throw error;
    }
  },

  // 更新角色
  updateRole: async (id: number, data: {name?: string; description?: string}): Promise<Role> => {
    try {
      const response = await httpClient.put(`/admin/roles/${id}`, data);
      return handleApiResponse<Role>(response);
    } catch (error) {
      console.error('Update role error:', error);
      throw error;
    }
  },

  // 删除角色
  deleteRole: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(`/admin/roles/${id}`);
    } catch (error) {
      console.error('Delete role error:', error);
      throw error;
    }
  },

  // 获取所有权限
  getPermissions: async (): Promise<Permission[]> => {
    try {
      const response = await httpClient.get('/admin/permissions');
      return handleApiResponse<Permission[]>(response);
    } catch (error) {
      console.error('Get permissions error:', error);
      throw error;
    }
  },

  // 分配角色权限
  assignPermissionsToRole: async (roleId: number, permissionIds: number[]): Promise<Role> => {
    try {
      const response = await httpClient.post(`/admin/roles/${roleId}/permissions`, {
        permissionIds
      });
      return handleApiResponse<Role>(response);
    } catch (error) {
      console.error('Assign permissions error:', error);
      throw error;
    }
  },

  //=====================================================
  // 部门管理
  //=====================================================
  
  // 获取所有部门
  getDepartments: async (): Promise<Department[]> => {
    try {
      const response = await httpClient.get('/admin/departments');
      return handleApiResponse<Department[]>(response);
    } catch (error) {
      console.error('Get departments error:', error);
      throw error;
    }
  },

  // 获取部门详情
  getDepartmentById: async (id: number): Promise<Department> => {
    try {
      const response = await httpClient.get(`/admin/departments/${id}`);
      return handleApiResponse<Department>(response);
    } catch (error) {
      console.error('Get department error:', error);
      throw error;
    }
  },

  // 创建部门
  createDepartment: async (data: DepartmentRequest): Promise<Department> => {
    try {
      const response = await httpClient.post('/admin/departments', data);
      return handleApiResponse<Department>(response);
    } catch (error) {
      console.error('Create department error:', error);
      throw error;
    }
  },

  // 更新部门
  updateDepartment: async (id: number, data: Partial<DepartmentRequest>): Promise<Department> => {
    try {
      const response = await httpClient.put(`/admin/departments/${id}`, data);
      return handleApiResponse<Department>(response);
    } catch (error) {
      console.error('Update department error:', error);
      throw error;
    }
  },

  // 删除部门
  deleteDepartment: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(`/admin/departments/${id}`);
    } catch (error) {
      console.error('Delete department error:', error);
      throw error;
    }
  },

  //=====================================================
  // 服务管理
  //=====================================================
  
  // 获取部门下的所有服务
  getDepartmentServices: async (departmentId: number): Promise<Service[]> => {
    try {
      const response = await httpClient.get(`/admin/departments/${departmentId}/services`);
      return handleApiResponse<Service[]>(response);
    } catch (error) {
      console.error('Get department services error:', error);
      throw error;
    }
  },

  // 创建服务
  createService: async (departmentId: number, data: ServiceRequest): Promise<Service> => {
    try {
      const response = await httpClient.post(`/admin/departments/${departmentId}/services`, data);
      return handleApiResponse<Service>(response);
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  },

  // 更新服务
  updateService: async (
    departmentId: number, 
    serviceId: number, 
    data: Partial<ServiceRequest>
  ): Promise<Service> => {
    try {
      const response = await httpClient.put(
        `/admin/departments/${departmentId}/services/${serviceId}`, 
        data
      );
      return handleApiResponse<Service>(response);
    } catch (error) {
      console.error('Update service error:', error);
      throw error;
    }
  },

  // 删除服务
  deleteService: async (departmentId: number, serviceId: number): Promise<void> => {
    try {
      await httpClient.delete(`/admin/departments/${departmentId}/services/${serviceId}`);
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  },

  //=====================================================
  // 预约管理
  //=====================================================
  
  // 获取所有预约
  getAppointments: async (params?: {
    status?: string;
    doctorId?: number;
    patientId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{appointments: Appointment[], total: number}> => {
    try {
      const response = await httpClient.get('/admin/appointments', { params });
      return handleApiResponse<{appointments: Appointment[], total: number}>(response);
    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  },

  // 获取预约详情
  getAppointmentById: async (id: number): Promise<Appointment> => {
    try {
      const response = await httpClient.get(`/admin/appointments/${id}`);
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Get appointment error:', error);
      throw error;
    }
  },

  // 更新预约状态
  updateAppointmentStatus: async (
    id: number, 
    status: string, 
    notes?: string
  ): Promise<Appointment> => {
    try {
      const response = await httpClient.put(`/admin/appointments/${id}/status`, {
        status,
        notes
      });
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  },

  //=====================================================
  // 系统设置
  //=====================================================
  
  // 获取系统设置
  getSystemSettings: async (): Promise<any> => {
    try {
      const response = await httpClient.get('/admin/settings');
      return handleApiResponse(response);
    } catch (error) {
      console.error('Get system settings error:', error);
      throw error;
    }
  },

  // 更新系统设置
  updateSystemSettings: async (data: any): Promise<any> => {
    try {
      const response = await httpClient.put('/admin/settings', data);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Update system settings error:', error);
      throw error;
    }
  }
};

export default adminClient; 