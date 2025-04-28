import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api/authService';
import { userService, User } from '../services/api/userService';

// 定义认证上下文类型
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者属性
interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供者组件
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 初始化时检查用户是否已登录
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 检查本地存储中是否有访问令牌
        if (authService.isAuthenticated()) {
          // 获取当前用户信息
          const userData = await userService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // 认证错误，清除令牌
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 登录方法
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 调用登录API
      const response = await authService.login(email, password);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  // 注册方法
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      await authService.register(userData);
      // 注册成功后不自动登录，用户需要手动登录
    } finally {
      setIsLoading(false);
    }
  };

  // 登出方法
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // 提供认证上下文值
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证上下文的Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 