import { useState, useEffect, useCallback } from 'react';
import { doctorMedicalRecordsClient, DoctorMedicalRecord, DoctorMedicalRecordsStats, GetDoctorMedicalRecordsParams } from '@/lib/api/doctor-medical-records-client';
import { toast } from '@/components/ui/use-toast';

interface UseDoctorMedicalRecordsState {
  medicalRecords: DoctorMedicalRecord[];
  stats: DoctorMedicalRecordsStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useDoctorMedicalRecords = (initialParams?: GetDoctorMedicalRecordsParams) => {
  const [state, setState] = useState<UseDoctorMedicalRecordsState>({
    medicalRecords: [],
    stats: null,
    loading: false,
    statsLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  });

  const [params, setParams] = useState<GetDoctorMedicalRecordsParams>(initialParams || {
    page: 1,
    limit: 20
  });

  // Fetch medical records
  const fetchMedicalRecords = useCallback(async (newParams?: GetDoctorMedicalRecordsParams) => {
    const queryParams = newParams || params;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await doctorMedicalRecordsClient.getMedicalRecords(queryParams);
      
      setState(prev => ({
        ...prev,
        medicalRecords: response.data,
        pagination: response.pagination,
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch medical records';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        medicalRecords: []
      }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [params]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    setState(prev => ({ ...prev, statsLoading: true }));
    
    try {
      const stats = await doctorMedicalRecordsClient.getStats();
      
      setState(prev => ({
        ...prev,
        stats,
        statsLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch statistics';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        statsLoading: false
      }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, []);

  // Search medical records
  const searchMedicalRecords = useCallback(async (searchQuery: string) => {
    const newParams = { ...params, search: searchQuery, page: 1 };
    setParams(newParams);
    await fetchMedicalRecords(newParams);
  }, [params, fetchMedicalRecords]);

  // Filter by patient
  const filterByPatient = useCallback(async (patientId: string | number | null) => {
    const newParams = { ...params, patientId: patientId || undefined, page: 1 };
    setParams(newParams);
    await fetchMedicalRecords(newParams);
  }, [params, fetchMedicalRecords]);

  // Filter by date range
  const filterByDateRange = useCallback(async (dateFrom?: string, dateTo?: string) => {
    const newParams = { ...params, dateFrom, dateTo, page: 1 };
    setParams(newParams);
    await fetchMedicalRecords(newParams);
  }, [params, fetchMedicalRecords]);

  // Change page
  const changePage = useCallback(async (page: number) => {
    const newParams = { ...params, page };
    setParams(newParams);
    await fetchMedicalRecords(newParams);
  }, [params, fetchMedicalRecords]);

  // Change page limit
  const changeLimit = useCallback(async (limit: number) => {
    const newParams = { ...params, limit, page: 1 };
    setParams(newParams);
    await fetchMedicalRecords(newParams);
  }, [params, fetchMedicalRecords]);

  // Refresh data
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchMedicalRecords(),
      fetchStats()
    ]);
  }, [fetchMedicalRecords, fetchStats]);

  // Initial load
  useEffect(() => {
    fetchMedicalRecords();
    fetchStats();
  }, []);

  return {
    // Data
    medicalRecords: state.medicalRecords,
    stats: state.stats,
    pagination: state.pagination,
    
    // Loading states
    loading: state.loading,
    statsLoading: state.statsLoading,
    error: state.error,
    
    // Actions
    searchMedicalRecords,
    filterByPatient,
    filterByDateRange,
    changePage,
    changeLimit,
    refresh,
    
    // Current params
    currentParams: params
  };
}; 