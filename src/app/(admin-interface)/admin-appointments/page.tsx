'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { DataTable, SearchFilterBar, FormField, ModalDialog, StatusBadge } from '@/components/admin';
import { useAdminAppointments } from '@/hooks/admin/useAdminAppointments';
import { 
  Appointment, 
  CreateAppointmentRequest,
  Department,
  Doctor,
  Patient 
} from '@/lib/api/admin-appointments-client';
import { 
  validateDate, 
  validateTime, 
  validateRequired,
  validateLength,
  sanitizeText,
  validateSearchQuery
} from '@/utils/validation';

// Define interfaces for local state
interface NewAppointmentFormData {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  notes: string;
}

interface FilterState {
    department: string;
  status: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

export default function AppointmentManagement() {
  // Initialize the hook
  const {
    appointments,
    departments,
    doctors,
    patients,
    selectedAppointment,
    loading,
    creating,
    updating,
    pagination,
    fetchAppointments,
    fetchAppointmentById,
    createAppointment,
    updateAppointmentStatus,
    setSelectedAppointment,
    refreshData,
    fetchDepartmentsAndDoctors
  } = useAdminAppointments({
    page: 1,
    limit: 10,
    sortBy: 'appointment_datetime',
    sortOrder: 'ASC'
  });

  // Local state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState<FilterState>({
    department: 'all',
    status: 'scheduled',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  const [newAppointmentData, setNewAppointmentData] = useState<NewAppointmentFormData>({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    type: 'consultation',
    notes: ''
  });

  // Form validation state
  const [appointmentErrors, setAppointmentErrors] = useState<{
    patient_id?: string;
    doctor_id?: string;
    appointment_date?: string;
    appointment_time?: string;
    notes?: string;
  }>({});

  // Fetch appointments when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      ...(filters.search && { search: filters.search }),
      ...(filters.department !== 'all' && { department_id: filters.department }),
      ...(filters.status !== 'all' && { status: filters.status }),
      ...(filters.dateFrom && { date_from: filters.dateFrom }),
      ...(filters.dateTo && { date_to: filters.dateTo }),
      sortBy: 'appointment_datetime',
      sortOrder: 'ASC' as const
    };
    
    fetchAppointments(params);
  }, [currentPage, filters, fetchAppointments]);

  // Fetch departments and doctors data when component mounts
  useEffect(() => {
    fetchDepartmentsAndDoctors();
  }, [fetchDepartmentsAndDoctors]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Clear specific error when user starts typing
  const clearAppointmentError = (fieldName: string) => {
    if (appointmentErrors[fieldName as keyof typeof appointmentErrors]) {
      setAppointmentErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  // Handle closing the modal and reset form
  const handleCloseNewAppointmentModal = () => {
    setShowNewAppointmentModal(false);
    setNewAppointmentData({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      type: 'consultation',
      notes: ''
    });
    setAppointmentErrors({});
  };

  // Validate appointment form
  const validateAppointmentForm = (): boolean => {
    const errors: typeof appointmentErrors = {};
    let isValid = true;

    // Validate required fields
    if (!newAppointmentData.patient_id || newAppointmentData.patient_id.trim() === '') {
      errors.patient_id = 'Please select a patient';
      isValid = false;
    }

    if (!newAppointmentData.doctor_id || newAppointmentData.doctor_id.trim() === '') {
      errors.doctor_id = 'Please select a doctor';
      isValid = false;
    }

    if (!newAppointmentData.appointment_date || newAppointmentData.appointment_date.trim() === '') {
      errors.appointment_date = 'Please select an appointment date';
      isValid = false;
    } else {
      // Validate appointment date - should not be in the past
      const selectedDate = new Date(newAppointmentData.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.appointment_date = 'Appointment date cannot be in the past';
        isValid = false;
      }
    }

    if (!newAppointmentData.appointment_time || newAppointmentData.appointment_time.trim() === '') {
      errors.appointment_time = 'Please select an appointment time';
      isValid = false;
    } else {
      // Validate appointment time format
      const timeValidation = validateTime(newAppointmentData.appointment_time, 'Appointment time');
      if (!timeValidation.isValid) {
        errors.appointment_time = timeValidation.error;
        isValid = false;
      }
    }

    // Validate notes (optional but if provided, check length)
    if (newAppointmentData.notes && newAppointmentData.notes.trim().length > 0) {
      const notesValidation = validateLength(newAppointmentData.notes.trim(), 0, 1000, 'Notes');
      if (!notesValidation.isValid) {
        errors.notes = notesValidation.error;
        isValid = false;
      }
    }

    setAppointmentErrors(errors);
    return isValid;
  };

  // Enhanced search validation
  const handleSearchChange = (query: string) => {
    const searchValidation = validateSearchQuery(query);
    if (searchValidation.isValid) {
      handleFilterChange('search', query);
    }
  };

  // Handle new appointment form changes with validation
  const handleNewAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = typeof value === 'string' ? sanitizeText(value) : value;
    
    setNewAppointmentData(prev => ({ ...prev, [name]: sanitizedValue }));
    clearAppointmentError(name);
  };

  // Handle appointment creation with validation
  const handleCreateAppointment = async () => {
    console.log('Starting appointment creation...');
    console.log('Form data:', newAppointmentData);
    
    if (!validateAppointmentForm()) {
      console.log('Form validation failed');
      console.log('Validation errors:', appointmentErrors);
      return;
    }

    try {
      // Combine date and time into proper datetime format
      const appointmentDateTime = `${newAppointmentData.appointment_date}T${newAppointmentData.appointment_time}:00`;
      console.log('Appointment datetime:', appointmentDateTime);
      
      const appointmentData: CreateAppointmentRequest = {
        patient_id: parseInt(newAppointmentData.patient_id),
        doctor_id: parseInt(newAppointmentData.doctor_id),
        appointment_date: newAppointmentData.appointment_date,
        appointment_time: newAppointmentData.appointment_time,
        type: newAppointmentData.type || 'consultation',
        notes: newAppointmentData.notes ? sanitizeText(newAppointmentData.notes) : undefined
      };

      console.log('Final appointment data for API:', appointmentData);

      const success = await createAppointment(appointmentData);
      
      console.log('API call result:', success);
      
      if (success) {
        console.log('Appointment created successfully');
        handleCloseNewAppointmentModal();
        
        // Refresh the appointments list
        const params = {
          page: currentPage,
          limit: 10,
          ...(filters.search && { search: filters.search }),
          ...(filters.department !== 'all' && { department_id: filters.department }),
          ...(filters.status !== 'all' && { status: filters.status }),
          ...(filters.dateFrom && { date_from: filters.dateFrom }),
          ...(filters.dateTo && { date_to: filters.dateTo }),
          sortBy: 'appointment_datetime',
          sortOrder: 'ASC' as const
        };
        
        fetchAppointments(params);
        
        // Show success message
        alert('Appointment created successfully!');
      } else {
        console.error('API returned false - appointment creation failed');
        alert('Failed to create appointment. Please check all fields and try again.');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to create appointment. ';
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check all fields and try again.';
      }
      
      alert(errorMessage);
    }
  };

  // Handle appointment detail view
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  // Handle status change
  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    await updateAppointmentStatus(appointmentId, newStatus);
  };

  // Get status badge style
  const getStatusBadge = (status: string): string => {
    const statusStyles: Record<string, string> = {
      scheduled: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
    };

    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  // Table columns definition
  const tableColumns = [
    {
      header: 'Patient',
      accessor: (appointment: Appointment) => (
        <div>
          <div className="font-medium text-gray-900">{appointment.patient_name}</div>
          <div className="text-sm text-gray-500">{appointment.patient_email}</div>
        </div>
      )
    },
    {
      header: 'Doctor',
      accessor: (appointment: Appointment) => (
        <div>
          <div className="font-medium text-gray-900">{appointment.doctor_name}</div>
          <div className="text-sm text-gray-500">{appointment.doctor_specialty}</div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department_name' as keyof Appointment
    },
    {
      header: 'Date & Time',
      accessor: (appointment: Appointment) => {
        const date = new Date(appointment.appointment_datetime);
        return (
          <div>
            <div className="font-medium text-gray-900">
              {format(date, 'MMM dd, yyyy')}
            </div>
            <div className="text-sm text-gray-500">
              {format(date, 'hh:mm a')}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: (appointment: Appointment) => (
        <span className={getStatusBadge(appointment.status)}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      )
    },
    {
      header: 'Type',
      accessor: 'type' as keyof Appointment
    }
  ];

  // Table actions
  const tableActions = [
    {
      label: 'View',
      onClick: (appointment: Appointment) => handleViewAppointment(appointment),
      className: 'text-blue-600 hover:text-blue-900'
    }
  ];

  // Pagination component
  const PaginationComponent = () => {
    if (pagination.pages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
            disabled={currentPage === pagination.pages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {(currentPage - 1) * pagination.limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pagination.limit, pagination.total)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all appointments</p>
            </div>
            <div className="flex space-x-3">
          <button
                onClick={() => setShowNewAppointmentModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by patient name, doctor, or appointment ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                id="department"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id.toString()}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                department: 'all',
                status: 'scheduled',
                search: '',
                dateFrom: '',
                dateTo: ''
              })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          <DataTable
            data={appointments}
            columns={tableColumns}
            keyField="appointment_id"
            actions={tableActions}
            isLoading={loading}
            emptyMessage="No appointments found"
          />
          <PaginationComponent />
        </div>

        {/* Appointment Detail Modal */}
        <ModalDialog
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Appointment Details"
          size="lg"
        >
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedAppointment.patient_name}</span>
              </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedAppointment.patient_email}</span>
              </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Phone:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedAppointment.patient_phone}</span>
              </div>
              </div>
              </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Doctor Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedAppointment.doctor_name}</span>
                </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Specialty:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedAppointment.doctor_specialty}</span>
                          </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Department:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedAppointment.department_name}</span>
                          </div>
                            </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date & Time:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {format(new Date(selectedAppointment.appointment_datetime), 'PPpp')}
                    </span>
            </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAppointment.type}</span>
                </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`ml-2 ${getStatusBadge(selectedAppointment.status)}`}>
                      {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                            </span>
                          </div>
                          </div>
                
                {selectedAppointment.notes && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-500">Notes:</span>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.notes}</p>
                            </div>
                          )}
              </div>
              
              {/* Status Update */}
              <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button
                  onClick={() => handleStatusChange(selectedAppointment.appointment_id, 'scheduled')}
                  disabled={updating || selectedAppointment.status === 'scheduled'}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 disabled:opacity-50"
              >
                  Reschedule
              </button>
              <button
                  onClick={() => handleStatusChange(selectedAppointment.appointment_id, 'completed')}
                  disabled={updating || selectedAppointment.status === 'completed'}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50"
              >
                  Complete
              </button>
                 <button
                  onClick={() => handleStatusChange(selectedAppointment.appointment_id, 'cancelled')}
                  disabled={updating || selectedAppointment.status === 'cancelled'}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50"
                 >
                  Cancel
                </button>
                 <button
                  onClick={() => handleStatusChange(selectedAppointment.appointment_id, 'no_show')}
                  disabled={updating || selectedAppointment.status === 'no_show'}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 disabled:opacity-50"
                 >
                  No Show
                </button>
          </div>
        </div>
      )}
        </ModalDialog>

        {/* New Appointment Modal */}
        <ModalDialog
          isOpen={showNewAppointmentModal}
          onClose={handleCloseNewAppointmentModal}
          title="Create New Appointment"
          size="lg"
        >
            <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  name="patient_id"
                  value={newAppointmentData.patient_id}
                  onChange={handleNewAppointmentChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    appointmentErrors.patient_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.patient_id} value={patient.patient_id.toString()}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {appointmentErrors.patient_id && (
                  <p className="mt-1 text-sm text-red-600">{appointmentErrors.patient_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  name="doctor_id"
                  value={newAppointmentData.doctor_id}
                  onChange={handleNewAppointmentChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    appointmentErrors.doctor_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.doctor_id} value={doctor.doctor_id.toString()}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
                {appointmentErrors.doctor_id && (
                  <p className="mt-1 text-sm text-red-600">{appointmentErrors.doctor_id}</p>
                )}
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                 <input
                   type="date"
                  name="appointment_date"
                  value={newAppointmentData.appointment_date}
                   onChange={handleNewAppointmentChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    appointmentErrors.appointment_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                   required
                   min={new Date().toISOString().split('T')[0]}
                 />
                 {appointmentErrors.appointment_date && (
                   <p className="mt-1 text-sm text-red-600">{appointmentErrors.appointment_date}</p>
                 )}
               </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                 <input
                   type="time"
                  name="appointment_time"
                  value={newAppointmentData.appointment_time}
                   onChange={handleNewAppointmentChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    appointmentErrors.appointment_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                   required
                 />
                 {appointmentErrors.appointment_time && (
                   <p className="mt-1 text-sm text-red-600">{appointmentErrors.appointment_time}</p>
                 )}
               </div>

               <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={newAppointmentData.type}
                  onChange={handleNewAppointmentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine">Routine</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                 <textarea
                   name="notes"
                   value={newAppointmentData.notes}
                   onChange={handleNewAppointmentChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  appointmentErrors.notes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Any additional notes..."
                 />
                 {appointmentErrors.notes && (
                   <p className="mt-1 text-sm text-red-600">{appointmentErrors.notes}</p>
                 )}
               </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseNewAppointmentModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAppointment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Appointment'}
              </button>
            </div>
          </div>
        </ModalDialog>
        </div>
    </div>
  );
}

