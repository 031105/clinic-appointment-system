import { api } from './httpClient';

// 通知类型
export interface Notification {
  id: number;
  userId: number;
  type: 'appointment' | 'message' | 'reminder' | 'system' | 'promotion';
  title: string;
  message: string;
  isRead: boolean;
  data?: any; // 可能包含额外数据，如预约ID等
  createdAt: string;
}

// 通知服务
export const notificationService = {
  /**
   * 获取用户通知列表
   * @param unreadOnly 是否只获取未读通知
   * @returns 通知列表
   */
  getNotifications: async (unreadOnly: boolean = false): Promise<Notification[]> => {
    return await api.get<Notification[]>('/notifications', { unreadOnly });
  },
  
  /**
   * 获取通知详情
   * @param id 通知ID
   * @returns 通知详情
   */
  getNotificationById: async (id: number): Promise<Notification> => {
    return await api.get<Notification>(`/notifications/${id}`);
  },
  
  /**
   * 标记通知为已读
   * @param id 通知ID
   */
  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },
  
  /**
   * 标记所有通知为已读
   */
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
  
  /**
   * 删除通知
   * @param id 通知ID
   */
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
  
  /**
   * 获取未读通知数量
   * @returns 未读通知数量
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    return await api.get<{ count: number }>('/notifications/unread-count');
  },
  
  /**
   * 更新通知偏好
   * @param preferences 通知偏好设置
   */
  updateNotificationPreferences: async (preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    appointmentReminders?: boolean;
    marketingEmails?: boolean;
  }): Promise<void> => {
    await api.patch('/notifications/preferences', preferences);
  },
  
  /**
   * 订阅推送通知
   * @param subscription 推送订阅信息
   */
  subscribePushNotifications: async (subscription: PushSubscription): Promise<void> => {
    await api.post('/notifications/subscribe-push', {
      subscription: JSON.stringify(subscription)
    });
  },
  
  /**
   * 取消推送通知订阅
   */
  unsubscribePushNotifications: async (): Promise<void> => {
    await api.post('/notifications/unsubscribe-push');
  }
}; 