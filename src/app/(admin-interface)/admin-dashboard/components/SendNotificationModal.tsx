'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SendNotificationRequest } from '@/lib/api/admin-dashboard-client';
import { adminAppointmentsClient } from '@/lib/api/admin-appointments-client';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: SendNotificationRequest) => Promise<boolean>;
  isLoading: boolean;
}

interface Patient {
  patient_id: number;
  name: string;
  email: string;
}

interface Doctor {
  doctor_id: number;
  name: string;
  specialty: string;
}

export default function SendNotificationModal({
  isOpen,
  onClose,
  onSend,
  isLoading
}: SendNotificationModalProps) {
  const [formData, setFormData] = useState<SendNotificationRequest>({
    title: '',
    message: '',
    type: 'system',
    target_users: 'all'
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      return;
    }

    // Prepare the notification data with specific user selections if applicable
    let notificationData = { ...formData };
    
    if (formData.target_users === 'specific_patients' && selectedPatients.length > 0) {
      notificationData = {
        ...formData,
        target_users: 'specific',
        specific_user_ids: selectedPatients
      } as any;
    } else if (formData.target_users === 'specific_doctors' && selectedDoctors.length > 0) {
      notificationData = {
        ...formData,
        target_users: 'specific',
        specific_user_ids: selectedDoctors
      } as any;
    }

    const success = await onSend(notificationData);
    if (success) {
      setFormData({
        title: '',
        message: '',
        type: 'system',
        target_users: 'all'
      });
      setSelectedPatients([]);
      setSelectedDoctors([]);
      onClose();
    }
  };

  const handleInputChange = (field: keyof SendNotificationRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset selections when target changes
    if (field === 'target_users') {
      setSelectedPatients([]);
      setSelectedDoctors([]);
    }
  };

  const handlePatientSelection = (patientId: number) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleDoctorSelection = (doctorId: number) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId) 
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  if (!isOpen) return null;

  const showPatientSelection = formData.target_users === 'specific_patients';
  const showDoctorSelection = formData.target_users === 'specific_doctors';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Send Notification</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter notification title"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter notification message"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="system">System</option>
              <option value="reminder">Reminder</option>
              <option value="message">Message</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Users
            </label>
            <select
              value={formData.target_users}
              onChange={(e) => handleInputChange('target_users', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="all">All Users</option>
              <option value="patients">All Patients</option>
              <option value="doctors">All Doctors</option>
              <option value="specific_patients">Specific Patients</option>
              <option value="specific_doctors">Specific Doctors</option>
            </select>
          </div>

          {/* Patient Selection */}
          {showPatientSelection && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patients ({selectedPatients.length} selected)
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {loading ? (
                  <div className="text-center py-4">Loading patients...</div>
                ) : patients.length > 0 ? (
                  patients.map((patient) => (
                    <label key={patient.patient_id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(patient.patient_id)}
                        onChange={() => handlePatientSelection(patient.patient_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        {patient.name} ({patient.email})
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No patients found</div>
                )}
              </div>
            </div>
          )}

          {/* Doctor Selection */}
          {showDoctorSelection && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctors ({selectedDoctors.length} selected)
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {loading ? (
                  <div className="text-center py-4">Loading doctors...</div>
                ) : doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <label key={doctor.doctor_id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDoctors.includes(doctor.doctor_id)}
                        onChange={() => handleDoctorSelection(doctor.doctor_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        {doctor.name} - {doctor.specialty}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No doctors found</div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isLoading || 
                !formData.title.trim() || 
                !formData.message.trim() ||
                (showPatientSelection && selectedPatients.length === 0) ||
                (showDoctorSelection && selectedDoctors.length === 0)
              }
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 