import { useState, useEffect, useCallback } from 'react';
import { 
  adminPatientsClient, 
  Patient, 
  MedicalRecord, 
  CreatePatientRequest, 
  GetPatientsParams 
} from '@/lib/api/admin-patients-client';
import { toast } from '@/components/ui/use-toast';

interface UseAdminPatientsState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UsePatientDetailsState {
  patient: Patient | null;
  medicalRecords: MedicalRecord[];
  loading: boolean;
  error: string | null;
  medicalRecordsLoading: boolean;
}

export function useAdminPatients() {
  const [state, setState] = useState<UseAdminPatientsState>({
    patients: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  });

  // Fetch patients with pagination
  const fetchPatients = useCallback(async (params?: GetPatientsParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await adminPatientsClient.getPatientsWithPagination(params);
      
      setState(prev => ({
        ...prev,
        patients: response.data,
        pagination: response.pagination,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch patients',
        loading: false
      }));
      toast({ title: 'Failed to fetch patients', variant: 'destructive' });
    }
  }, []);

  // Search patients
  const searchPatients = useCallback(async (query: string) => {
    if (!query.trim()) {
      return fetchPatients();
    }
    
    return fetchPatients({ search: query });
  }, [fetchPatients]);

  // Filter patients by status
  const filterPatients = useCallback(async (status: 'all' | 'active' | 'inactive') => {
    return fetchPatients({ status });
  }, [fetchPatients]);

  // Create new patient
  const createPatient = useCallback(async (data: CreatePatientRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await adminPatientsClient.createPatient(data);
      
      toast({ 
        title: 'Patient created successfully!', 
        description: `Temporary password: ${response.data.temp_password}` 
      });
      
      // Refresh the patient list
      await fetchPatients();
      
      return response;
    } catch (error: any) {
      console.error('Failed to create patient:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create patient';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast({ 
        title: 'Failed to create patient',
        description: errorMessage,
        variant: 'destructive' 
      });
      throw error;
    }
  }, [fetchPatients]);

  // Update patient status
  const updatePatientStatus = useCallback(async (id: string | number, status: 'active' | 'inactive') => {
    try {
      await adminPatientsClient.updatePatientStatus(id, status);
      
      // Update the patient in the current list
      setState(prev => ({
        ...prev,
        patients: prev.patients.map(patient =>
          patient.id === id.toString() ? { ...patient, status } : patient
        )
      }));
      
      toast({ title: 'Patient status updated successfully' });
    } catch (error: any) {
      console.error('Failed to update patient status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update patient status';
      toast({
        title: 'Failed to update patient status',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    }
  }, []);

  // Load more patients (for pagination)
  const loadMorePatients = useCallback(async () => {
    if (state.pagination.page >= state.pagination.pages) return;
    
    const nextPage = state.pagination.page + 1;
    return fetchPatients({ page: nextPage, limit: state.pagination.limit });
  }, [state.pagination, fetchPatients]);

  // Change page
  const changePage = useCallback(async (page: number) => {
    return fetchPatients({ page, limit: state.pagination.limit });
  }, [state.pagination.limit, fetchPatients]);

  // Change items per page
  const changeLimit = useCallback(async (limit: number) => {
    return fetchPatients({ page: 1, limit });
  }, [fetchPatients]);

  return {
    ...state,
    fetchPatients,
    searchPatients,
    filterPatients,
    createPatient,
    updatePatientStatus,
    loadMorePatients,
    changePage,
    changeLimit,
    refetch: () => fetchPatients()
  };
}

export function usePatientDetails(patientId?: string | number) {
  const [state, setState] = useState<UsePatientDetailsState>({
    patient: null,
    medicalRecords: [],
    loading: false,
    error: null,
    medicalRecordsLoading: false
  });

  // Fetch patient details
  const fetchPatientDetails = useCallback(async (id: string | number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const patient = await adminPatientsClient.getPatientById(id);
      
      setState(prev => ({
        ...prev,
        patient,
        loading: false
      }));
      
      return patient;
    } catch (error) {
      console.error('Failed to fetch patient details:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch patient details',
        loading: false
      }));
      toast({ 
        title: 'Failed to fetch patient details',
        variant: 'destructive' 
      });
      throw error;
    }
  }, []);

  // Fetch patient medical records
  const fetchMedicalRecords = useCallback(async (id: string | number) => {
    setState(prev => ({ ...prev, medicalRecordsLoading: true }));
    
    try {
      const medicalRecords = await adminPatientsClient.getPatientMedicalRecords(id);
      
      setState(prev => ({
        ...prev,
        medicalRecords,
        medicalRecordsLoading: false
      }));
      
      return medicalRecords;
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
      setState(prev => ({
        ...prev,
        medicalRecordsLoading: false
      }));
      toast({ 
        title: 'Failed to fetch medical records',
        variant: 'destructive' 
      });
      throw error;
    }
  }, []);

  // Add medical record
  const addMedicalRecord = useCallback(async (
    id: string | number, 
    data: { doctorId: number; diagnosis: string; prescription?: string; notes?: string; recordDate?: string }
  ) => {
    try {
      const result = await adminPatientsClient.addMedicalRecord(id, data);
      
      // Refresh medical records
      await fetchMedicalRecords(id);
      
      toast({ title: 'Medical record added successfully' });
      return result;
    } catch (error: any) {
      console.error('Failed to add medical record:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add medical record';
      toast({
        title: 'Failed to add medical record',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    }
  }, [fetchMedicalRecords]);

  // Load patient data when patientId changes
  useEffect(() => {
    if (patientId) {
      fetchPatientDetails(patientId);
      fetchMedicalRecords(patientId);
    }
  }, [patientId, fetchPatientDetails, fetchMedicalRecords]);

  return {
    ...state,
    fetchPatientDetails,
    fetchMedicalRecords,
    addMedicalRecord,
    refetch: patientId ? () => {
      fetchPatientDetails(patientId);
      fetchMedicalRecords(patientId);
    } : undefined
  };
} 