'use client';

import React, { useState } from 'react';
import { Search, Calendar, Filter, ChevronDown, Info, Eye } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

// Define interface for appointment data
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  time: string;
  type: 'Check-up' | 'Follow-up' | 'Consultation' | 'Emergency';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  notes?: string;
}

// Sample appointment data
const initialAppointments: Appointment[] = [
  {
    id: 'A1001',
    patientId: 'P1001',
    patientName: 'John Wong',
    date: new Date(2023, 7, 10), // Aug 10, 2023
    time: '09:00 AM',
    type: 'Check-up',
    status: 'Scheduled'
  },
  {
    id: 'A1002',
    patientId: 'P1002',
    patientName: 'Mary Chen',
    date: new Date(2023, 7, 10), // Aug 10, 2023
    time: '10:30 AM',
    type: 'Follow-up',
    status: 'Scheduled'
  },
  {
    id: 'A1003',
    patientId: 'P1003',
    patientName: 'David Lee',
    date: new Date(2023, 7, 10), // Aug 10, 2023
    time: '01:15 PM',
    type: 'Consultation',
    status: 'Scheduled'
  },
  {
    id: 'A1004',
    patientId: 'P1004',
    patientName: 'Sarah Tan',
    date: new Date(2023, 7, 11), // Aug 11, 2023
    time: '11:00 AM',
    type: 'Check-up',
    status: 'Scheduled'
  },
  {
    id: 'A1005',
    patientId: 'P1005',
    patientName: 'James Lim',
    date: new Date(2023, 7, 9), // Aug 9, 2023
    time: '02:45 PM',
    type: 'Emergency',
    status: 'Completed'
  },
  {
    id: 'A1006',
    patientId: 'P1006',
    patientName: 'Linda Ng',
    date: new Date(2023, 7, 9), // Aug 9, 2023
    time: '04:30 PM',
    type: 'Follow-up',
    status: 'Completed'
  },
  {
    id: 'A1007',
    patientId: 'P1007',
    patientName: 'Robert Teo',
    date: new Date(2023, 7, 9), // Aug 9, 2023
    time: '10:15 AM',
    type: 'Check-up',
    status: 'No-show'
  },
  {
    id: 'A1008',
    patientId: 'P1008',
    patientName: 'Jenny Wong',
    date: new Date(2023, 7, 8), // Aug 8, 2023
    time: '03:00 PM',
    type: 'Consultation',
    status: 'Cancelled'
  }
];

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2023, 3, 25)); // April 25, 2023
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [typeFilter, setTypeFilter] = useState<string>('All Types');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Filter appointments based on search, date, status, and type
  const filteredAppointments = appointments.filter(appointment => {
    // Search filter
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Date filter - we'll just show all for the demo, but in reality would filter by selectedDate
    // const matchesDate = selectedDate ? appointment.date.toDateString() === selectedDate.toDateString() : true;
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'All Statuses' || 
      appointment.status === statusFilter;
    
    // Type filter
    const matchesType = 
      typeFilter === 'All Types' || 
      appointment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle appointment selection
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'No-show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Field */}
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search patient or ID"
              className="pl-10 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Date Picker */}
          <div className="w-full md:w-1/4">
            <DatePicker
              date={selectedDate}
              setDate={setSelectedDate}
              placeholder="Select date"
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-1/5">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="No-show">No-show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-1/5">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Check-up">Check-up</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Appointments Table */}
        <div className="md:col-span-3 bg-white rounded-lg shadow overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 grid grid-cols-4 gap-4 font-medium text-sm text-gray-500 border-b">
            <div>PATIENT</div>
            <div>DATE & TIME</div>
            <div>TYPE</div>
            <div>STATUS</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="px-6 py-4 grid grid-cols-4 gap-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <div>
                    <p className="font-medium">{appointment.patientName}</p>
                    <p className="text-sm text-gray-500">{appointment.patientId}</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-medium">
                      {appointment.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric', 
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">{appointment.time}</p>
                  </div>
                  <div className="flex items-center">
                    <span>{appointment.type}</span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-gray-500">
                No appointments found matching your criteria
              </div>
            )}
          </div>
        </div>

        {/* Appointment Details Panel */}
        <div className="md:col-span-1">
          {selectedAppointment ? (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Appointment Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Patient</h3>
                  <p className="text-sm font-medium">
                    {selectedAppointment.patientName}
                  </p>
                  <p className="text-xs text-gray-500">{selectedAppointment.patientId}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Date & Time</h3>
                  <p className="text-sm">
                    {selectedAppointment.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}, {selectedAppointment.time}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Type</h3>
                  <p className="text-sm">{selectedAppointment.type}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Notes</h3>
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.notes || 'No notes available.'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full py-2 text-sm bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">
                  Update Status
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center h-48 flex flex-col items-center justify-center">
              <p className="text-gray-500 text-sm">
                Select an appointment to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 