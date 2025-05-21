import { useState, useEffect } from 'react';
import patientClient, { Doctor } from '@/lib/api/patient-client';
import { useSession } from '@/contexts/auth/SessionContext';

export interface DoctorResult {
  doctor: Doctor | null;
  loading: boolean;
  error: string | null;
  availableDates: string[];
  availableTimes: string[];
  refreshDoctor: () => Promise<void>;
}

export function useDoctor(doctorId: number | null): DoctorResult {
  const { status } = useSession();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const fetchAvailability = async (id: number) => {
    try {
      // Get current date for availability search
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      // Try to get available slots from API
      try {
        console.log(`Fetching available slots for doctor ${id} on ${formattedDate}`);
        const slotsResponse = await patientClient.getDoctorAvailableSlots(id, formattedDate);
        
        if (slotsResponse && slotsResponse.availableSlots && slotsResponse.availableSlots.length > 0) {
          // Extract unique dates from slots
          const dates = [...new Set(
            slotsResponse.availableSlots.map(slot => 
              new Date(slot.startTime).toISOString().split('T')[0]
            )
          )];
          setAvailableDates(dates);
          
          // Extract times for the first date
          const timesForFirstDate = slotsResponse.availableSlots
            .filter(slot => new Date(slot.startTime).toISOString().split('T')[0] === dates[0])
            .map(slot => {
              const date = new Date(slot.startTime);
              return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            });
          
          setAvailableTimes(timesForFirstDate);
          return;
        }
      } catch (slotError) {
        console.error('Error fetching availability slots:', slotError);
        // Continue with fallback
      }
      
      // Fallback: generate the next 5 days
      const dates = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      setAvailableDates(dates);
      
      // Standard time slots
      const times = [
        '9:00 AM', '10:00 AM', '11:00 AM',
        '2:00 PM', '3:00 PM', '4:00 PM'
      ];
      setAvailableTimes(times);
    } catch (error) {
      console.error('Error in availability handling:', error);
      // Set fallback values
      const today = new Date();
      const dates = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      setAvailableDates(dates);
      
      const times = [
        '9:00 AM', '10:00 AM', '11:00 AM',
        '2:00 PM', '3:00 PM', '4:00 PM'
      ];
      setAvailableTimes(times);
    }
  };

  const fetchDoctor = async () => {
    if (!doctorId) {
      setDoctor(null);
      setLoading(false);
      setError('No doctor ID provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use Promise.race with a timeout to ensure we don't wait too long
      const fetchWithTimeout = async () => {
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 8000)
        );
        
        const dataPromise = patientClient.getDoctorById(doctorId);
        return Promise.race([dataPromise, timeoutPromise]);
      };

      console.log(`Fetching doctor with ID: ${doctorId}`);
      const doctorData = await fetchWithTimeout();
      
      if (!doctorData || !doctorData.id) {
        setError('Could not find doctor information');
        setDoctor(null);
        setLoading(false);
        return;
      }
      
      console.log(`Doctor data retrieved: ${doctorData.id}`);
      setDoctor(doctorData);
      
      // Fetch availability for this doctor
      await fetchAvailability(doctorData.id);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setError('Failed to load doctor information. Please try again.');
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts and user is authenticated
  useEffect(() => {
    if (status === 'authenticated' && doctorId) {
      fetchDoctor();
    } else if (status === 'authenticated' && !doctorId) {
      setError('Please select a doctor to book an appointment');
      setLoading(false);
    }
  }, [status, doctorId]);

  // Function to manually refresh doctor data
  const refreshDoctor = async () => {
    await fetchDoctor();
  };

  return {
    doctor,
    loading,
    error,
    availableDates,
    availableTimes,
    refreshDoctor
  };
} 