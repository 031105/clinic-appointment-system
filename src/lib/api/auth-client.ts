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

// 认证客户端API
const authClient = {
  // 登录
  login: async (loginData: LoginRequest) => {
    try {
      const { email, password } = loginData;
      
      // 调用后端登录API - 使用新的API路径
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login API error:', errorData);
        throw new Error(errorData.message || '登录失败');
      }
      
      // 解析响应数据
      const data = await response.json();
      
      console.log('API login response:', {
        success: !!data.success,
        hasUser: !!data.user
      });
      
      // 保存令牌到本地存储
      if (data.user && data.user.token) {
        localStorage.setItem('accessToken', data.user.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // 注册
  register: async (userData: any) => {
    try {
      const response = await httpClient.post('/auth/register', userData);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  // Enhanced logout function
  logout: async () => {
    try {
      console.log('[AuthClient] Starting logout cleanup...');
      
      // Only access browser APIs in browser environment
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('clinic-user-role');
        
        // Clear any other stored user data
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
          if (key.includes('user') || key.includes('auth') || key.includes('token') || key.includes('clinic')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear sessionStorage
        sessionStorage.clear();
      }
      
      console.log('[AuthClient] Logout cleanup completed');
      return { success: true, message: 'Successfully logged out' };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear what we can
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      throw error;
    }
  },

  // 忘记密码
  forgotPassword: async (email: string) => {
    try {
      const response = await httpClient.post('/auth/forgot-password', { email });
      return handleApiResponse(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // 重置密码
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await httpClient.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      return handleApiResponse(response);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    try {
      const response = await httpClient.get('/users/me');
      return handleApiResponse(response);
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