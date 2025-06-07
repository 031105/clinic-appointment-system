'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CreateAppointmentRequest } from '@/lib/api/admin-appointments-client';
import { adminAppointmentsClient } from '@/lib/api/admin-appointments-client';
import { toast } from 'react-hot-toast';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface NewAppointmentFormData {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  notes: string;
}

interface Patient {
  patient_id: number;
  name: string;
}

interface Doctor {
  doctor_id: number;
  name: string;
  specialty: string;
}

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  onSuccess
}: CreateAppointmentModalProps) {
  const [formData, setFormData] = useState<NewAppointmentFormData>({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    type: 'consultation',
    notes: ''
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load patients and doctors when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPatientsAndDoctors();
    }
  }, [isOpen]);

  const loadPatientsAndDoctors = async () => {
    setLoading(true);
    try {
      const data = await adminAppointmentsClient.getDepartmentsAndDoctors();
      setPatients(data.patients);
      setDoctors(data.doctors);
    } catch (error) {
      console.error('Failed to load patients and doctors:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const appointmentData: CreateAppointmentRequest = {
        patient_id: parseInt(formData.patient_id),
        doctor_id: parseInt(formData.doctor_id),
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        type: formData.type,
        notes: formData.notes || undefined
      };

      await adminAppointmentsClient.createAppointment(appointmentData);
      toast.success('Appointment created successfully');
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      toast.error(error.message || 'Failed to create appointment');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      type: 'consultation',
      notes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Appointment</h2>
          <button
            onClick={handleClose}
            disabled={creating}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient *
                </label>
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={creating}
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.patient_id} value={patient.patient_id.toString()}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor *
                </label>
                <select
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={creating}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.doctor_id} value={doctor.doctor_id.toString()}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={creating}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={creating}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creating}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine">Routine</option>
                  <option value="checkup">Checkup</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes..."
                disabled={creating}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 