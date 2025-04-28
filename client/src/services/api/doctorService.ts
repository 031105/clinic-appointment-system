import { api } from './httpClient';

// 医生信息类型
export interface Doctor {
  id: number;
  userId: number;
  specialty: string;
  licenseNumber: string;
  qualification: string;
  experience: number;
  department: Department;
  departmentId: number;
  bio?: string;
  consultationFee?: number;
  education?: string[];
  languages?: string[];
  awards?: string[];
  averageRating?: number;
  totalReviews?: number;
  schedule?: Schedule[];
  unavailableTimes?: UnavailableTime[];
  createdAt: string;
  updatedAt: string;
}

// 科室类型
export interface Department {
  id: number;
  name: string;
  description?: string;
}

// 排班类型
export interface Schedule {
  id?: number;
  dayOfWeek: number; // 0-6，代表周日到周六
  startTime: string; // 格式: "HH:MM"
  endTime: string; // 格式: "HH:MM"
  breakStart?: string; // 休息开始时间
  breakEnd?: string; // 休息结束时间
  slotDuration: number; // 每个时段的时长（分钟）
}

// 不可用时间类型
export interface UnavailableTime {
  id?: number;
  startDateTime: string; // ISO日期时间格式
  endDateTime: string; // ISO日期时间格式
  reason?: string;
}

// 医生查询参数
export interface DoctorQueryParams {
  specialty?: string;
  departmentId?: number;
  availableDate?: string;
  availableTime?: string;
  rating?: number;
  name?: string;
}

// 医生服务
export const doctorService = {
  /**
   * 获取医生个人资料
   * @returns 医生资料
   */
  getProfile: async (): Promise<Doctor> => {
    return await api.get<Doctor>('/doctors/profile');
  },
  
  /**
   * 更新医生资料
   * @param profileData 要更新的资料
   * @returns 更新后的医生资料
   */
  updateProfile: async (profileData: Partial<Doctor>): Promise<Doctor> => {
    return await api.patch<Doctor>('/doctors/profile', profileData);
  },
  
  /**
   * 获取所有医生列表
   * @param params 筛选参数
   * @returns 医生列表
   */
  getAllDoctors: async (params?: DoctorQueryParams): Promise<Doctor[]> => {
    return await api.get<Doctor[]>('/doctors', params);
  },
  
  /**
   * 根据ID获取医生信息
   * @param id 医生ID
   * @returns 医生信息
   */
  getDoctorById: async (id: number): Promise<Doctor> => {
    return await api.get<Doctor>(`/doctors/${id}`);
  },
  
  /**
   * 获取医生的排班表
   * @returns 排班表
   */
  getSchedule: async (): Promise<Schedule[]> => {
    return await api.get<Schedule[]>('/doctors/schedule');
  },
  
  /**
   * 更新医生排班表
   * @param schedules 排班表
   * @returns 更新后的排班表
   */
  updateSchedule: async (schedules: Schedule[]): Promise<Schedule[]> => {
    return await api.put<Schedule[]>('/doctors/schedule', { schedules });
  },
  
  /**
   * 获取不可用时间
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 不可用时间列表
   */
  getUnavailableTimes: async (startDate?: string, endDate?: string): Promise<UnavailableTime[]> => {
    return await api.get<UnavailableTime[]>('/doctors/unavailable-time', { startDate, endDate });
  },
  
  /**
   * 添加不可用时间（请假）
   * @param unavailableTime 不可用时间信息
   * @returns 添加后的不可用时间
   */
  addUnavailableTime: async (unavailableTime: UnavailableTime): Promise<UnavailableTime> => {
    return await api.post<UnavailableTime>('/doctors/unavailable-time', unavailableTime);
  },
  
  /**
   * 删除不可用时间（取消请假）
   * @param id 不可用时间ID
   */
  removeUnavailableTime: async (id: number): Promise<void> => {
    await api.delete(`/doctors/unavailable-time/${id}`);
  },
  
  /**
   * 获取可用时间段
   * @param date 日期
   * @returns 可用时间段
   */
  getAvailableSlots: async (date: string): Promise<{ startTime: string; endTime: string }[]> => {
    return await api.get<{ startTime: string; endTime: string }[]>(`/doctors/available-slots`, { date });
  },
  
  /**
   * 获取特定日期的预约
   * @param date 日期
   * @returns 预约列表
   */
  getAppointmentsByDate: async (date: string): Promise<any[]> => {
    return await api.get<any[]>('/doctors/appointments-by-date', { date });
  },
  
  /**
   * 获取所有科室列表
   * @returns 科室列表
   */
  getAllDepartments: async (): Promise<Department[]> => {
    return await api.get<Department[]>('/departments');
  }
}; 