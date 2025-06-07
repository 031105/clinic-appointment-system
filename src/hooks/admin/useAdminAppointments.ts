import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  adminAppointmentsClient,
  Appointment,
  CalendarAppointment,
  CreateAppointmentRequest,
  GetAppointmentsParams,
  GetCalendarAppointmentsParams,
  Department,
  Doctor,
  Patient,
  ColorAssignmentsResponse,
  FilterOption,
  FilterOptionsResponse
} from '@/lib/api/admin-appointments-client';

export interface UseAdminAppointmentsState {
  appointments: Appointment[];
  calendarData: {
    appointments: CalendarAppointment[];
    view_type: string;
    date_range: {
      from: string;
      to: string;
    };
  } | null;
  departments: Department[];
  doctors: Doctor[];
  patients: Patient[];
  colorAssignments: ColorAssignmentsResponse['data'] | null;
  filterOptions: FilterOptionsResponse['data'] | null;
  selectedAppointment: Appointment | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UseAdminAppointmentsReturn extends UseAdminAppointmentsState {
  // Data fetching
  fetchAppointments: (params?: GetAppointmentsParams) => Promise<void>;
  fetchCalendarAppointments: (params: GetCalendarAppointmentsParams) => Promise<void>;
  fetchAppointmentById: (id: string | number) => Promise<void>;
  fetchDepartmentsAndDoctors: () => Promise<void>;
  fetchColorAssignments: () => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
  
  // CRUD operations
  createAppointment: (data: CreateAppointmentRequest) => Promise<boolean>;
  updateAppointmentStatus: (id: string | number, status: string) => Promise<boolean>;
  
  // UI state management
  setSelectedAppointment: (appointment: Appointment | null) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export const useAdminAppointments = (initialParams?: GetAppointmentsParams): UseAdminAppointmentsReturn => {
  const [state, setState] = useState<UseAdminAppointmentsState>({
    appointments: [],
    calendarData: null,
    departments: [],
    doctors: [],
    patients: [],
    colorAssignments: null,
    filterOptions: null,
    selectedAppointment: null,
    loading: false,
    creating: false,
    updating: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  });

  const [lastParams, setLastParams] = useState<GetAppointmentsParams | undefined>(initialParams);

  const updateState = useCallback((updates: Partial<UseAdminAppointmentsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const fetchAppointments = useCallback(async (params?: GetAppointmentsParams) => {
    try {
      updateState({ loading: true, error: null });
      setLastParams(params);

      const response = await adminAppointmentsClient.getAppointmentsWithPagination(params);
      
      updateState({
        appointments: response.data,
        pagination: response.pagination,
        loading: false
      });
      
    } catch (error: any) {
      console.error('[useAdminAppointments] Failed to fetch appointments:', error);
      const errorMessage = error.message || 'Failed to fetch appointments';
      updateState({ 
        error: errorMessage, 
        loading: false,
        appointments: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      });
      toast.error(errorMessage);
    }
  }, [updateState]);

  const fetchCalendarAppointments = useCallback(async (params: GetCalendarAppointmentsParams) => {
    try {
      updateState({ loading: true, error: null });

      const response = await adminAppointmentsClient.getCalendarAppointments(params);
      
      updateState({
        calendarData: response.data,
        loading: false
      });
      
    } catch (error: any) {
      console.error('[useAdminAppointments] Failed to fetch calendar appointments:', error);
      const errorMessage = error.message || 'Failed to fetch calendar appointments';
      updateState({ 
        error: errorMessage, 
        loading: false,
        calendarData: null
      });
      toast.error(errorMessage);
    }
  }, [updateState]);

  const fetchAppointmentById = useCallback(async (id: string | number) => {
    try {
      updateState({ loading: true, error: null });

      const appointment = await adminAppointmentsClient.getAppointmentById(id);
      
      updateState({
        selectedAppointment: appointment,
        loading: false
      });
      
    } catch (error: any) {
      console.error('[useAdminAppointments] Failed to fetch appointment details:', error);
      const errorMessage = error.message || 'Failed to fetch appointment details';
      updateState({ 
        error: errorMessage, 
        loading: false,
        selectedAppointment: null
      });
      toast.error(errorMessage);
    }
  }, [updateState]);

  const fetchDepartmentsAndDoctors = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });

      const data = await adminAppointmentsClient.getDepartmentsAndDoctors();
      
      updateState({
        departments: data.departments,
        doctors: data.doctors,
        patients: data.patients,
        loading: false
      });
      
    } catch (error: any) {
      console.error('[useAdminAppointments] Failed to fetch departments and doctors:', error);
      const errorMessage = error.message || 'Failed to fetch departments and doctors';
      updateState({ 
        error: errorMessage, 
        loading: false,
        departments: [],
        doctors: [],
        patients: []
      });
      toast.error(errorMessage);
    }
  }, [updateState]);

  const fetchColorAssignments = useCallback(async () => {
    try {
      const colorAssignments = await adminAppointmentsClient.getColorAssignments();
      
      updateState({
        colorAssignments
      });
      
    } catch (error: any) {
      console.error('[useAdminAppointments] Failed to fetch color assignments:', error);
      // This is not critical, so we don't show error to user
    }
  }, [updateState]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const filterOptions = await adminAppointmentsClient.getFilterOptions();
      
      updateState({
        filterOptions
      });
      
    } catch (error: any) {
      console.error('[useAdminAppointments] Failed to fetch filter options:', error);
      // This is not critical, so we don't show error to user
    }
  }, [updateState]);

  const createAppointment = useCallback(async (data: CreateAppointmentRequest): Promise<boolean> => {
    try {
      updateState({ creating: true, error: null });

      await adminAppointmentsClient.createAppointment(data);
      
      updateState({ creating: false });
      toast.success('Appointment created successfully');
      
      // Refresh the appointments list
      if (lastParams !== undefined) {
        await fetchAppointments(lastParams);
      }
      
      return true;
      
    } catch (error: any) {
      console.error('[useAdminAppointments] Failed to create appointment:', error);
      const errorMessage = error.message || 'Failed to create appointment';
      updateState({ 
        error: errorMessage, 
        creating: false 
      });
      toast.error(errorMessage);
      return false;
    }
  }, [updateState, lastParams, fetchAppointments]);

  const updateAppointmentStatus = useCallback(async (id: string | number, status: string): Promise<boolean> => {
    try {
      updateState({ updating: true, error: null });

      await adminAppointmentsClient.updateAppointmentStatus(id, status);
      
      // Update the appointment in the list
      setState(prev => ({
        ...prev,
        appointments: prev.appointments.map(appointment =>
          appointment.appointment_id === Number(id)
            ? { ...appointment, status: status as any }
            : appointment
        ),
        selectedAppointment: prev.selectedAppointment?.appointment_id === Number(id)
          ? { ...prev.selectedAppointment, status: status as any }
          : prev.selectedAppointment,
        updating: false
      }));
      
      toast.success('Appointment status updated successfully');
      return true;
      
    } catch (error: any) {
      console.error('[useAdminAppointments] Failed to update appointment status:', error);
      const errorMessage = error.message || 'Failed to update appointment status';
      updateState({ 
        error: errorMessage, 
        updating: false 
      });
      toast.error(errorMessage);
      return false;
    }
  }, [updateState]);

  const setSelectedAppointment = useCallback((appointment: Appointment | null) => {
    updateState({ selectedAppointment: appointment });
  }, [updateState]);

  const refreshData = useCallback(async () => {
    if (lastParams !== undefined) {
      await fetchAppointments(lastParams);
    }
  }, [fetchAppointments, lastParams]);

  // Initial data loading
  useEffect(() => {
    if (initialParams !== undefined) {
      fetchAppointments(initialParams);
    }
    fetchDepartmentsAndDoctors();
    fetchColorAssignments();
    fetchFilterOptions();
  }, []); // Only run on mount

  return {
    ...state,
    fetchAppointments,
    fetchCalendarAppointments,
    fetchAppointmentById,
    fetchDepartmentsAndDoctors,
    fetchColorAssignments,
    fetchFilterOptions,
    createAppointment,
    updateAppointmentStatus,
    setSelectedAppointment,
    clearError,
    refreshData
  };
};

export default useAdminAppointments; 