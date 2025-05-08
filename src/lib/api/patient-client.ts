import httpClient, { handleApiResponse } from './http-client';

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
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    user: {
      firstName: string;
      lastName: string;
    }
  };
}

// 患者API客户端
const patientClient = {
  //=====================================================
  // 个人资料管理
  //=====================================================
  
  // 获取个人资料
  getProfile: async () => {
    try {
      const response = await httpClient.get('/patients/profile');
      return handleApiResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // 更新个人资料
  updateProfile: async (data: ProfileUpdateRequest) => {
    try {
      const response = await httpClient.put('/patients/profile', data);
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
  // 过敏信息管理
  //=====================================================
  
  // 获取所有过敏信息
  getAllergies: async (): Promise<Allergy[]> => {
    try {
      const response = await httpClient.get('/patients/allergies');
      return handleApiResponse<Allergy[]>(response);
    } catch (error) {
      console.error('Get allergies error:', error);
      throw error;
    }
  },

  // 添加过敏信息
  addAllergy: async (data: AllergyRequest): Promise<Allergy> => {
    try {
      const response = await httpClient.post('/patients/allergies', data);
      return handleApiResponse<Allergy>(response);
    } catch (error) {
      console.error('Add allergy error:', error);
      throw error;
    }
  },

  // 更新过敏信息
  updateAllergy: async (id: number, data: Partial<AllergyRequest>): Promise<Allergy> => {
    try {
      const response = await httpClient.put(`/patients/allergies/${id}`, data);
      return handleApiResponse<Allergy>(response);
    } catch (error) {
      console.error('Update allergy error:', error);
      throw error;
    }
  },

  // 删除过敏信息
  deleteAllergy: async (id: number) => {
    try {
      const response = await httpClient.delete(`/patients/allergies/${id}`);
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
      const response = await httpClient.get('/patients/emergency-contacts');
      return handleApiResponse<EmergencyContact[]>(response);
    } catch (error) {
      console.error('Get emergency contacts error:', error);
      throw error;
    }
  },

  // 添加紧急联系人
  addEmergencyContact: async (data: EmergencyContactRequest): Promise<EmergencyContact> => {
    try {
      const response = await httpClient.post('/patients/emergency-contacts', data);
      return handleApiResponse<EmergencyContact>(response);
    } catch (error) {
      console.error('Add emergency contact error:', error);
      throw error;
    }
  },

  // 更新紧急联系人
  updateEmergencyContact: async (id: number, data: Partial<EmergencyContactRequest>): Promise<EmergencyContact> => {
    try {
      const response = await httpClient.put(`/patients/emergency-contacts/${id}`, data);
      return handleApiResponse<EmergencyContact>(response);
    } catch (error) {
      console.error('Update emergency contact error:', error);
      throw error;
    }
  },

  // 删除紧急联系人
  deleteEmergencyContact: async (id: number) => {
    try {
      const response = await httpClient.delete(`/patients/emergency-contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete emergency contact error:', error);
      throw error;
    }
  },

  //=====================================================
  // 预约管理
  //=====================================================
  
  // 获取所有预约
  getAppointments: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> => {
    try {
      const response = await httpClient.get('/appointments', { params });
      return handleApiResponse<Appointment[]>(response);
    } catch (error) {
      console.error('Get appointments error:', error);
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

  // 创建新预约
  createAppointment: async (data: AppointmentRequest): Promise<Appointment> => {
    try {
      const response = await httpClient.post('/appointments', data);
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  },

  // 取消预约
  cancelAppointment: async (id: number, reason: string): Promise<Appointment> => {
    try {
      const response = await httpClient.post(`/appointments/${id}/cancel`, { reason });
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  },

  // 重新安排预约
  rescheduleAppointment: async (id: number, newDateTime: string): Promise<Appointment> => {
    try {
      const response = await httpClient.post(`/appointments/${id}/reschedule`, { 
        appointmentDateTime: newDateTime 
      });
      return handleApiResponse<Appointment>(response);
    } catch (error) {
      console.error('Reschedule appointment error:', error);
      throw error;
    }
  },

  //=====================================================
  // 医疗记录查询
  //=====================================================
  
  // 获取所有医疗记录
  getMedicalRecords: async (): Promise<MedicalRecord[]> => {
    try {
      const response = await httpClient.get('/patients/medical-records');
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

  // 获取预约相关的医疗记录
  getMedicalRecordByAppointment: async (appointmentId: number): Promise<MedicalRecord> => {
    try {
      const response = await httpClient.get(`/appointments/${appointmentId}/medical-record`);
      return handleApiResponse<MedicalRecord>(response);
    } catch (error) {
      console.error('Get appointment medical record error:', error);
      throw error;
    }
  },

  //=====================================================
  // 医生和部门查询
  //=====================================================
  
  // 获取所有部门
  getDepartments: async (): Promise<Department[]> => {
    try {
      const response = await httpClient.get('/departments');
      return handleApiResponse<Department[]>(response);
    } catch (error) {
      console.error('Get departments error:', error);
      throw error;
    }
  },

  // 获取单个部门详情
  getDepartmentById: async (id: number): Promise<Department> => {
    try {
      const response = await httpClient.get(`/departments/${id}`);
      return handleApiResponse<Department>(response);
    } catch (error) {
      console.error('Get department error:', error);
      throw error;
    }
  },

  // 获取所有医生
  getDoctors: async (params?: {
    departmentId?: number;
    specialization?: string;
    searchTerm?: string;
  }): Promise<Doctor[]> => {
    try {
      const response = await httpClient.get('/doctors', { params });
      return handleApiResponse<Doctor[]>(response);
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  },

  // 获取单个医生详情
  getDoctorById: async (id: number): Promise<Doctor> => {
    try {
      const response = await httpClient.get(`/doctors/${id}`);
      return handleApiResponse<Doctor>(response);
    } catch (error) {
      console.error('Get doctor error:', error);
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
      const response = await httpClient.get(`/doctors/${doctorId}/schedule`, { params });
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
      const response = await httpClient.post('/reviews', data);
      return handleApiResponse<Review>(response);
    } catch (error) {
      console.error('Submit review error:', error);
      throw error;
    }
  },

  // 获取自己提交的评价
  getMyReviews: async (): Promise<Review[]> => {
    try {
      const response = await httpClient.get('/patients/reviews');
      return handleApiResponse<Review[]>(response);
    } catch (error) {
      console.error('Get my reviews error:', error);
      throw error;
    }
  },

  // 更新评价
  updateReview: async (id: number, data: Partial<ReviewRequest>): Promise<Review> => {
    try {
      const response = await httpClient.put(`/reviews/${id}`, data);
      return handleApiResponse<Review>(response);
    } catch (error) {
      console.error('Update review error:', error);
      throw error;
    }
  },

  // 删除评价
  deleteReview: async (id: number) => {
    try {
      const response = await httpClient.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete review error:', error);
      throw error;
    }
  },

  //=====================================================
  // 支付相关
  //=====================================================
  
  // 获取账单历史
  getBillingHistory: async (): Promise<Bill[]> => {
    try {
      const response = await httpClient.get('/patients/billing');
      return handleApiResponse<Bill[]>(response);
    } catch (error) {
      console.error('Get billing history error:', error);
      throw error;
    }
  },

  // 获取单个账单详情
  getBillingById: async (id: number): Promise<Bill> => {
    try {
      const response = await httpClient.get(`/billing/${id}`);
      return handleApiResponse<Bill>(response);
    } catch (error) {
      console.error('Get billing error:', error);
      throw error;
    }
  },

  // 支付账单
  payBill: async (billingId: number, paymentMethod: string) => {
    try {
      const response = await httpClient.post(`/billing/${billingId}/pay`, { paymentMethod });
      return handleApiResponse(response);
    } catch (error) {
      console.error('Pay bill error:', error);
      throw error;
    }
  }
};

export default patientClient; 