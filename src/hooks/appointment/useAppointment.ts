import { useState, useEffect } from 'react';
import patientClient from '@/lib/api/patient-client';
import { useSession } from '@/contexts/auth/SessionContext';
import { ExtendedAppointment } from './useAppointments';

type AppointmentResult = {
  appointment: ExtendedAppointment | null;
  loading: boolean;
  error: string | null;
  refreshAppointment: () => Promise<void>;
};

export function useAppointment(appointmentId: number | null): AppointmentResult {
  const { status } = useSession();
  const [appointment, setAppointment] = useState<ExtendedAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointment = async () => {
    if (!appointmentId) {
      setAppointment(null);
      setLoading(false);
      setError('No appointment ID provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching appointment details for ID: ${appointmentId}`);
      const appointmentData = await patientClient.getAppointmentById(appointmentId);
      
      // Process appointment to extract date and time
      let date = '';
      let time = '';
      
      if (appointmentData.appointmentDateTime) {
        const dateObj = new Date(appointmentData.appointmentDateTime);
        date = dateObj.toLocaleDateString();
        time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Format doctor data safely
      const doctor = appointmentData.doctor ? {
        ...appointmentData.doctor,
        profileImage: (appointmentData.doctor.user as any).profile_image_blob
      } : undefined;
      
      // Create extended appointment with additional UI properties
      const extendedAppointment: ExtendedAppointment = {
        ...appointmentData,
        doctor,
        doctorName: appointmentData.doctor ? 
          `Dr. ${appointmentData.doctor.user.firstName} ${appointmentData.doctor.user.lastName}` : 
          `Doctor #${appointmentData.doctorId}`,
        specialty: appointmentData.doctor?.department?.name || 'Medical Specialist',
        date,
        time
      };
      
      setAppointment(extendedAppointment);
    } catch (error) {
      console.error(`Error fetching appointment ${appointmentId}:`, error);
      setError('Failed to load appointment details. Please try again.');
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts and user is authenticated
  useEffect(() => {
    if (status === 'authenticated' && appointmentId) {
      fetchAppointment();
    }
  }, [status, appointmentId]);

  // Function to manually refresh appointment
  const refreshAppointment = async () => {
    await fetchAppointment();
  };

  return {
    appointment,
    loading,
    error,
    refreshAppointment
  };
} 