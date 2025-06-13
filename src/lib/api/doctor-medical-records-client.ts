import httpClient, { handleApiResponse, ApiResponse } from './http-client';

// Doctor Medical Record interface
export interface DoctorMedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number | null;
  diagnosis: string;
  prescription: any;
  notes: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  appointment: {
    id: number;
    dateTime: string;
    type: string;
    status: string;
  } | null;
}

// Doctor Medical Records Statistics interface
export interface DoctorMedicalRecordsStats {
  totalRecords: number;
  recordsThisMonth: number;
  recordsThisWeek: number;
  uniquePatients: number;
  recordsWithPrescription: number;
}

// Get Medical Records Parameters
export interface GetDoctorMedicalRecordsParams {
  page?: number;
  limit?: number;
  search?: string;
  patientId?: string | number;
  dateFrom?: string;
  dateTo?: string;
}

// Pagination Response
export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const doctorMedicalRecordsClient = {
  /**
   * Get all medical records created by the doctor
   */
  async getMedicalRecords(params?: GetDoctorMedicalRecordsParams): Promise<PaginationResponse<DoctorMedicalRecord>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.patientId) queryParams.append('patientId', params.patientId.toString());
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const url = `/doctors/medical-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get(url);
    
    if (response.data && response.data.success) {
      return {
        data: response.data.data as DoctorMedicalRecord[],
        pagination: response.data.pagination
      };
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Get statistics for doctor's medical records
   */
  async getStats(): Promise<DoctorMedicalRecordsStats> {
    const response = await httpClient.get('/doctors/medical-records/stats');
    
    if (response.data && response.data.success) {
      return response.data.data as DoctorMedicalRecordsStats;
    }
    
    throw new Error('Invalid response format');
  }
};

export default doctorMedicalRecordsClient; 