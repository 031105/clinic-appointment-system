'use client';

import React, { useState } from 'react';

// Temporary appointment data
const tempAppointments = [
  { 
    id: 1, 
    patientName: 'John Smith', 
    patientId: '21',
    doctorName: 'Dr. Adam Hall', 
    doctorId: '1',
    department: 'Dentistry',
    date: '2025-06-16', 
    time: '09:30',
    status: 'confirmed',
    notes: 'Regular checkup for heart condition'
  },
  { 
    id: 2, 
    patientName: 'Jessica Tan', 
    patientId: '22',
    doctorName: 'Dr. Adam Hall', 
    doctorId: '1',
    department: 'Dentistry',
    date: '2025-06-18', 
    time: '10:15',
    status: 'confirmed',
    notes: 'Follow-up appointment after medication change'
  },
  { 
    id: 3, 
    patientName: 'David Wong', 
    patientId: '23',
    doctorName: 'Dr. Robert Chen', 
    doctorId: '2',
    department: 'Cardiology',
    date: '2025-06-17', 
    time: '10:30',
    status: 'pending',
    notes: 'Initial consultation for chest pain'
  },
  { 
    id: 4, 
    patientName: 'Emily Lim', 
    patientId: '24',
    doctorName: 'Dr. James Wilson', 
    doctorId: '3',
    department: 'Cardiology',
    date: '2025-06-19', 
    time: '15:00',
    status: 'confirmed',
    notes: 'Regular cardiology checkup'
  },
  { 
    id: 5, 
    patientName: 'Jason Ng', 
    patientId: '25',
    doctorName: 'Dr. Kimberly Novak', 
    doctorId: '4',
    department: 'Cardiology',
    date: '2025-06-20', 
    time: '09:30',
    status: 'confirmed',
    notes: 'Heart monitoring appointment'
  },
];

// Department filter options
const departments = [
  { id: 'all', name: 'All Departments' },
  { id: '1', name: 'Cardiology' },
  { id: '2', name: 'Pediatrics' },
  { id: '3', name: 'Dermatology' },
  { id: '7', name: 'Dentistry' },
];

// Status filter options
const statusOptions = [
  { id: 'all', name: 'All Statuses' },
  { id: 'confirmed', name: 'Confirmed' },
  { id: 'pending', name: 'Pending' },
  { id: 'cancelled', name: 'Cancelled' },
  { id: 'completed', name: 'Completed' },
];

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState(tempAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter appointments based on selected filters and search query
  const filteredAppointments = appointments.filter(appointment => {
    // Department filter
    if (filterDepartment !== 'all' && appointment.departmentId !== filterDepartment) {
      return false;
    }
    
    // Status filter
    if (filterStatus !== 'all' && appointment.status !== filterStatus) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        appointment.patientName.toLowerCase().includes(query) ||
        appointment.doctorName.toLowerCase().includes(query) ||
        appointment.date.includes(query)
      );
    }
    
    return true;
  });

  // Handle appointment status change
  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: newStatus } 
        : appointment
    ));
    
    // If the appointment is currently selected, update the selected appointment too
    if (selectedAppointment?.id === appointmentId) {
      setSelectedAppointment({...selectedAppointment, status: newStatus});
    }
  };

  // Handle appointment detail view
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const statusStyles = {
      confirmed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
    };
    
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Appointment Management</h1>
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1.5 rounded-md transition-colors ${currentView === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setCurrentView('list')}
          >
            List View
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md transition-colors ${currentView === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setCurrentView('calendar')}
          >
            Calendar
          </button>
          <button 
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors ml-2"
          >
            New Appointment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search patients or doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List View */}
      {currentView === 'list' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                      <div className="text-sm text-gray-500">ID: {appointment.patientId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.doctorName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.department}</div>
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
                      <span className={getStatusBadge(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleViewAppointment(appointment)}
                      >
                        View
                      </button>
                      <div className="relative inline-block text-left">
                        <div>
                          <button 
                            className="text-gray-500 hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              const menu = e.currentTarget.nextElementSibling;
                              if (menu) {
                                menu.classList.toggle('hidden');
                              }
                            }}
                          >
                            More ▼
                          </button>
                        </div>
                        <div className="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {appointment.status !== 'completed' && (
                              <button 
                                className="block w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-gray-100"
                                onClick={() => handleStatusChange(appointment.id, 'completed')}
                              >
                                Mark as Completed
                              </button>
                            )}
                            {appointment.status !== 'cancelled' && (
                              <button 
                                className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-100"
                                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                              >
                                Cancel Appointment
                              </button>
                            )}
                            <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                              Edit Appointment
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAppointments.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No appointments found matching your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Calendar View Placeholder */}
      {currentView === 'calendar' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Appointment Calendar</h2>
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Calendar view implementation will show appointments in a daily/weekly/monthly format.</p>
            <p className="text-gray-500 mt-2">Each appointment would be color-coded by status and department.</p>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Appointment Details
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Patient</p>
                        <p className="text-base font-medium">{selectedAppointment.patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Doctor</p>
                        <p className="text-base font-medium">{selectedAppointment.doctorName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="text-base font-medium">{selectedAppointment.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="text-base font-medium">
                          {new Date(selectedAppointment.date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} at {selectedAppointment.time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={getStatusBadge(selectedAppointment.status)}>
                          {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-base">{selectedAppointment.notes || 'No notes provided.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                {selectedAppointment.status !== 'completed' && (
                  <button
                    type="button"
                    className="mt-3 sm:mt-0 sm:mr-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                    onClick={() => {
                      handleStatusChange(selectedAppointment.id, 'completed');
                      setShowDetailModal(false);
                    }}
                  >
                    Mark as Completed
                  </button>
                )}
                {selectedAppointment.status !== 'cancelled' && (
                  <button
                    type="button"
                    className="mt-3 sm:mt-0 sm:mr-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                    onClick={() => {
                      handleStatusChange(selectedAppointment.id, 'cancelled');
                      setShowDetailModal(false);
                    }}
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}