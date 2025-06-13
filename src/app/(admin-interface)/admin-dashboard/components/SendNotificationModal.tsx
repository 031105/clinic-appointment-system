'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SendNotificationRequest } from '@/lib/api/admin-dashboard-client';
import { adminAppointmentsClient, Doctor as AdminDoctor, Patient as AdminPatient } from '@/lib/api/admin-appointments-client';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: SendNotificationRequest) => Promise<boolean>;
  isLoading: boolean;
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
    target_users: 'patients',
  });

  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<number[]>([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [loading, setLoading] = useState(false);

  // Load patients and doctors when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPatientsAndDoctors();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        message: '',
        target_users: 'patients',
      });
      setSelectedPatients([]);
      setSelectedDoctors([]);
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset selections when target changes
    if (field === 'target_users') {
      setSelectedPatients([]);
      setSelectedDoctors([]);
    }
  };

  const handlePatientSelection = (patientId: number, checked: boolean) => {
    if (checked) {
      setSelectedPatients(prev => [...prev, patientId]);
    } else {
      setSelectedPatients(prev => prev.filter(id => id !== patientId));
    }
  };

  const handleDoctorSelection = (doctorId: number, checked: boolean) => {
    if (checked) {
      setSelectedDoctors(prev => [...prev, doctorId]);
    } else {
      setSelectedDoctors(prev => prev.filter(id => id !== doctorId));
    }
  };

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchPatient.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalData = { ...formData };
    
    // Handle specific user selections
    if (formData.target_users === 'specific_patients') {
      finalData = {
        ...formData,
        target_users: 'specific',
        specific_user_ids: selectedPatients
      };
    } else if (formData.target_users === 'specific_doctors') {
      finalData = {
        ...formData,
        target_users: 'specific',
        specific_user_ids: selectedDoctors
      };
    } else if (formData.target_users === 'specific') {
      finalData = {
        ...formData,
        specific_user_ids: selectedPatients
      };
    }

    const success = await onSend(finalData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Send Notification</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Users Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
            <select
              value={formData.target_users}
              onChange={e => setFormData(prev => ({ ...prev, target_users: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="patients">All Patients</option>
              <option value="specific">Specific Patients</option>
            </select>
          </div>
          {/* If specific, show patient multi-select */}
          {formData.target_users === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Patients</label>
              <input
                type="text"
                placeholder="Search patients..."
                value={searchPatient}
                onChange={e => setSearchPatient(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
              />
              <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
                {filteredPatients.length === 0 ? (
                  <div className="text-gray-400 text-sm">No patients found</div>
                ) : (
                  filteredPatients.map(p => (
                    <label key={p.patient_id} className="flex items-center space-x-2 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(p.patient_id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedPatients(prev => [...prev, p.patient_id]);
                          else setSelectedPatients(prev => prev.filter(id => id !== p.patient_id));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <span className="text-sm">{p.first_name} {p.last_name} ({p.email})</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
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
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter notification message"
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={isLoading || !formData.title || !formData.message || (formData.target_users === 'specific' && selectedPatients.length === 0)}
            >
              {isLoading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>

        {/* EmailJS Status Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            📧 <strong>Email Notifications:</strong> Users with email notifications enabled will also receive 
            an email copy of this notification. Configure EmailJS in environment variables to enable email sending.
          </p>
        </div>
      </div>
    </div>
  );
} 