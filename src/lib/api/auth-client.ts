import httpClient, { handleApiResponse, ApiResponse } from './http-client';

// 注册请求类型
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  doctorInfo?: {
    departmentId: number;
    specializations?: string[];
    qualifications?: any;
    experienceYears?: number;
    consultationFee?: number;
  };
  patientInfo?: {
    dateOfBirth: string;
    bloodGroup?: string;
    height?: number;
    weight?: number;
  };
}

// 登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 登录响应类型
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role_name: string;
  };
}

// 用户信息类型
export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role_name: string;
  [key: string]: any;
}

// 重置密码请求类型
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// 验证邮箱请求类型
export interface VerifyEmailRequest {
  token: string;
}

// 认证相关的API客户端
const authClient = {
  // 用户注册
  register: async (data: RegisterRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await httpClient.post('/auth/register', data);
      
      // 保存认证token
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // 用户登录
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await httpClient.post('/auth/login', data);
      
      // 保存认证token
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // 用户登出
  logout: async (): Promise<void> => {
    try {
      // 发送登出请求
      await httpClient.post('/auth/logout');
      
      // 移除本地存储的token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Logout error:', error);
      
      // 即使API请求失败，也清除本地token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      throw error;
    }
  },

  // 刷新token
  refreshToken: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await httpClient.post('/auth/refresh-token', { refreshToken });
      
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        
        // 可能的刷新token更新
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  // 忘记密码请求
  forgotPassword: async (email: string): Promise<any> => {
    try {
      const response = await httpClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // 重置密码
  resetPassword: async (data: ResetPasswordRequest): Promise<any> => {
    try {
      const response = await httpClient.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<UserProfile> => {
    try {
      const response = await httpClient.get('/users/me');
      return handleApiResponse<UserProfile>(response);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // 验证账户邮箱
  verifyEmail: async (data: VerifyEmailRequest): Promise<any> => {
    try {
      const response = await httpClient.post('/auth/verify-email', data);
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },

  // 检查是否已认证
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  // 获取当前token
  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  }
};

export default authClient; 