import { useState } from 'react';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  nextAppointment: string;
  phone: string;
  address: string;
  email: string;
  lastVisit: string;
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    medications: string[];
    bloodType: string;
  };
  notes: { id: number; text: string }[];
  appointments: any[];
}

export function useDoctorPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all patients
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/doctor-patients');
      const data = await res.json();
      setPatients(data);
    } catch (err: any) {
      setError('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for a single patient
  const selectPatient = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/doctor-patients/${patientId}`);
      const data = await res.json();
      setSelectedPatient(data);
    } catch (err: any) {
      setError('Failed to fetch patient details');
    } finally {
      setLoading(false);
    }
  };

  // Add a note
  const addNote = async (patientId: string, text: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/doctor-patients/${patientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      await selectPatient(patientId); // Refresh patient details
    } catch (err: any) {
      setError('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  // Schedule appointment
  const scheduleAppointment = async (patientId: string, appointment: { date: string; time: string; type: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/doctor-patients/${patientId}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });
      if (!res.ok) throw new Error('Failed to schedule appointment');
      await selectPatient(patientId); // Refresh patient details
    } catch (err: any) {
      setError('Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

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