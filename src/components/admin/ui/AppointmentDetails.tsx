'use client';

import React from 'react';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/admin';

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

// Add the StatusType definition to match the component's expectations
type StatusType = 'active' | 'inactive' | 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'success' | 'warning' | 'error' | 'info';

// Map status values to StatusBadge status props
const mapStatusToStatusBadge = (status: Appointment['status']): { status: StatusType; className?: string } => {
  switch (status) {
    case 'pending':
      return { status: 'pending' };
    case 'confirmed':
      return { status: 'confirmed' };
    case 'completed':
      return { status: 'completed' };
    case 'cancelled':
      return { status: 'cancelled' };
    default:
      return { status: 'pending' };
  }
};

interface AppointmentDetailsProps {
  appointment: Appointment;
  showAdditionalActions?: boolean;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ 
  appointment,
  showAdditionalActions = true
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Appointment ID</h3>
          <p className="mt-1 text-sm text-gray-900">{appointment.id}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <div className="mt-1">
            <StatusBadge {...mapStatusToStatusBadge(appointment.status)} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Patient</h3>
          <p className="mt-1 text-sm text-gray-900">{appointment.patientName}</p>
          <p className="text-xs text-gray-500">ID: {appointment.patientId}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
          <p className="mt-1 text-sm text-gray-900">{appointment.doctorName}</p>
          <p className="text-xs text-gray-500">ID: {appointment.doctorId}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Department</h3>
          <p className="mt-1 text-sm text-gray-900">{appointment.department}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
          <p className="mt-1 text-sm text-gray-900">
            {format(new Date(`${appointment.date}T${appointment.time}`), 'PPP')}
          </p>
          <p className="text-xs text-gray-500">
            {format(new Date(`${appointment.date}T${appointment.time}`), 'h:mm a')}
          </p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Notes</h3>
        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
          {appointment.notes || 'No notes available.'}
        </p>
      </div>
      
      {showAdditionalActions && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
              View Patient Record
            </button>
            <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
              View Doctor Schedule
            </button>
            <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
              Send Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails; 