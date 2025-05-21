import { useState, useEffect } from 'react';
import patientClient, { MedicalRecord, MedicalRecordAttachment } from '@/lib/api/patient-client';
import { useSession } from '@/contexts/auth/SessionContext';

export function useMedicalRecords(appointmentId?: number) {
  const { status } = useSession();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [specificRecord, setSpecificRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all medical records for the patient
  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching all medical records...');
      const recordsData = await patientClient.getMedicalRecords();
      
      // Check if records array is empty due to an API error
      if (recordsData.length === 0) {
        console.log('No medical records found or API error occurred');
        // We still set the empty array but also set an error if appropriate
        setMedicalRecords([]);
        setError('Could not retrieve medical records. The server might be unavailable.');
      } else {
        console.log('Medical records loaded:', recordsData.length);
        setMedicalRecords(recordsData);
        setError(null);
      }
      
      // If appointmentId is provided, try to find a specific record
      if (appointmentId) {
        const specificRecordData = recordsData.find(record => record.appointmentId === appointmentId);
        setSpecificRecord(specificRecordData || null);
        
        // If not found in general records, try to fetch directly
        if (!specificRecordData) {
          try {
            console.log(`Fetching specific medical record for appointment: ${appointmentId}`);
            const record = await patientClient.getAppointmentMedicalRecord(appointmentId);
            if (record) {
              setSpecificRecord(record);
            }
          } catch (specificError) {
            console.error(`No medical record found for appointment: ${appointmentId}`, specificError);
          }
        }
      }
    } catch (error) {
      console.error('Error in useMedicalRecords hook:', error);
      setError('Failed to load medical records. Please try again.');
      setMedicalRecords([]);
      setSpecificRecord(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts and user is authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchMedicalRecords();
    }
  }, [status, appointmentId]);

  // Function to manually refresh medical records
  const refreshMedicalRecords = async () => {
    await fetchMedicalRecords();
  };

  return {
    medicalRecords,
    specificRecord,
    loading,
    error,
    refreshMedicalRecords
  };
}

// Hook to fetch attachments for a medical record
export function useMedicalRecordAttachments(recordId?: number) {
  const [attachments, setAttachments] = useState<MedicalRecordAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordId) return;
    setLoading(true);
    setError(null);
    patientClient.getMedicalRecordAttachments(recordId)
      .then(setAttachments)
      .catch((err) => {
        setError('Failed to load attachments');
        setAttachments([]);
      })
      .finally(() => setLoading(false));
  }, [recordId]);

  return { attachments, loading, error };
} 