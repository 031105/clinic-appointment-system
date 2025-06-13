import httpClient, { handleApiResponse, ApiResponse } from './http-client';

// Admin Medical Record interface (with additional fields)
export interface AdminMedicalRecord {
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
  doctor: {
    id: number;
    firstName: string;
    lastName: string;
    specialty: string;
    department: string;
  };
  appointment: {
    id: number;
    dateTime: string;
    type: string;
    status: string;
  } | null;
}

// Admin Medical Records Statistics interface
export interface AdminMedicalRecordsStats {
  overview: {
    totalRecords: number;
    recordsThisMonth: number;
    recordsThisWeek: number;
    totalPatients: number;
    totalDoctors: number;
    recordsWithPrescription: number;
  };
  departmentStats: Array<{
    departmentName: string;
    recordCount: number;
  }>;
  topDoctors: Array<{
    doctorName: string;
    recordCount: number;
  }>;
}

// Get Medical Records Parameters for Admin
export interface GetAdminMedicalRecordsParams {
  page?: number;
  limit?: number;
  search?: string;
  patientId?: string | number;
  doctorId?: string | number;
  departmentId?: string | number;
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

export const adminMedicalRecordsClient = {
  /**
   * Get all medical records with admin privileges
   */
  async getMedicalRecords(params?: GetAdminMedicalRecordsParams): Promise<PaginationResponse<AdminMedicalRecord>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.patientId) queryParams.append('patientId', params.patientId.toString());
    if (params?.doctorId) queryParams.append('doctorId', params.doctorId.toString());
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId.toString());
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const url = `/admin/medical-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get(url);
    
    if (response.data && response.data.success) {
      return {
        data: response.data.data as AdminMedicalRecord[],
        pagination: response.data.pagination
      };
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Get comprehensive statistics for all medical records
   */
  async getStats(): Promise<AdminMedicalRecordsStats> {
    const response = await httpClient.get('/admin/medical-records/stats');
    
    if (response.data && response.data.success) {
      return response.data.data as AdminMedicalRecordsStats;
    }
    
    throw new Error('Invalid response format');
  }
};

export default adminMedicalRecordsClient; 