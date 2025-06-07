import httpClient from './http-client';

// Type definitions
export interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  department_id: number;
  appointment_datetime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  doctor_name: string;
  doctor_specialty: string;
  department_name: string;
}

export interface CalendarAppointment extends Appointment {
  is_emergency?: boolean;
  is_long_appointment?: boolean;
  has_conflicts?: boolean;
  conflict_type?: string;
}

export interface CreateAppointmentRequest {
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  type?: string;
  notes?: string;
}

export interface GetAppointmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string;
  doctor_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface GetCalendarAppointmentsParams {
  date_from: string;
  date_to: string;
  view?: 'month' | 'week' | 'day';
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

export interface CalendarResponse {
  success: boolean;
  data: {
    appointments: CalendarAppointment[];
    view_type: string;
    date_range: {
      from: string;
      to: string;
    };
  };
}

export interface Department {
  department_id: number;
  name: string;
  description?: string;
  color?: string;
}

export interface Doctor {
  doctor_id: number;
  user_id: number;
  name: string;
  specialty: string;
  department_id: number;
  department_name: string;
  consultation_fee?: number;
  color?: string;
}

export interface Patient {
  patient_id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
}

export interface DepartmentsAndDoctorsResponse {
  success: boolean;
  data: {
    departments: Department[];
    doctors: Doctor[];
    patients: Patient[];
  };
}

export interface ColorAssignmentsResponse {
  success: boolean;
  data: {
    departments: Department[];
    doctors: Doctor[];
    statusColors: {
      scheduled: string;
      completed: string;
      cancelled: string;
      no_show: string;
    };
    specialTypes: {
      emergency: string;
      long_appointment: string;
      same_patient_multiple: string;
      scheduling_conflict: string;
    };
  };
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOptionsResponse {
  success: boolean;
  data: {
    statusOptions: FilterOption[];
    appointmentTypes: FilterOption[];
  };
}

// API client
export const adminAppointmentsClient = {
  
  /**
   * Get all appointments with pagination, search, and filtering
   */
  async getAppointments(params?: GetAppointmentsParams): Promise<Appointment[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.department_id) queryParams.append('department_id', params.department_id);
    if (params?.doctor_id) queryParams.append('doctor_id', params.doctor_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/admin/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get(url);
    
    if (response.data && response.data.data) {
      return response.data.data as Appointment[];
    }
    
    console.error('[AdminAppointmentsClient] Invalid response format:', response.data);
    return [];
  },

  /**
   * Get appointments with pagination response
   */
  async getAppointmentsWithPagination(params?: GetAppointmentsParams): Promise<PaginationResponse<Appointment>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.department_id) queryParams.append('department_id', params.department_id);
    if (params?.doctor_id) queryParams.append('doctor_id', params.doctor_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/admin/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get(url);
    
    if (response.data) {
      return response.data as PaginationResponse<Appointment>;
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Get calendar appointments for a specific date range
   */
  async getCalendarAppointments(params: GetCalendarAppointmentsParams): Promise<CalendarResponse['data']> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('date_from', params.date_from);
    queryParams.append('date_to', params.date_to);
    if (params.view) queryParams.append('view', params.view);

    const url = `/admin/appointments/calendar?${queryParams.toString()}`;
    const response = await httpClient.get(url);
    
    if (response.data && response.data.data) {
      return response.data.data as CalendarResponse['data'];
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id: string | number): Promise<Appointment> {
    const response = await httpClient.get(`/admin/appointments/${id}`);
    
    if (response.data && response.data.data) {
      return response.data.data as Appointment;
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Create new appointment
   */
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<{
    appointment_id: number;
    appointment_datetime: string;
    status: string;
  }> {
    const response = await httpClient.post('/admin/appointments', appointmentData);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || 'Failed to create appointment');
  },

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(id: string | number, status: string): Promise<{
    appointment_id: number;
    status: string;
  }> {
    const response = await httpClient.patch(`/admin/appointments/${id}/status`, { status });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || 'Failed to update appointment status');
  },

  /**
   * Get departments and doctors for dropdowns
   */
  async getDepartmentsAndDoctors(): Promise<DepartmentsAndDoctorsResponse['data']> {
    const response = await httpClient.get('/admin/appointments/data/departments-doctors');
    
    if (response.data && response.data.data) {
      return response.data.data as DepartmentsAndDoctorsResponse['data'];
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Get dynamic color assignments for calendar
   */
  async getColorAssignments(): Promise<ColorAssignmentsResponse['data']> {
    const response = await httpClient.get('/admin/appointments/data/color-assignments');
    
    if (response.data && response.data.data) {
      return response.data.data as ColorAssignmentsResponse['data'];
    }
    
    throw new Error('Invalid response format');
  },

  /**
   * Get filter options (status, appointment types)
   */
  async getFilterOptions(): Promise<FilterOptionsResponse['data']> {
    const response = await httpClient.get('/admin/appointments/data/filter-options');
    
    if (response.data && response.data.data) {
      return response.data.data as FilterOptionsResponse['data'];
    }
    
    throw new Error('Invalid response format');
  }
};

export default adminAppointmentsClient; 