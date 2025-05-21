import { useState, useEffect } from 'react';
import doctorClient, { Appointment } from '@/lib/api/doctor-client';
import { useSession } from '@/contexts/auth/SessionContext';

// Filter types
export type AppointmentStatus = 'all' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface DoctorAppointmentFilter {
  status?: AppointmentStatus;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Return type for the hook
export interface DoctorAppointmentsResult {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  filter: DoctorAppointmentFilter;
  setFilter: (filter: DoctorAppointmentFilter) => void;
  refetch: () => Promise<void>;
  markAsCompleted: (id: number, notes?: string) => Promise<void>;
  markAsNoShow: (id: number, notes?: string) => Promise<void>;
  updateNotes: (id: number, notes: string) => Promise<void>;
}

export function useDoctorAppointments(): DoctorAppointmentsResult {
  const { status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<DoctorAppointmentFilter>({ status: 'all' });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const appointmentsData = await doctorClient.getAppointmentsWithFilters(filter);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAppointments();
    }
  }, [status, filter]);

  const markAsCompleted = async (id: number, notes?: string) => {
    try {
      await doctorClient.markAppointmentAsCompleted(id, notes);
      fetchAppointments();
    } catch (err) {
      console.error('Error marking appointment as completed:', err);
      throw new Error('Failed to update appointment status');
    }
  };

  const markAsNoShow = async (id: number, notes?: string) => {
    try {
      await doctorClient.markAppointmentAsNoShow(id, notes);
      fetchAppointments();
    } catch (err) {
      console.error('Error marking appointment as no-show:', err);
      throw new Error('Failed to update appointment status');
    }
  };

  const updateNotes = async (id: number, notes: string) => {
    try {
      await doctorClient.updateAppointmentNotes(id, notes);
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment notes:', err);
      throw new Error('Failed to update appointment notes');
    }
  };

  return {
    appointments,
    loading,
    error,
    filter,
    setFilter,
    refetch: fetchAppointments,
    markAsCompleted,
    markAsNoShow,
    updateNotes
  };
} 