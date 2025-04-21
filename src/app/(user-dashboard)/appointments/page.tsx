'use client';

import React, { useState } from 'react';
import Calendar from '@/components/ui/Calendar';
import { Appointment, Doctor } from '@/lib/mockData';
import { dataService } from '@/lib/dataService';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/20/solid';
import { Rating } from '@/components/ui/Rating';

export default function AppointmentHistory() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'with-reports'>('all');

  // Get all appointments
  const appointments = dataService.getUpcomingAppointments();

  // Filter appointments based on selected status
  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'upcoming') return appointment.status === 'upcoming';
    if (filterStatus === 'completed') return appointment.status === 'completed';
    if (filterStatus === 'with-reports') return appointment.status === 'completed' && appointment.report;
    return true;
  });

  // Get appointments for selected date
  const selectedDateAppointments = filteredAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="flex h-full">
      {/* Left sidebar - Calendar */}
      <div className="w-80 p-4 border-r">
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          appointments={appointments}
        />
        
        {/* Filter buttons */}
        <div className="mt-6 space-y-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              filterStatus === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            All Appointments
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              filterStatus === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              filterStatus === 'completed' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus('with-reports')}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              filterStatus === 'with-reports' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            With Reports
          </button>
        </div>
      </div>

      {/* Main content - Appointment list */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6">
          Appointments for {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h1>

        <div className="space-y-4">
          {selectedDateAppointments.map(appointment => (
            <button
              key={appointment.id}
              onClick={() => setSelectedAppointment(appointment)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedAppointment?.id === appointment.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{appointment.doctorName}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-700'
                    : appointment.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </button>
          ))}

          {selectedDateAppointments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No appointments found for this date.
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar - Appointment details */}
      <div className="w-96 border-l p-6">
        {selectedAppointment ? (
          <div>
            <h2 className="text-xl font-semibold mb-6">Appointment Details</h2>
            
            {/* Doctor info */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={dataService.getDoctorById(selectedAppointment.doctorId)?.image || '/images/placeholder-doctor.jpg'}
                  alt={selectedAppointment.doctorName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">{selectedAppointment.doctorName}</h3>
              <p className="text-gray-600 mb-2">{dataService.getDoctorById(selectedAppointment.doctorId)?.specialty}</p>
              <div className="flex items-center gap-1">
                <Rating value={dataService.getDoctorById(selectedAppointment.doctorId)?.rating || 0} />
                <span className="text-sm text-gray-600">
                  {dataService.getDoctorById(selectedAppointment.doctorId)?.rating}
                </span>
              </div>
            </div>

            {/* Appointment info */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Appointment Time</h4>
                <p className="font-medium">
                  {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600">{selectedAppointment.time}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAppointment.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-700'
                    : selectedAppointment.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </span>
              </div>

              {selectedAppointment.report && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Diagnosis</h4>
                    <p className="text-gray-900">{selectedAppointment.report.diagnosis}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Prescription</h4>
                    <p className="text-gray-900">{selectedAppointment.report.prescription}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                    <p className="text-gray-600">{selectedAppointment.report.notes}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Select an appointment to view details
          </div>
        )}
      </div>
    </div>
  );
} 