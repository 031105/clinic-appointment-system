'use client';

import React from 'react';
import { FormField } from '@/components/admin';

interface NewAppointmentFormProps {
  formData: {
    patientName: string;
    patientId: string;
    doctorName: string;
    doctorId: string;
    department: string;
    date: string;
    time: string;
    notes: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const NewAppointmentForm: React.FC<NewAppointmentFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="space-y-4">
      <FormField
        id="patientName"
        label="Patient Name"
        type="text"
        value={formData.patientName}
        onChange={onChange}
        placeholder="Enter patient name"
        required
      />
      <FormField
        id="patientId"
        label="Patient ID"
        type="text"
        value={formData.patientId}
        onChange={onChange}
        placeholder="Enter patient ID"
        required
      />
      <FormField
        id="doctorName"
        label="Doctor Name"
        type="text"
        value={formData.doctorName}
        onChange={onChange}
        placeholder="Enter doctor name"
        required
      />
      <FormField
        id="doctorId"
        label="Doctor ID"
        type="text"
        value={formData.doctorId}
        onChange={onChange}
        placeholder="Enter doctor ID"
        required
      />
      <FormField
        id="department"
        label="Department"
        type="text"
        value={formData.department}
        onChange={onChange}
        placeholder="Enter department"
        required
      />
      <FormField
        id="date"
        label="Date"
        type="date"
        value={formData.date}
        onChange={onChange}
        required
      />
      <FormField
        id="time"
        label="Time"
        type="time"
        value={formData.time}
        onChange={onChange}
        required
      />
      <FormField
        id="notes"
        label="Notes"
        type="textarea"
        value={formData.notes}
        onChange={onChange}
        placeholder="Enter appointment notes"
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Appointment
        </button>
      </div>
    </div>
  );
};

export default NewAppointmentForm; 