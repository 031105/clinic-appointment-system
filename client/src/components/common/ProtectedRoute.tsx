import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'doctor' | 'patient';
}

/**
 * 受保护的路由组件
 * 如果用户未登录，将重定向到登录页面
 * 如果指定了所需角色，还将检查用户是否拥有该角色
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRole
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // 如果正在加载用户信息，显示加载状态
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 如果用户未登录，重定向到登录页面，并保存尝试访问的URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 如果指定了所需角色，但用户没有该角色，重定向到未授权页面
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 用户已登录且拥有正确的角色，显示受保护的内容
  return <>{children}</>;
};

export default ProtectedRoute; 