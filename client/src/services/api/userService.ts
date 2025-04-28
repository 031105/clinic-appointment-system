import { api } from './httpClient';

// 用户信息类型定义
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'doctor' | 'patient';
  phone?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// 地址类型定义
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// 更新个人资料请求类型
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: Address;
  profileImage?: string;
}

// 修改密码请求类型
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 通知偏好设置类型
export interface NotificationPreferences {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  reminderTiming?: number; // 预约前几小时提醒
  preferences?: {
    appointmentReminders?: boolean;
    marketingEmails?: boolean;
    newsUpdates?: boolean;
  };
}

// 用户服务
export const userService = {
  /**
   * 获取当前登录用户信息
   * @returns 用户信息
   */
  getCurrentUser: async (): Promise<User> => {
    return await api.get<User>('/users/me');
  },
  
  /**
   * 更新用户个人资料
   * @param profileData 要更新的资料数据
   * @returns 更新后的用户信息
   */
  updateProfile: async (profileData: UpdateProfileRequest): Promise<User> => {
    return await api.patch<User>('/users/profile', profileData);
  },
  
  /**
   * 修改用户密码
   * @param passwordData 包含当前密码和新密码的数据
   */
  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    await api.post('/users/change-password', passwordData);
  },
  
  /**
   * 上传用户头像
   * @param imageFile 图片文件
   * @returns 上传后的图片URL
   */
  uploadProfileImage: async (imageFile: File): Promise<{ imageUrl: string }> => {
    // 创建FormData对象，用于文件上传
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    // 需要直接使用axios实例进行文件上传
    const response = await fetch(`${api.baseUrl}/users/profile-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload profile image');
    }
    
    return await response.json();
  },
  
  /**
   * 更新通知偏好设置
   * @param preferences 通知偏好设置
   */
  updateNotificationPreferences: async (preferences: NotificationPreferences): Promise<void> => {
    await api.patch('/users/notification-preferences', preferences);
  },
  
  /**
   * 获取当前通知偏好设置
   * @returns 通知偏好设置
   */
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    return await api.get<NotificationPreferences>('/users/notification-preferences');
  },
  
  /**
   * 删除用户账户
   * @param password 用户密码（确认删除）
   */
  deleteAccount: async (password: string): Promise<void> => {
    await api.post('/users/delete-account', { password });
  }
}; 