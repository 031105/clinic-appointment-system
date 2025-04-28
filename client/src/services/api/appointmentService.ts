import { api } from './httpClient';

// 预约状态类型
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

// 预约信息类型
export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDateTime: string;
  endDateTime: string;
  status: AppointmentStatus;
  type: string;
  reason?: string;
  symptoms?: string[];
  notes?: string;
  cancellationReason?: string;
  consultation?: {
    diagnosis?: string;
    prescription?: string;
    followUpRequired?: boolean;
    followUpDate?: string;
  };
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: number;
    userId: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  };
  doctor?: {
    id: number;
    userId: number;
    specialty: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    department: {
      id: number;
      name: string;
    };
  };
}

// 创建预约请求类型
export interface CreateAppointmentRequest {
  doctorId: number;
  appointmentDateTime: string;
  duration?: number;
  type: string;
  reason?: string;
  symptoms?: string[];
}

// 预约查询参数
export interface AppointmentQueryParams {
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  doctorId?: number;
  patientId?: number;
}

// 预约服务
export const appointmentService = {
  /**
   * 创建预约
   * @param appointmentData 预约数据
   * @returns 创建的预约
   */
  createAppointment: async (appointmentData: CreateAppointmentRequest): Promise<Appointment> => {
    return await api.post<Appointment>('/appointments', appointmentData);
  },
  
  /**
   * 获取预约列表
   * @param params 查询参数
   * @returns 预约列表
   */
  getAppointments: async (params?: AppointmentQueryParams): Promise<Appointment[]> => {
    return await api.get<Appointment[]>('/appointments', params);
  },
  
  /**
   * 根据ID获取预约详情
   * @param id 预约ID
   * @returns 预约详情
   */
  getAppointmentById: async (id: number): Promise<Appointment> => {
    return await api.get<Appointment>(`/appointments/${id}`);
  },
  
  /**
   * 更新预约状态
   * @param id 预约ID
   * @param status 新状态
   * @param cancellationReason 取消原因(可选)
   * @returns 更新后的预约
   */
  updateAppointmentStatus: async (
    id: number, 
    status: AppointmentStatus, 
    cancellationReason?: string
  ): Promise<Appointment> => {
    return await api.patch<Appointment>(`/appointments/${id}/status`, {
      status,
      cancellationReason
    });
  },
  
  /**
   * 添加预约笔记
   * @param id 预约ID
   * @param notes 笔记内容
   * @returns 更新后的预约
   */
  addAppointmentNotes: async (id: number, notes: string): Promise<Appointment> => {
    return await api.patch<Appointment>(`/appointments/${id}/notes`, { notes });
  },
  
  /**
   * 添加诊断和处方
   * @param id 预约ID
   * @param consultation 诊断和处方信息
   * @returns 更新后的预约
   */
  addConsultation: async (id: number, consultation: {
    diagnosis: string;
    prescription?: string;
    followUpRequired?: boolean;
    followUpDate?: string;
  }): Promise<Appointment> => {
    return await api.post<Appointment>(`/appointments/${id}/consultation`, consultation);
  },
  
  /**
   * 重新安排预约
   * @param id 预约ID
   * @param newDateTime 新日期时间
   * @returns 更新后的预约
   */
  rescheduleAppointment: async (id: number, newDateTime: string): Promise<Appointment> => {
    return await api.patch<Appointment>(`/appointments/${id}/reschedule`, { appointmentDateTime: newDateTime });
  },
  
  /**
   * 获取患者的预约历史
   * @returns 患者的所有预约
   */
  getPatientAppointmentHistory: async (): Promise<Appointment[]> => {
    return await api.get<Appointment[]>('/appointments/patient-history');
  },
  
  /**
   * 获取医生的预约日程
   * @param date 日期
   * @returns 当日预约
   */
  getDoctorScheduleByDate: async (date: string): Promise<Appointment[]> => {
    return await api.get<Appointment[]>('/appointments/doctor-schedule', { date });
  }
}; 