'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// 定义用户类型
type User = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  isLoggedIn: boolean;
};

// 定义会话上下文类型
type SessionContextType = {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

// 创建会话上下文
const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const router = useRouter();

  // 从localStorage加载用户数据
  const loadUserFromStorage = () => {
    try {
      setStatus('loading');
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('[SessionContext] Running on server, deferring auth check');
        setStatus('loading');
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      const userDataString = localStorage.getItem('userData');
      
      if (token && userDataString) {
        const userData = JSON.parse(userDataString);
        setUser({
          ...userData,
          isLoggedIn: true
        });
        setStatus('authenticated');
        console.log('[SessionContext] User loaded from localStorage');
      } else {
        setUser(null);
        setStatus('unauthenticated');
        console.log('[SessionContext] No user data in localStorage');
      }
    } catch (error) {
      console.error('[SessionContext] Error loading user from localStorage:', error);
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  // 登录
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
          // 保存token和用户数据到localStorage
          localStorage.setItem('accessToken', data.user.token);
          localStorage.setItem('userData', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role
          }));
        }
        
        // 更新状态
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          isLoggedIn: true
        });
        setStatus('authenticated');
        
        console.log('[SessionContext] Login successful');
        return true;
      } else {
        console.error('[SessionContext] Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('[SessionContext] Login error:', error);
      return false;
    }
  };

  // 登出
  const logout = async (): Promise<void> => {
    try {
      // Only access localStorage in browser environment
      if (typeof window !== 'undefined') {
        // 清除localStorage中的数据
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
      }
      
      // 更新状态
      setUser(null);
      setStatus('unauthenticated');
      
      console.log('[SessionContext] Logged out');
      router.push('/login');
    } catch (error) {
      console.error('[SessionContext] Logout error:', error);
    }
  };

  // 初始化 - 从localStorage加载用户数据
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // 提供上下文
  return (
    <SessionContext.Provider value={{ user, status, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

// 自定义hook，用于访问会话上下文
export const useSession = () => {
  const context = useContext(SessionContext);
  
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  
  return {
    data: { user: context.user },
    status: context.status,
    login: context.login,
    logout: context.logout
  };
}; 