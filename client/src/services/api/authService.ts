import { api } from './httpClient';

// 定义登录响应类型
interface LoginResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'doctor' | 'patient';
    profileImage?: string;
  };
  accessToken: string;
  refreshToken: string;
}

// 定义注册请求类型
interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'doctor' | 'patient';
  phone?: string;
}

// 认证服务
export const authService = {
  /**
   * 用户登录
   * @param email 邮箱
   * @param password 密码
   * @returns 登录响应，包含用户信息和令牌
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password
      });
      
      // 存储令牌
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  /**
   * 用户注册
   * @param userData 用户注册数据
   * @returns 注册响应
   */
  register: async (userData: RegisterRequest): Promise<any> => {
    try {
      return await api.post('/auth/register', userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
  
  /**
   * 刷新访问令牌
   * @returns 新的访问令牌
   */
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await api.post<{ accessToken: string }>('/auth/refresh-token', {
        refreshToken
      });
      
      // 存储新令牌
      localStorage.setItem('accessToken', response.accessToken);
      
      return response;
    } catch (error) {
      // 刷新失败，清除所有令牌
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.error('Token refresh failed:', error);
      throw error;
    }
  },
  
  /**
   * 用户登出
   */
  logout: async (): Promise<void> => {
    try {
      // 调用登出API
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // 即使API调用失败，仍然需要清除本地存储的令牌
    } finally {
      // 清除本地存储的令牌
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
  
  /**
   * 检查用户是否已登录
   * @returns 是否已登录
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },
  
  /**
   * 获取当前访问令牌
   * @returns 访问令牌
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },
  
  /**
   * 重置密码请求
   * @param email 用户邮箱
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/auth/request-password-reset', { email });
  },
  
  /**
   * 重置密码
   * @param token 重置令牌
   * @param newPassword 新密码
   * @param confirmPassword 确认密码
   */
  resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', {
      token,
      newPassword,
      confirmPassword
    });
  }
}; 