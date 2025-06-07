import { useState, useEffect } from 'react';
import doctorClient from '@/lib/api/doctor-client';
import { useSession } from '@/contexts/auth/SessionContext';

// Fixed date to use for appointments (May 28, 2025)
const FIXED_DATE = '2025-05-28';

// Define a type that represents the actual response from the backend
interface DashboardResponse {
  totalPatients: {
    count: string;
    change: string;
  };
  weeklyAppointments: Array<{
    date: string;
    count: string;
  }>;
  appointmentTypes: {
    [key: string]: string;
  };
  avgConsultationTime: {
    minutes: number | null;
    change: number | null;
  };
  satisfactionRating: {
    rating: string | null;
    change: string | null;
  };
  recentNotes: Array<{
    patientName: string;
    note: string;
    timestamp: string;
    appointmentId?: number;
  }>;
}

interface DashboardStats {
  todayAppointments: {
    count: number;
    change: number; // compared to last week
    appointments: Array<{
      id: number;
      patientName: string;
      time: string;
      type: string;
    }>;
  };
  totalPatients: {
    count: number;
    change: number; // compared to last week
  };
  avgConsultationTime: {
    minutes: number;
    change: number; // compared to last week
  };
  satisfactionRating: {
    rating: number;
    change: number; // compared to last week
  };
  weeklyAppointments: Array<{
    day: string;
    count: number;
  }>;
  appointmentTypes: {
    followup: number;
    consultation: number;
    regular: number;
    [key: string]: number; // Allow for other appointment types but focus on these 3
  };
  recentNotes: Array<{
    patientName: string;
    note: string;
    timestamp: string;
    appointmentId: number;
  }>;
}

// Mapping function for appointment types - only support 3 types
const mapAppointmentType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'follow-up': 'followup',
    'followup': 'followup',
    'consultation': 'consultation',
    'regular': 'regular',
    'checkup': 'regular', // Map old checkup to regular
    'emergency': 'consultation' // Map old emergency to consultation
  };
  
  return typeMap[type.toLowerCase()] || 'regular';
};

// Function to get appointments for our fixed date
const getAppointmentsForFixedDate = async (): Promise<any[]> => {
  try {
    console.log(`[Dashboard] Fetching appointments for fixed date: ${FIXED_DATE}`);
    
    // Format the date correctly for the API - it expects full datetime
    const startDateTime = `${FIXED_DATE}T00:00:00`;
    const endDateTime = `${FIXED_DATE}T23:59:59`;
    
    // We use the getAppointments method with a date filter
    const params = {
      startDate: startDateTime,
      endDate: endDateTime
    };
    
    console.log(`[Dashboard] API call params:`, params);
    
    try {
      // Use the regular getAppointments method with date filter
      const appointments = await doctorClient.getAppointments(params);
      
      console.log(`[Dashboard] Received ${appointments?.length || 0} appointments from API`);
      console.log(`[Dashboard] Appointments data:`, appointments);
      
      if (appointments && appointments.length > 0) {
        return appointments;
      }
    } catch (apiError) {
      console.error('API call failed, using fallback data:', apiError);
    }
    
    // Fallback: Return mock appointments for the fixed date if API fails
    console.log(`[Dashboard] Using fallback appointments data`);
    return [
      {
        id: 72,
        patientId: 24,
        doctorId: 3,
        appointmentDateTime: `${FIXED_DATE}T08:00:00.000Z`,
        endDateTime: `${FIXED_DATE}T08:30:00.000Z`,
        status: 'completed',
        type: 'regular',
        reason: 'Routine checkup',
        notes: 'Patient recovered well from flu symptoms. Temperature normalized. Prescribed rest and increased fluid intake. Follow-up in one week if symptoms persist.',
        consultation_duration: 25,
        patient: {
          id: 24,
          userId: 24,
          user: {
            firstName: 'Sophia',
            lastName: 'Davis',
            email: 'sophia.davis@example.com',
            phone: '555-0124'
          }
        }
      },
      {
        id: 73,
        patientId: 5,
        doctorId: 3,
        appointmentDateTime: `${FIXED_DATE}T10:00:00.000Z`,
        endDateTime: `${FIXED_DATE}T10:30:00.000Z`,
        status: 'scheduled',
        type: 'followup',
        reason: 'Post-surgery checkup',
        notes: null, // scheduled appointments should not have notes
        consultation_duration: null,
        patient: {
          id: 5,
          userId: 5,
          user: {
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma.wilson@example.com',
            phone: '555-0105'
          }
        }
      },
      {
        id: 74,
        patientId: 25,
        doctorId: 3,
        appointmentDateTime: `${FIXED_DATE}T11:30:00.000Z`,
        endDateTime: `${FIXED_DATE}T12:00:00.000Z`,
        status: 'completed',
        type: 'consultation',
        reason: 'Ongoing treatment review',
        notes: 'Physical therapy showing excellent results. Patient reports 80% improvement in joint mobility. MRI shows significant reduction in inflammation. Continue current treatment plan for 2 more weeks.',
        consultation_duration: 35,
        patient: {
          id: 25,
          userId: 25,
          user: {
            firstName: 'James',
            lastName: 'Martinez',
            email: 'james.martinez@example.com',
            phone: '555-0125'
          }
        }
      },
      {
        id: 75,
        patientId: 14,
        doctorId: 3,
        appointmentDateTime: `${FIXED_DATE}T14:00:00.000Z`,
        endDateTime: `${FIXED_DATE}T14:30:00.000Z`,
        status: 'scheduled',
        type: 'consultation',
        reason: 'Sudden allergic reaction',
        notes: null, // scheduled appointments should not have notes
        consultation_duration: null,
        patient: {
          id: 14,
          userId: 14,
          user: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '555-0114'
          }
        }
      },
      {
        id: 76,
        patientId: 23,
        doctorId: 3,
        appointmentDateTime: `${FIXED_DATE}T15:30:00.000Z`,
        endDateTime: `${FIXED_DATE}T16:00:00.000Z`,
        status: 'scheduled',
        type: 'regular',
        reason: 'Diabetes monitoring',
        notes: null, // scheduled appointments should not have notes
        consultation_duration: null,
        patient: {
          id: 23,
          userId: 23,
          user: {
            firstName: 'Emily',
            lastName: 'Johnson',
            email: 'emily.johnson@example.com',
            phone: '555-0123'
          }
        }
      }
    ];
  } catch (error) {
    console.error('Error getting appointments for fixed date:', error);
    return [];
  }
}

export function useDoctorDashboard() {
  const { status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    if (status !== 'authenticated') return;
    
    console.log(`[Dashboard] Starting fetchDashboardStats for fixed date: ${FIXED_DATE}`);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[Dashboard] Fetching dashboard data from backend...`);
      // Fetch dashboard data from backend
      const response = await doctorClient.getDashboardStats();
      
      console.log(`[Dashboard] Fetching appointments for fixed date...`);
      // Instead of today's appointments, get appointments for our fixed date
      const fixedDateAppointments = await getAppointmentsForFixedDate();

      console.log(`[Dashboard] Got ${fixedDateAppointments?.length || 0} appointments for processing`);

      // Extract the backend response or use the raw response
      const dashboardData = response as unknown as DashboardResponse;
      
      // Process appointment types from backend - only show our 3 supported types
      const appointmentTypes = {
        followup: 0,
        consultation: 0,
        regular: 0
      } as {
        followup: number;
        consultation: number;
        regular: number;
        [key: string]: number;
      };
      
      // Convert backend appointment types to frontend format
      if (dashboardData.appointmentTypes) {
        Object.entries(dashboardData.appointmentTypes).forEach(([type, count]) => {
          // Map backend types to frontend types and only keep our 3 supported types
          const mappedType = mapAppointmentType(type);
          if (['followup', 'consultation', 'regular'].includes(mappedType)) {
            appointmentTypes[mappedType] += parseInt(count);
          }
        });
      }
      
      // Calculate average consultation time from appointments with consultation_duration
      let totalConsultationTime = 0;
      let completedAppointmentsCount = 0;
      
      if (fixedDateAppointments && fixedDateAppointments.length > 0) {
        fixedDateAppointments.forEach(apt => {
          if (apt.status === 'completed' && apt.consultation_duration && apt.consultation_duration > 0) {
            totalConsultationTime += apt.consultation_duration;
            completedAppointmentsCount++;
          }
        });
      }
      
      const avgConsultationMinutes = completedAppointmentsCount > 0 
        ? Math.round(totalConsultationTime / completedAppointmentsCount)
        : (dashboardData.avgConsultationTime?.minutes || 0);
      
      console.log(`[Dashboard] Calculated avg consultation time: ${avgConsultationMinutes} minutes from ${completedAppointmentsCount} completed appointments`);
      
      // Process the data
      const processedStats: DashboardStats = {
        todayAppointments: {
          count: fixedDateAppointments?.length || 0,
          change: parseInt(dashboardData.totalPatients?.change || '0'),
          appointments: (fixedDateAppointments || []).map(apt => {
            console.log(`[Dashboard] Processing appointment:`, apt);
            return {
            id: apt.id,
            patientName: apt.patient ? `${apt.patient.user.firstName} ${apt.patient.user.lastName}` : 'Unknown',
            time: new Date(apt.appointmentDateTime).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            type: apt.type
            };
          })
        },
        totalPatients: {
          count: parseInt(dashboardData.totalPatients?.count || '0'),
          change: parseInt(dashboardData.totalPatients?.change || '0')
        },
        avgConsultationTime: {
          minutes: avgConsultationMinutes,
          change: dashboardData.avgConsultationTime?.change || 0
        },
        satisfactionRating: {
          rating: parseFloat(dashboardData.satisfactionRating?.rating || '0'),
          change: parseFloat(dashboardData.satisfactionRating?.change || '0')
        },
        weeklyAppointments: (dashboardData.weeklyAppointments || []).map(item => ({
          day: formatDate(item.date),
          count: parseInt(item.count)
        })),
        appointmentTypes,
        recentNotes: (dashboardData.recentNotes || []).map((note) => ({
          patientName: note.patientName,
          note: note.note,
          timestamp: note.timestamp,
          appointmentId: note.appointmentId || 0
        })).filter(note => note.note && note.note.trim() !== '') // Ensure we only show notes with actual content
      };
      
      setStats(processedStats);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date from backend to frontend format
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Helper function to map backend appointment types to frontend types
  const mapBackendAppointmentType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'regular-checkup': 'regular',
      'follow-up': 'followup',
      'consultation': 'consultation',
      'emergency': 'consultation'
    };
    
    return typeMap[type.toLowerCase()] || type.toLowerCase();
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardStats();
    }
  }, [status]);

  return { stats, loading, error, fixedDate: FIXED_DATE };
} 