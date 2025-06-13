import httpClient from './http-client';

// Type definitions
export interface DashboardStats {
  totalAppointments: {
    count: number;
    change: number;
  };
  activePatients: {
    count: number;
    change: number;
  };
  activeDoctors: {
    count: number;
    change: number;
  };
  avgSatisfaction: {
    rating: number;
    change: number;
  };
  departmentPerformance: Array<{
    department_name: string;
    appointment_count: number;
  }>;
  appointmentTrends: Array<{
    day: string;
    count: number;
  }>;
}

export interface AdminNotification {
  notification_id: number;
  title: string;
  message: string;
  type: 'appointment' | 'system' | 'reminder' | 'message' | 'promotion' | 'other';
  is_read: boolean;
  created_at: string;
  data?: any;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface SendNotificationRequest {
  title: string;
  message: string;
  type?: 'system' | 'reminder' | 'message';
  target_users?: 'all' | 'patients' | 'doctors' | 'specific_patients' | 'specific_doctors' | 'specific';
  specific_user_ids?: number[];
}

export interface EmailNotificationData {
  to_email: string;
  to_name: string;
  notification_title: string;
  notification_message: string;
  notification_type: 'system' | 'reminder' | 'message' | 'appointment';
  notification_date: string;
}

export interface SendNotificationResponse {
  recipients: number;
  email_recipients: number;
  email_data: EmailNotificationData[];
}

export interface GenerateReportRequest {
  report_type: 'appointments' | 'patients' | 'doctors';
  date_from?: string;
  date_to?: string;
  department_id?: string;
  format?: 'json' | 'csv';
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unread_only?: boolean;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API client
export const adminDashboardClient = {
  
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await httpClient.get('/admin/dashboard/stats');
    
    if (response.data && response.data.data) {
      return response.data.data as DashboardStats;
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Get admin notifications with pagination
   */
  async getNotifications(params?: GetNotificationsParams): Promise<PaginationResponse<AdminNotification>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unread_only) queryParams.append('unread_only', params.unread_only.toString());

    const url = `/admin/dashboard/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get(url);
    
    if (response.data) {
      return response.data as PaginationResponse<AdminNotification>;
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Send notification to users
   */
  async sendNotification(data: SendNotificationRequest): Promise<SendNotificationResponse> {
    const response = await httpClient.post('/admin/dashboard/notifications/send', data);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || 'Failed to send notification');
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: number): Promise<{
    notification_id: number;
    is_read: boolean;
  }> {
    const response = await httpClient.patch(`/admin/dashboard/notifications/${notificationId}/read`);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || 'Failed to mark notification as read');
  },

  /**
   * Generate report
   */
  async generateReport(data: GenerateReportRequest): Promise<any> {
    const response = await httpClient.post('/admin/dashboard/reports/generate', data);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || 'Failed to generate report');
  }
};

export default adminDashboardClient; 