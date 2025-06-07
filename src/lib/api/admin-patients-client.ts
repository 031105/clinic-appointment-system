import httpClient from './http-client';

// Type definitions
export interface Patient {
  id: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  last_visit?: string;
  allergy_count?: number;
  allergies?: Allergy[];
  stats?: PatientStats;
}

export interface Allergy {
  id: number;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface PatientStats {
  total_appointments: number;
  completed_appointments: number;
  medical_records_count: number;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  diagnosis: string;
  prescription?: string[];
  notes?: string;
  date: string;
  created_at: string;
  updated_at: string;
  doctor_name: string;
  appointment_datetime?: string;
  appointment_type?: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: Array<{
    name: string;
    severity?: 'mild' | 'moderate' | 'severe';
  }>;
}

export interface CreatePatientResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    user_id: number;
    temp_password: string;
    email: string;
  };
}

export interface GetPatientsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
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

export interface AddMedicalRecordRequest {
  doctorId: number;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  recordDate?: string;
}

// API client
export const adminPatientsClient = {
  
  /**
   * Get all patients with pagination, search, and filtering
   */
  async getPatients(params?: GetPatientsParams): Promise<Patient[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/admin/patients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get(url);
    
    if (response.data && response.data.data) {
      return response.data.data as Patient[];
    }
    
    console.error('[AdminPatientsClient] Invalid response format:', response.data);
    return [];
  },

  /**
   * Get patients with pagination response
   */
  async getPatientsWithPagination(params?: GetPatientsParams): Promise<PaginationResponse<Patient>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/admin/patients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get(url);
    
    if (response.data) {
      return response.data as PaginationResponse<Patient>;
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Get patient by ID with detailed information
   */
  async getPatientById(id: string | number): Promise<Patient> {
    const response = await httpClient.get(`/admin/patients/${id}`);
    
    if (response.data && response.data.data) {
      return response.data.data as Patient;
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Get patient medical records
   */
  async getPatientMedicalRecords(
    id: string | number, 
    params?: { page?: number; limit?: number }
  ): Promise<MedicalRecord[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/patients/${id}/medical-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get(url);
    
    if (response.data && response.data.data) {
      return response.data.data as MedicalRecord[];
    }
    
    console.error('[AdminPatientsClient] Invalid response format:', response.data);
    return [];
  },

  /**
   * Get patient medical records with pagination
   */
  async getPatientMedicalRecordsWithPagination(
    id: string | number, 
    params?: { page?: number; limit?: number }
  ): Promise<PaginationResponse<MedicalRecord>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/patients/${id}/medical-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get(url);
    
    if (response.data) {
      return response.data as PaginationResponse<MedicalRecord>;
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Create new patient (admin quick registration)
   */
  async createPatient(data: CreatePatientRequest): Promise<CreatePatientResponse> {
    const response = await httpClient.post('/admin/patients', data);
    
    if (response.data) {
      return response.data as CreatePatientResponse;
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Update patient status
   */
  async updatePatientStatus(id: string | number, status: 'active' | 'inactive'): Promise<void> {
    const response = await httpClient.patch(`/admin/patients/${id}/status`, { status });
    
    if (!response.data || !response.data.success) {
      throw new Error('Failed to update patient status');
    }
  },

  /**
   * Add medical record for patient
   */
  async addMedicalRecord(id: string | number, data: AddMedicalRecordRequest): Promise<{ record_id: number }> {
    const response = await httpClient.post(`/admin/patients/${id}/medical-records`, data);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Search patients by query
   */
  async searchPatients(query: string): Promise<Patient[]> {
    return this.getPatients({ search: query, limit: 20 });
  },

  /**
   * Get active patients only
   */
  async getActivePatients(params?: Omit<GetPatientsParams, 'status'>): Promise<Patient[]> {
    return this.getPatients({ ...params, status: 'active' });
  },

  /**
   * Get inactive patients only
   */
  async getInactivePatients(params?: Omit<GetPatientsParams, 'status'>): Promise<Patient[]> {
    return this.getPatients({ ...params, status: 'inactive' });
  }
}; 