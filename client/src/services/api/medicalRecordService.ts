import { api } from './httpClient';

// 医疗记录类型
export interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  recordType: 'consultation' | 'test' | 'procedure' | 'hospitalization' | 'other';
  title: string;
  description: string;
  dateOfRecord: string;
  diagnosis?: string;
  prescription?: string[];
  labResults?: any;
  attachments?: Attachment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    id: number;
    specialty: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

// 附件类型
export interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

// 创建医疗记录请求
export interface CreateMedicalRecordRequest {
  patientId: number;
  recordType: 'consultation' | 'test' | 'procedure' | 'hospitalization' | 'other';
  title: string;
  description: string;
  dateOfRecord: string;
  diagnosis?: string;
  prescription?: string[];
  notes?: string;
  appointmentId?: number;
}

// 医疗记录查询参数
export interface MedicalRecordQueryParams {
  recordType?: string;
  startDate?: string;
  endDate?: string;
  doctorId?: number;
}

// 医疗记录服务
export const medicalRecordService = {
  /**
   * 获取患者的医疗记录列表
   * @param params 查询参数
   * @returns 医疗记录列表
   */
  getPatientMedicalRecords: async (params?: MedicalRecordQueryParams): Promise<MedicalRecord[]> => {
    return await api.get<MedicalRecord[]>('/medical-records/patient', params);
  },
  
  /**
   * 获取医生创建的医疗记录列表
   * @param params 查询参数
   * @returns 医疗记录列表
   */
  getDoctorMedicalRecords: async (params?: MedicalRecordQueryParams): Promise<MedicalRecord[]> => {
    return await api.get<MedicalRecord[]>('/medical-records/doctor', params);
  },
  
  /**
   * 根据ID获取医疗记录详情
   * @param id 医疗记录ID
   * @returns 医疗记录详情
   */
  getMedicalRecordById: async (id: number): Promise<MedicalRecord> => {
    return await api.get<MedicalRecord>(`/medical-records/${id}`);
  },
  
  /**
   * 创建新的医疗记录
   * @param recordData 医疗记录数据
   * @returns 创建的医疗记录
   */
  createMedicalRecord: async (recordData: CreateMedicalRecordRequest): Promise<MedicalRecord> => {
    return await api.post<MedicalRecord>('/medical-records', recordData);
  },
  
  /**
   * 更新医疗记录
   * @param id 医疗记录ID
   * @param recordData 要更新的数据
   * @returns 更新后的医疗记录
   */
  updateMedicalRecord: async (id: number, recordData: Partial<CreateMedicalRecordRequest>): Promise<MedicalRecord> => {
    return await api.patch<MedicalRecord>(`/medical-records/${id}`, recordData);
  },
  
  /**
   * 上传医疗记录附件
   * @param recordId 医疗记录ID
   * @param file 文件
   * @returns 上传的附件信息
   */
  uploadAttachment: async (recordId: number, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // 使用fetch API直接上传文件
    const response = await fetch(`${api.baseUrl}/medical-records/${recordId}/attachments`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload attachment');
    }
    
    return await response.json();
  },
  
  /**
   * 删除医疗记录附件
   * @param recordId 医疗记录ID
   * @param attachmentId 附件ID
   */
  deleteAttachment: async (recordId: number, attachmentId: number): Promise<void> => {
    await api.delete(`/medical-records/${recordId}/attachments/${attachmentId}`);
  },
  
  /**
   * 获取特定预约的医疗记录
   * @param appointmentId 预约ID
   * @returns 关联的医疗记录
   */
  getMedicalRecordByAppointment: async (appointmentId: number): Promise<MedicalRecord> => {
    return await api.get<MedicalRecord>(`/medical-records/appointment/${appointmentId}`);
  }
}; 