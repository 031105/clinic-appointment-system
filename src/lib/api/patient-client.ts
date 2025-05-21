import httpClient, { handleApiResponse, createSessionHttpClient, cachedGet } from './http-client';
import { useSession } from '@/contexts/auth/SessionContext';

// 个人资料更新请求类型
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: any;
  dateOfBirth?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
}

// 通知偏好请求类型
export interface NotificationPreferencesRequest {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  reminderTiming: string;
  preferences?: any;
}

// 过敏信息请求类型
export interface AllergyRequest {
  allergyName: string;
  severity: string;
  diagnosedDate?: string;
  notes?: string;
}

// 过敏信息类型
export interface Allergy extends AllergyRequest {
  id: number;
  patientId: number;
  createdAt: string;
  updatedAt: string;
}

// 紧急联系人请求类型
export interface EmergencyContactRequest {
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

// 紧急联系人类型
export interface EmergencyContact extends EmergencyContactRequest {
  id: number;
  patientId: number;
  createdAt: string;
  updatedAt: string;
}

// 预约请求类型
export interface AppointmentRequest {
  doctorId: number;
  appointmentDateTime: string;
  duration?: number;
  type: string;
  reason: string;
  symptoms?: string[];
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
  doctor?: {
    id: number;
    userId: number;
    department: {
      id: number;
      name: string;
    };
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
}

// 评价请求类型
export interface ReviewRequest {
  doctorId: number;
  appointmentId: number;
  rating: number;
  comment: string;
  isAnonymous?: boolean;
}

// 评价类型
export interface Review extends Omit<ReviewRequest, 'doctorId' | 'appointmentId'> {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number;
  createdAt: string;
  updatedAt: string;
}

// 账单类型
export interface Bill {
  id: number;
  patientId: number;
  appointmentId: number;
  amount: number;
  status: string;
  paymentMethod?: string;
  paidAt?: string;
  dueDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  appointment?: Appointment;
}

// 医生类型
export interface Doctor {
  id: number;
  userId: number;
  departmentId: number;
  specializations: string[];
  qualifications: string[];
  experienceYears: number;
  consultationFee: number;
  about?: string;
  workingHours?: any;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePicture?: string;
  };
  department: {
    id: number;
    name: string;
  };
  averageRating?: number;
  reviewCount?: number;
}

// 部门类型
export interface Department {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  emojiIcon?: string;
  createdAt: string;
  updatedAt: string;
  doctorCount?: number;
}

// 医疗记录类型
export interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number;
  diagnosis: string;
  prescription: any[];
  notes: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  doctor?: {
    user: {
      firstName: string;
      lastName: string;
    }
  };
}

// Medical record attachment type
export interface MedicalRecordAttachment {
  attachmentId: number;
  recordId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

// 获取当前会话以供API客户端使用
let sessionHttpClient = httpClient;
let sessionCachedGet = cachedGet;

// 用于设置session的函数，在导入时调用
export function initializeWithSession(session: any) {
  console.log('[Patient Client] Initializing with session:', session?.user?.token ? 'Token present' : 'No token');
  
  if (session?.user?.token) {
    console.log('[Patient Client] Setting up authenticated client with token');
    const axiosInstance = createSessionHttpClient({
      user: {
        token: session.user.token
      }
    });
    
    // 替换所有HTTP方法
    sessionHttpClient = {
      ...httpClient,
      get: axiosInstance.get,
      post: axiosInstance.post,
      put: axiosInstance.put,
      delete: axiosInstance.delete,
      patch: axiosInstance.patch
    };
    
    // 创建带会话的cachedGet
    sessionCachedGet = async <T>(url: string, config?: any, cacheTime = 60000): Promise<T> => {
      // 确保config中包含会话token
      const sessionConfig = {
        ...config,
        headers: {
          ...config?.headers,
          Authorization: `Bearer ${session.user.token}`
        }
      };
      return cachedGet<T>(url, sessionConfig, cacheTime);
    };
    
    console.log('[Patient Client] Session token successfully configured for API client');
  } else {
    console.warn('[Patient Client] No session token available, using default HTTP client');
    sessionHttpClient = httpClient;
    sessionCachedGet = cachedGet;
  }
}

// 患者API客户端
const patientClient = {
  //=====================================================
  // 个人资料管理
  //=====================================================
  
  // 获取个人资料
  getProfile: async () => {
    try {
      const response = await sessionHttpClient.get('/patients/profile');
      return handleApiResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // 更新个人资料
  updateProfile: async (data: ProfileUpdateRequest) => {
    try {
      const response = await sessionHttpClient.put('/patients/profile', data);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // 更改密码
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await sessionHttpClient.post('/users/change-password', {
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
      const response = await sessionHttpClient.get('/users/notification-preferences');
      return handleApiResponse(response);
    } catch (error) {
      console.error('Get notification preferences error:', error);
      throw error;
    }
  },

  // 更新通知偏好
  updateNotificationPreferences: async (data: NotificationPreferencesRequest) => {
    try {
      const response = await sessionHttpClient.put('/users/notification-preferences', data);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  },

  //=====================================================
  // 过敏信息管理
  //=====================================================
  
  // 获取所有过敏信息
  getAllergies: async (): Promise<Allergy[]> => {
    try {
      const response = await sessionHttpClient.get('/patients/allergies');
      return handleApiResponse<Allergy[]>(response);
    } catch (error) {
      console.error('Get allergies error:', error);
      throw error;
    }
  },

  // 添加过敏信息
  addAllergy: async (data: AllergyRequest): Promise<Allergy> => {
    try {
      const response = await sessionHttpClient.post('/patients/allergies', data);
      return handleApiResponse<Allergy>(response);
    } catch (error) {
      console.error('Add allergy error:', error);
      throw error;
    }
  },

  // 更新过敏信息
  updateAllergy: async (id: number, data: Partial<AllergyRequest>): Promise<Allergy> => {
    try {
      const response = await sessionHttpClient.put(`/patients/allergies/${id}`, data);
      return handleApiResponse<Allergy>(response);
    } catch (error) {
      console.error('Update allergy error:', error);
      throw error;
    }
  },

  // 删除过敏信息
  deleteAllergy: async (id: number) => {
    try {
      const response = await sessionHttpClient.delete(`/patients/allergies/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete allergy error:', error);
      throw error;
    }
  },

  //=====================================================
  // 紧急联系人管理
  //=====================================================
  
  // 获取所有紧急联系人
  getEmergencyContacts: async (): Promise<EmergencyContact[]> => {
    try {
      const response = await sessionHttpClient.get('/patients/emergency-contacts');
      return handleApiResponse<EmergencyContact[]>(response);
    } catch (error) {
      console.error('Get emergency contacts error:', error);
      throw error;
    }
  },

  // 添加紧急联系人
  addEmergencyContact: async (data: EmergencyContactRequest): Promise<EmergencyContact> => {
    try {
      const response = await sessionHttpClient.post('/patients/emergency-contacts', data);
      return handleApiResponse<EmergencyContact>(response);
    } catch (error) {
      console.error('Add emergency contact error:', error);
      throw error;
    }
  },

  // 更新紧急联系人
  updateEmergencyContact: async (id: number, data: Partial<EmergencyContactRequest>): Promise<EmergencyContact> => {
    try {
      const response = await sessionHttpClient.put(`/patients/emergency-contacts/${id}`, data);
      return handleApiResponse<EmergencyContact>(response);
    } catch (error) {
      console.error('Update emergency contact error:', error);
      throw error;
    }
  },

  // 删除紧急联系人
  deleteEmergencyContact: async (id: number) => {
    try {
      const response = await sessionHttpClient.delete(`/patients/emergency-contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete emergency contact error:', error);
      throw error;
    }
  },

  //=====================================================
  // 预约管理
  //=====================================================
  
  // 获取预约列表
  getAppointments: async (status?: string): Promise<Appointment[]> => {
    try {
      const params = status ? { params: { status } } : undefined;
      const response = await sessionHttpClient.get('/dashboard/patient-appointments', params);
      return handleApiResponse<Appointment[]>(response);
    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  },

  // 获取单个预约详情
  getAppointmentById: async (id: number): Promise<Appointment> => {
    try {
      const response = await sessionHttpClient.get(`/appointments/${id}`);
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Get appointment error:', error);
      throw error;
    }
  },

  // 创建预约
  createAppointment: async (appointmentData: AppointmentRequest): Promise<Appointment> => {
    try {
      console.log(`[Patient Client] Creating appointment via API endpoint`);
      const response = await sessionHttpClient.post('/appointments', appointmentData);
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // 取消预约
  cancelAppointment: async (id: number, reason: string): Promise<Appointment> => {
    try {
      const response = await sessionHttpClient.post(`/appointments/${id}/cancel`, { reason });
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  },

  // 确认预约
  confirmAppointment: async (id: number): Promise<Appointment> => {
    try {
      const response = await sessionHttpClient.post(`/appointments/${id}/confirm`);
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Confirm appointment error:', error);
      throw error;
    }
  },

  // 重新安排预约
  rescheduleAppointment: async (id: number, newDateTime: string): Promise<Appointment> => {
    try {
      const response = await sessionHttpClient.post(`/appointments/${id}/reschedule`, { 
        appointmentDateTime: newDateTime 
      });
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Reschedule appointment error:', error);
      throw error;
    }
  },

  // 获取医生可用时间段
  getDoctorAvailableSlots: async (doctorId: number, date: string) => {
    try {
      const response = await sessionHttpClient.get(
        `/appointments/doctors/${doctorId}/available-slots?date=${date}`
      );
      return handleApiResponse(response);
    } catch (error) {
      console.error('Get doctor available slots error:', error);
      throw error;
    }
  },

  // 获取预约相关的医疗记录
  getAppointmentMedicalRecord: async (appointmentId: number): Promise<MedicalRecord> => {
    try {
      const response = await sessionHttpClient.get(`/appointments/${appointmentId}/medical-record`);
      return handleApiResponse<MedicalRecord>(response);
    } catch (error) {
      console.error('Get appointment medical record error:', error);
      throw error;
    }
  },

  //=====================================================
  // 医疗记录查询
  //=====================================================
  
  // 获取所有医疗记录
  getMedicalRecords: async (): Promise<MedicalRecord[]> => {
    try {
      console.log('Patient client: Attempting to fetch medical records');
      const response = await sessionHttpClient.get('/medical-records/patient/records');
      const records = handleApiResponse<MedicalRecord[]>(response);
      console.log(`Successfully fetched ${records.length} medical records`);
      return records;
    } catch (error: any) {
      // Provide more detailed error information
      console.error('Get medical records error:', error);
      
      // Log detailed error info when available
      if (error.response) {
        console.error(`API response error: ${error.response.status} - ${error.response.statusText}`);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received from server');
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // Return an empty array instead of throwing the error
      // This prevents the UI from breaking while still logging the error
      console.log('Returning empty array due to API error');
      return [];
    }
  },

  // 获取单个医疗记录详情
  getMedicalRecordById: async (id: number): Promise<MedicalRecord> => {
    try {
      const response = await sessionHttpClient.get(`/medical-records/${id}`);
      return handleApiResponse<MedicalRecord>(response);
    } catch (error) {
      console.error('Get medical record error:', error);
      throw error;
    }
  },

  // 获取医疗记录的附件
  getMedicalRecordAttachments: async (recordId: number): Promise<MedicalRecordAttachment[]> => {
    try {
      const response = await sessionHttpClient.get(`/medical-records/${recordId}/attachments`);
      // Assume the API returns an array of attachments with correct field names
      return handleApiResponse<MedicalRecordAttachment[]>(response);
    } catch (error) {
      console.error('Get medical record attachments error:', error);
      return [];
    }
  },

  //=====================================================
  // 医生和部门查询
  //=====================================================
  
  // 获取所有部门
  getDepartments: async (): Promise<Department[]> => {
    try {
      const response = await sessionHttpClient.get('/dashboard/departments');
      return handleApiResponse<Department[]>(response);
    } catch (error) {
      console.error('Get departments error:', error);
      throw error;
    }
  },

  // 获取单个部门详情
  getDepartmentById: async (id: number): Promise<Department> => {
    try {
      const response = await sessionHttpClient.get(`/departments/${id}`);
      return handleApiResponse<Department>(response);
    } catch (error) {
      console.error('Get department error:', error);
      throw error;
    }
  },

  // 获取所有医生
  getDoctors: async (): Promise<Doctor[]> => {
    try {
      const response = await sessionHttpClient.get('/dashboard/doctors');
      return handleApiResponse<Doctor[]>(response);
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  },

  // 获取医生详情
  getDoctorById: async (doctorId: number | string) => {
    try {
      console.log(`[Patient Client] Fetching doctor info using API endpoint, ID: ${doctorId}`);
      const response = await sessionHttpClient.get(`/dashboard/doctors/${doctorId}`);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      throw error;
    }
  },

  // 获取可用医生列表
  getAvailableDoctors: async (date: string): Promise<Doctor[]> => {
    try {
      // 使用带缓存的请求，1分钟缓存时间 (因为可用性会变化)
      return await sessionCachedGet<Doctor[]>(`/doctors/available?date=${date}`, undefined, 60000);
    } catch (error) {
      console.error('Get available doctors error:', error);
      throw error;
    }
  },

  // 获取医生排班
  getDoctorSchedule: async (
    doctorId: number, 
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ) => {
    try {
      const response = await sessionHttpClient.get(`/doctors/${doctorId}/schedule`, { params });
      return handleApiResponse(response);
    } catch (error) {
      console.error('Get doctor schedule error:', error);
      throw error;
    }
  },

  //=====================================================
  // 评价管理
  //=====================================================
  
  // 提交医生评价
  submitReview: async (data: ReviewRequest): Promise<Review> => {
    try {
      const response = await sessionHttpClient.post('/reviews', data);
      return handleApiResponse<Review>(response);
    } catch (error) {
      console.error('Submit review error:', error);
      throw error;
    }
  },

  // 获取自己提交的评价
  getMyReviews: async (): Promise<Review[]> => {
    try {
      const response = await sessionHttpClient.get('/patients/reviews');
      return handleApiResponse<Review[]>(response);
    } catch (error) {
      console.error('Get my reviews error:', error);
      throw error;
    }
  },

  // 更新评价
  updateReview: async (id: number, data: Partial<ReviewRequest>): Promise<Review> => {
    try {
      const response = await sessionHttpClient.put(`/reviews/${id}`, data);
      return handleApiResponse<Review>(response);
    } catch (error) {
      console.error('Update review error:', error);
      throw error;
    }
  },

  // 删除评价
  deleteReview: async (id: number) => {
    try {
      const response = await sessionHttpClient.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete review error:', error);
      throw error;
    }
  },
};

export default patientClient; 