'use client';

import React from 'react';

// Define the same interface as used in the appointment page
interface Appointment {
  id: number;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  department: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes: string;
}

interface StatusChangeActionsProps {
  appointment: Appointment;
  onStatusChange: (status: Appointment['status']) => void;
  className?: string;
}

const StatusChangeActions: React.FC<StatusChangeActionsProps> = ({
  appointment,
  onStatusChange,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {appointment.status !== 'completed' && (
        <button
          onClick={() => onStatusChange('completed')}
          className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-md hover:bg-green-200"
        >
          Mark Completed
        </button>
      )}
      
      {['pending', 'confirmed'].includes(appointment.status) && (
        <button
          onClick={() => onStatusChange('cancelled')}
          className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200"
        >
          Cancel
        </button>
      )}
      
      {['pending'].includes(appointment.status) && (
        <button
          onClick={() => onStatusChange('confirmed')}
          className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200"
        >
          Confirm
        </button>
      )}
    </div>
  );
};

export default StatusChangeActions; 