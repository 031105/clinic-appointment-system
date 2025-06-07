import { useState, useEffect, useRef } from 'react';
import doctorClient, { Patient, DoctorPatientDetails } from '@/lib/api/doctor-client';
import { useSession } from '@/contexts/auth/SessionContext';

export interface PatientWithFullInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dateOfBirth?: string;
  phone: string;
  address: string;
  nextAppointment?: string;
  lastVisit?: string;
  allergies?: Array<{
    id: number;
    name: string;
    severity: string;
  }>;
  appointments?: Array<{
    id: number;
    appointmentDateTime: string;
    endDateTime: string;
    status: string;
    type: string;
  }>;
  medicalRecords?: Array<{
    id: number;
    recordType: string;
    description: string;
    createdAt: string;
  }>;
}

export function useDoctorPatients() {
  const { status } = useSession();
  const [patients, setPatients] = useState<PatientWithFullInfo[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithFullInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 使用 useRef 跟踪请求状态，防止重复请求
  const dataFetchedRef = useRef(false);

  // Fetch all patients
  const fetchPatients = async () => {
    if (status !== 'authenticated') return;
    if (loading) return; // 避免同时发起多个请求
    
    setLoading(true);
    setError(null);
    try {
      const data = await doctorClient.getDoctorPatients();
      
      // 将后端数据转换为前端所需格式
      const formattedPatients = data.map(patient => ({
        id: patient.id.toString(),
        firstName: patient.first_name || '',
        lastName: patient.last_name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        gender: patient.gender || '',
        dateOfBirth: patient.date_of_birth || '',
        address: patient.address || '',
      }));
      
      setPatients(formattedPatients);
    } catch (err: any) {
      console.error('Failed to fetch patients:', err);
      setError('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for a single patient
  const selectPatient = async (patientId: string) => {
    if (loading) return;
    if (selectedPatient && selectedPatient.id === patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await doctorClient.getDoctorPatientDetails(patientId);
      
      setSelectedPatient({
        id: data.id.toString(),
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        gender: data.gender || '',
        dateOfBirth: data.date_of_birth || '',
        phone: data.phone || '',
        address: data.address || '',
        allergies: data.allergies,
        appointments: data.appointments?.map(appt => ({
          id: appt.id,
          appointmentDateTime: appt.appointment_datetime,
          endDateTime: appt.end_datetime,
          status: appt.status,
          type: appt.type
        })),
        medicalRecords: data.medicalRecords?.map(record => ({
          id: record.id,
          recordType: record.record_type,
          description: record.description,
          createdAt: record.created_at
        })),
      });
    } catch (err: any) {
      console.error('Failed to fetch patient details:', err);
      setError('Failed to fetch patient details');
    } finally {
      setLoading(false);
    }
  };

  // Add a note
  const addNote = async (patientId: string, text: string) => {
    if (loading) return; // 避免同时发起多个请求
    
    setLoading(true);
    setError(null);
    try {
      await doctorClient.addPatientNote(patientId, text);
      await selectPatient(patientId); // Refresh patient details
    } catch (err: any) {
      console.error('Failed to add note:', err);
      setError('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  // Schedule appointment
  const scheduleAppointment = async (patientId: string, appointment: { date: string; time: string; type: string }) => {
    if (loading) return; // 避免同时发起多个请求
    
    setLoading(true);
    setError(null);
    try {
      await doctorClient.schedulePatientAppointment(patientId, appointment);
      await selectPatient(patientId); // Refresh patient details
    } catch (err: any) {
      console.error('Failed to schedule appointment:', err);
      setError('Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && !dataFetchedRef.current) {
      dataFetchedRef.current = true; // 标记数据已请求，避免重复请求
      fetchPatients();
    }
  }, [status]);

  return {
    patients,
    selectedPatient,
    fetchPatients,
    selectPatient,
    addNote,
    scheduleAppointment,
    loading,
    error,
  };
} 