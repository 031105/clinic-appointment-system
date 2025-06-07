import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  adminDashboardClient,
  DashboardStats,
  AdminNotification,
  SendNotificationRequest,
  GenerateReportRequest,
  GetNotificationsParams
} from '@/lib/api/admin-dashboard-client';

export interface UseAdminDashboardState {
  stats: DashboardStats | null;
  notifications: AdminNotification[];
  loadingStats: boolean;
  loadingNotifications: boolean;
  sendingNotification: boolean;
  generatingReport: boolean;
  error: string | null;
  notificationsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UseAdminDashboardReturn extends UseAdminDashboardState {
  // Data fetching
  fetchDashboardStats: () => Promise<void>;
  fetchNotifications: (params?: GetNotificationsParams) => Promise<void>;
  
  // Actions
  sendNotification: (data: SendNotificationRequest) => Promise<boolean>;
  markNotificationRead: (notificationId: number) => Promise<boolean>;
  generateReport: (data: GenerateReportRequest) => Promise<any>;
  
  // UI state management
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
  const [state, setState] = useState<UseAdminDashboardState>({
    stats: null,
    notifications: [],
    loadingStats: false,
    loadingNotifications: false,
    sendingNotification: false,
    generatingReport: false,
    error: null,
    notificationsPagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  });

  const updateState = useCallback((updates: Partial<UseAdminDashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      updateState({ loadingStats: true, error: null });

      const stats = await adminDashboardClient.getDashboardStats();
      
      updateState({
        stats,
        loadingStats: false
      });
      
    } catch (error: any) {
      console.error('[useAdminDashboard] Failed to fetch dashboard stats:', error);
      const errorMessage = error.message || 'Failed to fetch dashboard statistics';
      updateState({ 
        error: errorMessage, 
        loadingStats: false,
        stats: null
      });
      toast.error(errorMessage);
    }
  }, [updateState]);

  const fetchNotifications = useCallback(async (params?: GetNotificationsParams) => {
    try {
      updateState({ loadingNotifications: true, error: null });

      const response = await adminDashboardClient.getNotifications(params);
      
      updateState({
        notifications: response.data,
        notificationsPagination: response.pagination,
        loadingNotifications: false
      });
      
    } catch (error: any) {
      console.error('[useAdminDashboard] Failed to fetch notifications:', error);
      const errorMessage = error.message || 'Failed to fetch notifications';
      updateState({ 
        error: errorMessage, 
        loadingNotifications: false,
        notifications: [],
        notificationsPagination: { page: 1, limit: 10, total: 0, pages: 0 }
      });
      toast.error(errorMessage);
    }
  }, [updateState]);

  const sendNotification = useCallback(async (data: SendNotificationRequest): Promise<boolean> => {
    try {
      updateState({ sendingNotification: true, error: null });

      const result = await adminDashboardClient.sendNotification(data);
      
      updateState({ sendingNotification: false });
      toast.success(`Notification sent to ${result.recipients} users`);
      
      // Refresh notifications after sending
      await fetchNotifications();
      
      return true;
      
    } catch (error: any) {
      console.error('[useAdminDashboard] Failed to send notification:', error);
      const errorMessage = error.message || 'Failed to send notification';
      updateState({ 
        error: errorMessage, 
        sendingNotification: false 
      });
      toast.error(errorMessage);
      return false;
    }
  }, [updateState, fetchNotifications]);

  const markNotificationRead = useCallback(async (notificationId: number): Promise<boolean> => {
    try {
      await adminDashboardClient.markNotificationRead(notificationId);
      
      // Update the notification in the local state
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      }));
      
      return true;
      
    } catch (error: any) {
      console.error('[useAdminDashboard] Failed to mark notification as read:', error);
      const errorMessage = error.message || 'Failed to mark notification as read';
      updateState({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  }, [updateState]);

  const generateReport = useCallback(async (data: GenerateReportRequest): Promise<any> => {
    try {
      updateState({ generatingReport: true, error: null });

      const report = await adminDashboardClient.generateReport(data);
      
      updateState({ generatingReport: false });
      toast.success('Report generated successfully');
      
      return report;
      
    } catch (error: any) {
      console.error('[useAdminDashboard] Failed to generate report:', error);
      const errorMessage = error.message || 'Failed to generate report';
      updateState({ 
        error: errorMessage, 
        generatingReport: false 
      });
      toast.error(errorMessage);
      return null;
    }
  }, [updateState]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchNotifications()
    ]);
  }, [fetchDashboardStats, fetchNotifications]);

  // Initial data loading
  useEffect(() => {
    fetchDashboardStats();
    fetchNotifications();
  }, [fetchDashboardStats, fetchNotifications]);

  return {
    ...state,
    fetchDashboardStats,
    fetchNotifications,
    sendNotification,
    markNotificationRead,
    generateReport,
    clearError,
    refreshAll
  };
};

export default useAdminDashboard; 