import httpClient, { handleApiResponse } from './http-client';

// 个人资料更新请求类型
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  about?: string;
  specializations?: string[];
  qualifications?: string[];
  experienceYears?: number;
  consultationFee?: number;
  workingHours?: {
    [key: string]: {
      start: string;
      end: string;
      isAvailable: boolean;
    }
  };
}

// 医生日程类型
export interface DoctorSchedule {
  id: number;
  doctorId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// 医生工作时间请求类型
export interface WorkingHoursRequest {
  monday?: { start: string; end: string; isAvailable: boolean };
  tuesday?: { start: string; end: string; isAvailable: boolean };
  wednesday?: { start: string; end: string; isAvailable: boolean };
  thursday?: { start: string; end: string; isAvailable: boolean };
  friday?: { start: string; end: string; isAvailable: boolean };
  saturday?: { start: string; end: string; isAvailable: boolean };
  sunday?: { start: string; end: string; isAvailable: boolean };
}

// 休息时间请求类型
export interface TimeOffRequest {
  startDateTime: string;
  endDateTime: string;
  reason: string;
}

// 休息时间类型
export interface TimeOff {
  id: number;
  doctorId: number;
  startDateTime: string;
  endDateTime: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 预约类型
export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDateTime: string;
  endDateTime: string;
  status: string;
  type: string;
  reason: string;
  symptoms: string[];
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: number;
    userId: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    dateOfBirth?: string;
    bloodGroup?: string;
    height?: number;
    weight?: number;
  };
}

// 患者类型
export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  address: string;
}

// 医疗记录请求类型
export interface MedicalRecordRequest {
  diagnosis: string;
  prescription: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  notes: string;
  followUpDate?: string;
  attachments?: string[];
}

// 医疗记录类型
export interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number;
  diagnosis: string;
  prescription: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  notes: string;
  followUpDate?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  patient?: {
    user: {
      firstName: string;
      lastName: string;
    }
  };
}

// 处方类型
export interface Prescription {
  id: number;
  medicalRecordId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

// 评价类型
export interface Review {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  patient?: {
    user: {
      firstName: string;
      lastName: string;
    }
  };
}

// 通知偏好请求类型
export interface NotificationPreferencesRequest {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  reminderTiming: string;
  preferences?: {
    newAppointment?: boolean;
    appointmentReminder?: boolean;
    appointmentCancellation?: boolean;
    appointmentReschedule?: boolean;
  };
}

// 仪表盘统计类型
export interface DoctorDashboardStats {
  totalPatients: number;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: Appointment[];
  appointmentsByDay: Array<{
    date: string;
    count: number;
  }>;
  patientsByGender: {
    male: number;
    female: number;
    other: number;
  };
  recentReviews: Review[];
  averageRating: number;
}

// 医生患者详情类型
export interface DoctorPatientDetails {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  address: string;
  allergies?: Array<{
    id: number;
    name: string;
    severity: string;
  }>;
  appointments?: Array<{
    id: number;
    appointment_datetime: string;
    end_datetime: string;
    status: string;
    type: string;
  }>;
  medicalRecords?: Array<{
    id: number;
    record_type: string;
    description: string;
    created_at: string;
  }>;
}

// 医生API客户端
const doctorClient = {
  //=====================================================
  // 仪表盘和统计
  //=====================================================
  
  // 获取仪表盘统计数据
  getDashboardStats: async (): Promise<DoctorDashboardStats> => {
    try {
      const response = await httpClient.get('/doctors/dashboard');
      return handleApiResponse<DoctorDashboardStats>(response);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  //=====================================================
  // 个人资料管理
  //=====================================================
  
  // 获取个人资料
  getProfile: async () => {
    try {
      const response = await httpClient.get('/doctors/profile');
      return handleApiResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // 更新个人资料
  updateProfile: async (data: ProfileUpdateRequest) => {
    try {
      const response = await httpClient.put('/doctors/profile', data);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // 更改密码
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await httpClient.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // 获取通知偏好
  getNotificationPreferences: async () => {
    try {
      const response = await httpClient.get('/users/notification-preferences');
      return handleApiResponse(response);
    } catch (error) {
      console.error('Get notification preferences error:', error);
      throw error;
    }
  },

  // 更新通知偏好
  updateNotificationPreferences: async (data: NotificationPreferencesRequest) => {
    try {
      const response = await httpClient.put('/users/notification-preferences', data);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  },

  //=====================================================
  // 日程管理
  //=====================================================
  
  // 获取工作时间
  getWorkingHours: async (): Promise<DoctorSchedule[]> => {
    try {
      const response = await httpClient.get('/doctors/schedule');
      return handleApiResponse<DoctorSchedule[]>(response);
    } catch (error) {
      console.error('Get working hours error:', error);
      throw error;
    }
  },

  // 更新工作时间
  updateWorkingHours: async (data: WorkingHoursRequest): Promise<DoctorSchedule[]> => {
    try {
      const response = await httpClient.put('/doctors/schedule', data);
      return handleApiResponse<DoctorSchedule[]>(response);
    } catch (error) {
      console.error('Update working hours error:', error);
      throw error;
    }
  },

  // 获取休息时间
  getTimeOff: async (): Promise<TimeOff[]> => {
    try {
      const response = await httpClient.get('/doctors/time-off');
      return handleApiResponse<TimeOff[]>(response);
    } catch (error) {
      console.error('Get time off error:', error);
      throw error;
    }
  },

  // 请求休息时间
  requestTimeOff: async (data: TimeOffRequest): Promise<TimeOff> => {
    try {
      const response = await httpClient.post('/doctors/time-off', data);
      return handleApiResponse<TimeOff>(response);
    } catch (error) {
      console.error('Request time off error:', error);
      throw error;
    }
  },

  // 取消休息时间请求
  cancelTimeOff: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(`/doctors/time-off/${id}`);
    } catch (error) {
      console.error('Cancel time off error:', error);
      throw error;
    }
  },

  //=====================================================
  // 预约管理
  //=====================================================
  
  // 获取所有预约
  getAppointments: async (params?: {
    status?: string;
    patientId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> => {
    try {
      const response = await httpClient.get('/doctors/appointments', { params });
      return handleApiResponse<Appointment[]>(response);
    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  },

  // 获取今日预约
  getTodayAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await httpClient.get('/doctors/appointments/today');
      return handleApiResponse<Appointment[]>(response);
    } catch (error) {
      console.error('Get today appointments error:', error);
      throw error;
    }
  },

  // 获取单个预约详情
  getAppointmentById: async (id: number): Promise<Appointment> => {
    try {
      const response = await httpClient.get(`/appointments/${id}`);
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Get appointment error:', error);
      throw error;
    }
  },

  // 确认预约
  confirmAppointment: async (id: number): Promise<Appointment> => {
    try {
      const response = await httpClient.post(`/doctors/appointments/${id}/confirm`);
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Confirm appointment error:', error);
      throw error;
    }
  },

  // 完成预约
  completeAppointment: async (id: number, notes?: string): Promise<Appointment> => {
    try {
      const response = await httpClient.post(`/doctors/appointments/${id}/complete`, { notes });
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Complete appointment error:', error);
      throw error;
    }
  },

  // 取消预约
  cancelAppointment: async (id: number, reason: string): Promise<Appointment> => {
    try {
      const response = await httpClient.post(`/doctors/appointments/${id}/cancel`, { reason });
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  },

  // 获取所有预约（支持过滤和搜索）
  getAppointmentsWithFilters: async (params?: {
    status?: 'all' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> => {
    try {
      const response = await httpClient.get('/doctors/appointments', { params });
      return handleApiResponse<Appointment[]>(response);
    } catch (error) {
      console.error('Get appointments with filters error:', error);
      throw error;
    }
  },

  // 标记预约为已完成
  markAppointmentAsCompleted: async (id: number, notes?: string): Promise<Appointment> => {
    try {
      const response = await httpClient.patch(`/doctors/appointments/${id}/status`, {
        status: 'completed',
        notes
      });
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Mark appointment as completed error:', error);
      throw error;
    }
  },

  // 标记预约为未出席
  markAppointmentAsNoShow: async (id: number, notes?: string): Promise<Appointment> => {
    try {
      const response = await httpClient.patch(`/doctors/appointments/${id}/status`, {
        status: 'no_show',
        notes
      });
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Mark appointment as no-show error:', error);
      throw error;
    }
  },

  // 更新预约备注
  updateAppointmentNotes: async (id: number, notes: string): Promise<Appointment> => {
    try {
      const response = await httpClient.patch(`/doctors/appointments/${id}/notes`, { notes });
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Update appointment notes error:', error);
      throw error;
    }
  },

  //=====================================================
  // 患者管理
  //=====================================================
  
  // 获取医生的所有患者
  getDoctorPatients: async (): Promise<Patient[]> => {
    try {
      const response = await httpClient.get('/doctor-patients');
      return handleApiResponse<Patient[]>(response);
    } catch (error) {
      console.error('Get doctor patients error:', error);
      throw error;
    }
  },

  // 获取单个患者详情
  getDoctorPatientDetails: async (patientId: string): Promise<DoctorPatientDetails> => {
    try {
      const response = await httpClient.get(`/doctor-patients/${patientId}`);
      return handleApiResponse<DoctorPatientDetails>(response);
    } catch (error) {
      console.error('Get doctor patient details error:', error);
      throw error;
    }
  },

  // 添加患者笔记
  addPatientNote: async (patientId: string, text: string): Promise<any> => {
    try {
      const response = await httpClient.post(`/doctor-patients/${patientId}/notes`, { text });
      return handleApiResponse(response);
    } catch (error) {
      console.error('Add patient note error:', error);
      throw error;
    }
  },

  // 为患者安排预约
  schedulePatientAppointment: async (
    patientId: string, 
    appointmentData: { date: string; time: string; type: string }
  ): Promise<any> => {
    try {
      const response = await httpClient.post(
        `/doctor-patients/${patientId}/appointments`, 
        appointmentData
      );
      return handleApiResponse(response);
    } catch (error) {
      console.error('Schedule patient appointment error:', error);
      throw error;
    }
  },

  //=====================================================
  // 医疗记录管理
  //=====================================================
  
  // 获取医疗记录
  getMedicalRecords: async (patientId?: number): Promise<MedicalRecord[]> => {
    try {
      const params = patientId ? { patientId } : undefined;
      const response = await httpClient.get('/doctors/medical-records', { params });
      return handleApiResponse<MedicalRecord[]>(response);
    } catch (error) {
      console.error('Get medical records error:', error);
      throw error;
    }
  },

  // 获取单个医疗记录详情
  getMedicalRecordById: async (id: number): Promise<MedicalRecord> => {
    try {
      const response = await httpClient.get(`/medical-records/${id}`);
      return handleApiResponse<MedicalRecord>(response);
    } catch (error) {
      console.error('Get medical record error:', error);
      throw error;
    }
  },

  // 创建医疗记录
  createMedicalRecord: async (
    appointmentId: number,
    data: MedicalRecordRequest
  ): Promise<MedicalRecord> => {
    try {
      const response = await httpClient.post(`/doctors/appointments/${appointmentId}/medical-record`, data);
      return handleApiResponse<MedicalRecord>(response);
    } catch (error) {
      console.error('Create medical record error:', error);
      throw error;
    }
  },

  // 更新医疗记录
  updateMedicalRecord: async (
    id: number, 
    data: Partial<MedicalRecordRequest>
  ): Promise<MedicalRecord> => {
    try {
      const response = await httpClient.put(`/doctors/medical-records/${id}`, data);
      return handleApiResponse<MedicalRecord>(response);
    } catch (error) {
      console.error('Update medical record error:', error);
      throw error;
    }
  },

  //=====================================================
  // 处方管理
  //=====================================================
  
  // 获取处方记录
  getPrescriptions: async (params?: {
    medicalRecordId?: number;
    patientId?: number;
  }): Promise<Prescription[]> => {
    try {
      const response = await httpClient.get('/doctors/prescriptions', { params });
      return handleApiResponse<Prescription[]>(response);
    } catch (error) {
      console.error('Get prescriptions error:', error);
      throw error;
    }
  },

  // 获取单个处方详情
  getPrescriptionById: async (id: number): Promise<Prescription> => {
    try {
      const response = await httpClient.get(`/prescriptions/${id}`);
      return handleApiResponse<Prescription>(response);
    } catch (error) {
      console.error('Get prescription error:', error);
      throw error;
    }
  },

  //=====================================================
  // 评价管理
  //=====================================================
  
  // 获取我收到的评价
  getMyReviews: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<Review[]> => {
    try {
      const response = await httpClient.get('/doctors/reviews', { params });
      return handleApiResponse<Review[]>(response);
    } catch (error) {
      console.error('Get my reviews error:', error);
      throw error;
    }
  },

  // 获取评价统计
  getReviewStats: async (): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<string, number>;
  }> => {
    try {
      const response = await httpClient.get('/doctors/reviews/stats');
      return handleApiResponse(response);
    } catch (error) {
      console.error('Get review stats error:', error);
      throw error;
    }
  }
};

export default doctorClient; 