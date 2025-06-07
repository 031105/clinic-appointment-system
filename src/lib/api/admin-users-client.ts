import httpClient from './http-client';

// 用户类型定义
export interface AdminUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface DoctorUser extends AdminUser {
  specialty?: string;
  experience?: number;
  consultation_fee?: number;
  department_id?: number;
  department_name?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'doctor';
  doctorInfo?: {
    specialty?: string;
    experience?: number;
    consultation_fee?: number;
    department_id?: number;
  };
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'inactive';
}

export interface UserResponse {
  success: boolean;
  data: AdminUser | DoctorUser;
  message?: string;
}

export interface UsersListResponse {
  success: boolean;
  data: AdminUser[] | DoctorUser[];
  total: number;
}

// API客户端
export const adminUsersClient = {
  // 获取管理员用户列表
  async getAdminUsers(): Promise<AdminUser[]> {
    const response = await httpClient.get('/admin/users/admin-users');
    return response.data.data;
  },

  // 获取医生用户列表
  async getDoctorUsers(): Promise<DoctorUser[]> {
    const response = await httpClient.get('/admin/users/doctor-users');
    return response.data.data;
  },

  // 获取用户详情
  async getUserById(id: number): Promise<AdminUser | DoctorUser> {
    const response = await httpClient.get(`/admin/users/${id}`);
    return response.data.data;
  },

  // 创建新用户
  async createUser(userData: CreateUserRequest): Promise<AdminUser | DoctorUser> {
    const response = await httpClient.post('/admin/users', userData);
    return response.data.data;
  },

  // 更新用户状态
  async updateUserStatus(id: number, statusData: UpdateUserStatusRequest): Promise<void> {
    await httpClient.patch(`/admin/users/${id}/status`, statusData);
  }
}; 