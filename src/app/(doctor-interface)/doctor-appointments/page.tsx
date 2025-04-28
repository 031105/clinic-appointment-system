'use client';

import React, { useState } from 'react';
import { Search, Calendar, Filter } from 'lucide-react';

// Define interface for appointment data
interface Appointment {
  id: number;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

// Sample appointment data
const initialAppointments: Appointment[] = [
  { id: 1, patientName: 'John Wong', patientId: 'P1001', date: '2023-08-10', time: '09:00 AM', type: 'Check-up', status: 'scheduled' },
  { id: 2, patientName: 'Mary Chen', patientId: 'P1002', date: '2023-08-10', time: '10:30 AM', type: 'Follow-up', status: 'scheduled' },
  { id: 3, patientName: 'David Lee', patientId: 'P1003', date: '2023-08-10', time: '01:15 PM', type: 'Consultation', status: 'scheduled' },
  { id: 4, patientName: 'Sarah Tan', patientId: 'P1004', date: '2023-08-11', time: '11:00 AM', type: 'Check-up', status: 'scheduled' },
  { id: 5, patientName: 'James Lim', patientId: 'P1005', date: '2023-08-09', time: '02:45 PM', type: 'Emergency', status: 'completed', notes: 'Patient had severe abdominal pain. Prescribed pain medication and advised rest.' },
  { id: 6, patientName: 'Linda Ng', patientId: 'P1006', date: '2023-08-09', time: '04:30 PM', type: 'Follow-up', status: 'completed', notes: 'Blood pressure improved. Continue with current medication.' },
  { id: 7, patientName: 'Robert Teo', patientId: 'P1007', date: '2023-08-09', time: '10:15 AM', type: 'Check-up', status: 'no-show' },
  { id: 8, patientName: 'Jenny Wong', patientId: 'P1008', date: '2023-08-08', time: '03:00 PM', type: 'Consultation', status: 'cancelled' },
];

// Status badge component
const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
  const statusStyles = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    'no-show': 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<Appointment['status'] | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Extract unique appointment types from data
  const appointmentTypes = ['all', ...Array.from(new Set(appointments.map(a => a.type)))];

  // Filter appointments based on search, date, status, and type
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           appointment.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = selectedDate === '' || appointment.date === selectedDate;
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
    
    return matchesSearch && matchesDate && matchesStatus && matchesType;
  });

  // Handle appointment selection for details view
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  // Handle status update
  const handleStatusUpdate = (appointmentId: number, newStatus: Appointment['status']) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: newStatus } 
        : appointment
    ));
    
    if (selectedAppointment && selectedAppointment.id === appointmentId) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    }
  };

  // Handle notes update
  const handleNotesUpdate = (appointmentId: number, notes: string) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, notes } 
        : appointment
    ));
    
    if (selectedAppointment && selectedAppointment.id === appointmentId) {
      setSelectedAppointment({ ...selectedAppointment, notes });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patient or ID"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Appointment['status'] | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {appointmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
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
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">{appointment.patientId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(appointment.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-sm text-gray-500">{appointment.time}</div>
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
                <p className="text-base font-medium">{selectedAppointment.patientName}</p>
                <p className="text-sm text-gray-500">{selectedAppointment.patientId}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                <p className="text-base">
                  {new Date(selectedAppointment.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-500">{selectedAppointment.time}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-base">{selectedAppointment.type}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedAppointment.status} />
                </div>
              </div>
              
              {/* Status Update Buttons */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAppointment.status !== 'completed' && (
                    <button 
                      className="px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-sm font-medium"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                    >
                      Mark as Completed
                    </button>
                  )}
                  
                  {selectedAppointment.status !== 'cancelled' && (
                    <button 
                      className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm font-medium"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  )}
                  
                  {selectedAppointment.status !== 'no-show' && (
                    <button 
                      className="px-3 py-1.5 bg-red-100 text-red-800 rounded-md text-sm font-medium"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'no-show')}
                    >
                      Mark as No-Show
                    </button>
                  )}
                </div>
              </div>
              
              {/* Notes Section */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  rows={4}
                  value={selectedAppointment.notes || ''}
                  onChange={(e) => handleNotesUpdate(selectedAppointment.id, e.target.value)}
                  placeholder="Add notes about this appointment..."
                />
              </div>
              
              <div className="mt-6 flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  View Patient Profile
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
                  Contact Patient
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-center py-10">
                Select an appointment to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 