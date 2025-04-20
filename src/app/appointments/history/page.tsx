'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Rating } from '@/components/ui/Rating';
import { Doctor, Appointment } from '@/lib/mockData';
import { dataService } from '@/lib/dataService';

export default function AppointmentHistory() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'reports'>('all');

  // Get appointments from data service
  const appointments = dataService.getAppointments();
  
  // Filter appointments based on selected date and filter
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const isSameDay = appointmentDate.toDateString() === selectedDate.toDateString();
    
    if (filter === 'all') return isSameDay;
    if (filter === 'upcoming') return isSameDay && appointment.status === 'upcoming';
    if (filter === 'completed') return isSameDay && appointment.status === 'completed';
    if (filter === 'reports') return isSameDay && appointment.status === 'completed' && appointment.hasReport;
    
    return isSameDay;
  });

  // Get doctor details for selected appointment
  const selectedDoctor = selectedAppointment 
    ? dataService.getDoctors().find(d => d.id === selectedAppointment.doctorId)
    : null;

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Appointment History</h2>
        
        {/* Filters */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`w-full text-left px-3 py-2 rounded-lg ${
              filter === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            All Appointments
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`w-full text-left px-3 py-2 rounded-lg ${
              filter === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`w-full text-left px-3 py-2 rounded-lg ${
              filter === 'completed' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('reports')}
            className={`w-full text-left px-3 py-2 rounded-lg ${
              filter === 'reports' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            With Reports
          </button>
        </div>

        {/* Calendar */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Select Date</h3>
          {/* Calendar component will go here */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Appointments for {selectedDate.toLocaleDateString()}</h1>
          
          {/* Appointment List */}
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => setSelectedAppointment(appointment)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedAppointment?.id === appointment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                      <Image
                        src={dataService.getDoctors().find(d => d.id === appointment.doctorId)?.image || ''}
                        alt="Doctor"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleTimeString()} - {appointment.status}
                      </p>
                    </div>
                  </div>
                  {appointment.hasReport && (
                    <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full">
                      Report Available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Appointment Details */}
      {selectedAppointment && selectedDoctor && (
        <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
              <Image
                src={selectedDoctor.image}
                alt={selectedDoctor.name}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Dr. {selectedDoctor.name}</h2>
              <p className="text-blue-600">{selectedDoctor.specialty}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Appointment Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Appointment Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(selectedAppointment.date).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Time:</span>{' '}
                  {new Date(selectedAppointment.date).toLocaleTimeString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`capitalize ${
                    selectedAppointment.status === 'completed' ? 'text-green-600' :
                    selectedAppointment.status === 'upcoming' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {selectedAppointment.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Medical Report */}
            {selectedAppointment.hasReport && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Medical Report</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Diagnosis</h4>
                      <p className="text-sm text-gray-600">
                        {selectedAppointment.report?.diagnosis || 'No diagnosis recorded'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Prescription</h4>
                      <p className="text-sm text-gray-600">
                        {selectedAppointment.report?.prescription || 'No prescription recorded'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">
                        {selectedAppointment.report?.notes || 'No additional notes'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Download Report
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Share
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 