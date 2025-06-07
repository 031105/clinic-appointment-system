'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useDoctorAppointments, AppointmentStatus, DoctorAppointmentFilter } from '@/hooks/appointment/useDoctorAppointments';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    'no-show': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || ''}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function MyAppointments() {
  const searchParams = useSearchParams();
  const appointmentIdParam = searchParams.get('appointmentId');
  const appointmentId = appointmentIdParam ? parseInt(appointmentIdParam, 10) : null;

  const {
    appointments,
    loading,
    error,
    filter,
    setFilter,
    markAsCompleted,
    markAsNoShow,
    updateNotes,
  } = useDoctorAppointments();
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [notesInput, setNotesInput] = useState('');

  // Filter appointments based on date and status only
  const filteredAppointments = appointments.filter(appointment => {
    // Date filter
    const matchesDate = !filter.startDate || appointment.appointmentDateTime?.slice(0, 10) === filter.startDate;
    // Status filter - only apply if not 'all'
    const matchesStatus = !filter.status || filter.status === 'all' || appointment.status === filter.status;
    return matchesDate && matchesStatus;
  });

  // Auto-select appointment from URL parameter
  useEffect(() => {
    if (!loading && appointmentId && appointments.length > 0) {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
        setNotesInput(appointment.notes || '');
      }
    }
  }, [loading, appointments, appointmentId]);

  // Handle appointment selection for details view
  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setNotesInput(appointment.notes || '');
  };

  // Handle status update
  const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
    if (newStatus === 'completed') {
      await markAsCompleted(appointmentId, notesInput);
    } else if (newStatus === 'no-show') {
      await markAsNoShow(appointmentId, notesInput);
    }
    setSelectedAppointment(null);
  };

  // Handle notes update
  const handleNotesUpdate = async (appointmentId: number) => {
    await updateNotes(appointmentId, notesInput);
    setSelectedAppointment(null);
  };

  // UI rendering
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Date Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              placeholder="dd/mm/yyyy"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filter.startDate || ''}
              onChange={e => setFilter({ ...filter, startDate: e.target.value })}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filter.status || 'all'}
              onChange={e => setFilter({ ...filter, status: e.target.value as AppointmentStatus })}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr 
                      key={appointment.id} 
                      onClick={() => handleAppointmentClick(appointment)}
                      className={`cursor-pointer hover:bg-gray-50 ${selectedAppointment?.id === appointment.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.patient?.user?.firstName || ''} {appointment.patient?.user?.lastName || ''}</div>
                        <div className="text-sm text-gray-500">{appointment.patientId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={appointment.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="lg:col-span-1">
          {selectedAppointment ? (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Appointment Details</h2>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Patient</p>
                <p className="text-base font-medium">{selectedAppointment.patient?.user?.firstName} {selectedAppointment.patient?.user?.lastName}</p>
                <p className="text-sm text-gray-500">{selectedAppointment.patientId}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                <p className="text-base">
                  {selectedAppointment.appointmentDateTime ? new Date(selectedAppointment.appointmentDateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                  {' '}
                  {selectedAppointment.appointmentDateTime ? new Date(selectedAppointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-base">{selectedAppointment.type}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <StatusBadge status={selectedAppointment.status} />
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                    onClick={() => handleNotesUpdate(selectedAppointment.id)}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {selectedAppointment.status === 'scheduled' && (
                  <>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                    >
                      Mark as Completed
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'no-show')}
                    >
                      Mark as No-Show
                    </button>
                  </>
                )}
                <button
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm text-gray-500 text-center">
              Select an appointment to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 