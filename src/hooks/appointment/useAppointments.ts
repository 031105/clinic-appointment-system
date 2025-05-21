import { useState, useEffect } from 'react';
import patientClient, { Appointment } from '@/lib/api/patient-client';
import { useSession } from '@/contexts/auth/SessionContext';

// Extended Appointment type with UI-specific properties
export interface ExtendedAppointment extends Omit<Appointment, 'doctor'> {
  doctorName?: string;
  specialty?: string;
  date?: string;
  time?: string;
  medical_record?: any | null;
  doctor?: {
    id: number;
    userId: number;
    departmentId?: number;
    consultationFee?: number;
    department?: {
      id: number;
      name: string;
    };
    user?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      profile_image_blob?: string;
    };
    profileImage?: string;
  };
}

type AppointmentFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';

type AppointmentsResult = {
  appointments: ExtendedAppointment[];
  filteredAppointments: ExtendedAppointment[];
  loading: boolean;
  error: string | null;
  filter: AppointmentFilter;
  setFilter: (filter: AppointmentFilter) => void;
  refreshAppointments: () => Promise<void>;
};

export function useAppointments(): AppointmentsResult {
  const { status } = useSession();
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppointmentFilter>('all');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch appointments using patientClient
      console.log('Fetching appointments...');
      const appointmentsData = await patientClient.getAppointments();
      console.log('Appointments loaded:', appointmentsData.length);
      
      // Process appointments to extract date and time and format doctor information
      const processedAppointments = appointmentsData.map(appointment => {
        // Extract date and time from appointmentDateTime
        let date = '';
        let time = '';
        
        if (appointment.appointmentDateTime) {
          const dateObj = new Date(appointment.appointmentDateTime);
          date = dateObj.toLocaleDateString();
          time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // Format doctor data safely
        const doctor = appointment.doctor ? {
          ...appointment.doctor,
          profileImage: (appointment.doctor.user as any).profile_image_blob
        } : undefined;
        
        return {
          ...appointment,
          doctor,
          doctorName: appointment.doctor ? 
            `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}` : 
            `Doctor #${appointment.doctorId}`,
          specialty: appointment.doctor?.department?.name || 'Medical Specialist',
          date,
          time
        };
      });
      
      setAppointments(processedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts and user is authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchAppointments();
    }
  }, [status]);

  // Filter appointments based on the current filter value
  const filteredAppointments = appointments.filter(appointment => {
    // 将状态转换为小写以便比较
    const status = appointment.status.toLowerCase();
    
    if (filter === 'all') return true;
    
    if (filter === 'upcoming') {
      // upcoming包括所有非completed, cancelled和no_show的预约
      return !['completed', 'cancelled', 'no_show'].includes(status);
    }
    
    if (filter === 'completed') return status === 'completed';
    if (filter === 'cancelled') return status === 'cancelled';
    
    return true;
  });

  // Function to manually refresh appointments
  const refreshAppointments = async () => {
    await fetchAppointments();
  };

  return {
    appointments,
    filteredAppointments,
    loading,
    error,
    filter,
    setFilter,
    refreshAppointments
  };
} 