'use client';

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Appointment, Doctor } from '@/lib/mockData';
import { dataService } from '@/lib/dataService';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/20/solid';
import { Rating } from '@/components/ui/Rating';

// Temporary mock data to demonstrate UI design
const tempAppointments: Appointment[] = [
  {
    id: '1',
    doctorId: '1',
    doctorName: 'Dr. John Smith',
    specialty: 'Cardiology',
    date: new Date().toISOString().split('T')[0], // Today
    time: '10:00 AM',
    status: 'upcoming',
    hasReport: false
  },
  {
    id: '2',
    doctorId: '2',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Pediatrics',
    date: new Date().toISOString().split('T')[0], // Today
    time: '2:30 PM',
    status: 'upcoming',
    hasReport: false
  },
  {
    id: '3',
    doctorId: '3',
    doctorName: 'Dr. Michael Brown',
    specialty: 'Dermatology',
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0], // 5 days ago
    time: '11:00 AM',
    status: 'completed',
    hasReport: true,
    report: {
      diagnosis: 'Atopic Dermatitis',
      prescription: 'Topical corticosteroid cream, apply twice daily',
      notes: 'Skin condition showing improvement. Continue current treatment plan for two weeks.',
      date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0]
    }
  },
  {
    id: '4',
    doctorId: '4',
    doctorName: 'Dr. Emily Davis',
    specialty: 'Orthopedics',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], // 3 days from now
    time: '4:00 PM',
    status: 'upcoming',
    hasReport: false
  },
  {
    id: '5',
    doctorId: '1',
    doctorName: 'Dr. John Smith',
    specialty: 'Cardiology',
    date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0], // 10 days ago
    time: '9:00 AM',
    status: 'cancelled',
    hasReport: false
  },
  {
    id: '6',
    doctorId: '5',
    doctorName: 'Dr. Lisa Wong',
    specialty: 'Neurology',
    date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0], // 15 days ago
    time: '11:30 AM',
    status: 'completed',
    hasReport: true,
    report: {
      diagnosis: 'Migraine with aura',
      prescription: 'Sumatriptan 50mg as needed for migraine attacks',
      notes: 'Patient reported visual disturbances before headache onset. Recommended keeping a headache diary.',
      date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0]
    }
  },
  {
    id: '7',
    doctorId: '6',
    doctorName: 'Dr. James Wilson',
    specialty: 'Gastroenterology',
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], // 7 days from now
    time: '3:15 PM',
    status: 'upcoming',
    hasReport: false
  },
  {
    id: '8',
    doctorId: '7',
    doctorName: 'Dr. Robert Chen',
    specialty: 'Endocrinology',
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0], // 2 days ago
    time: '10:45 AM',
    status: 'completed',
    hasReport: true,
    report: {
      diagnosis: 'Type 2 Diabetes',
      prescription: 'Metformin 500mg twice daily',
      notes: 'Blood glucose levels improving. Continue with diet modifications and daily exercise regimen.',
      date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0]
    }
  },
  {
    id: '9',
    doctorId: '8',
    doctorName: 'Dr. David Lee',
    specialty: 'Ophthalmology',
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], // 5 days from now
    time: '9:30 AM',
    status: 'upcoming',
    hasReport: false
  },
  {
    id: '10',
    doctorId: '9',
    doctorName: 'Dr. Jennifer Martinez',
    specialty: 'Psychiatry',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // Tomorrow
    time: '2:00 PM',
    status: 'upcoming',
    hasReport: false
  }
];

// Mock doctor data with images
const tempDoctors: Doctor[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Dr. John Smith',
    specialty: 'Cardiology',
    departmentId: '1',
    experience: 12,
    consultationFee: 150,
    rating: 4.8,
    totalRatings: 124,
    image: '/images/doctors/doctor-1.jpg',
    about: 'Experienced cardiologist specializing in heart disease prevention and treatment.',
    isAvailable: true,
    schedules: []
  },
  {
    id: '2',
    userId: 'user2',
    name: 'Dr. Sarah Johnson',
    specialty: 'Pediatrics',
    departmentId: '2',
    experience: 15,
    consultationFee: 130,
    rating: 4.9,
    totalRatings: 187,
    image: '/images/doctors/doctor-2.jpg',
    about: 'Dedicated pediatrician with 15 years of experience caring for children of all ages.',
    isAvailable: true,
    schedules: []
  },
  {
    id: '3',
    userId: 'user3',
    name: 'Dr. Michael Brown',
    specialty: 'Dermatology',
    departmentId: '3',
    experience: 8,
    consultationFee: 170,
    rating: 4.7,
    totalRatings: 98,
    image: '/images/doctors/doctor-3.jpg',
    about: 'Board-certified dermatologist specializing in skin conditions and cosmetic procedures.',
    isAvailable: true,
    schedules: []
  },
  {
    id: '4',
    userId: 'user4',
    name: 'Dr. Emily Davis',
    specialty: 'Orthopedics',
    departmentId: '4',
    experience: 10,
    consultationFee: 160,
    rating: 4.6,
    totalRatings: 112,
    image: '/images/doctors/doctor-4.jpg',
    about: 'Orthopedic surgeon focused on sports injuries and joint replacements.',
    isAvailable: true,
    schedules: []
  },
  {
    id: '5',
    userId: 'user5',
    name: 'Dr. Lisa Wong',
    specialty: 'Neurology',
    departmentId: '5',
    experience: 14,
    consultationFee: 180,
    rating: 4.9,
    totalRatings: 156,
    image: '/images/doctors/doctor-5.jpg',
    about: 'Neurologist specializing in headache disorders and stroke prevention.',
    isAvailable: true,
    schedules: []
  }
];

export default function AppointmentHistory() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'with-reports'>('all');

  // Use the temporary data instead of the service
  const appointments = tempAppointments;

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

  // Helper function to get doctor by id from temp data
  const getDoctorById = (id: string): Doctor | undefined => {
    return tempDoctors.find(doctor => doctor.id === id);
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar - Calendar */}
      <div className="w-96 p-4 border-r">
        {/* Custom Calendar CSS */}
        <style jsx global>{`
          .rdp {
            margin: 0 !important;
            width: 100% !important;
          }
          
          .rdp-months {
            justify-content: center !important;
          }
          
          .rdp-month {
            width: 100% !important;
          }
          
          .rdp-table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: fixed !important;
          }
          
          .rdp-cell {
            padding: 0 !important;
            width: 35px !important;
            height: 35px !important;
          }
          
          .rdp-head_cell {
            font-size: 0.8rem !important;
            font-weight: 500 !important;
            width: 35px !important;
            height: 30px !important;
            text-align: center !important;
            padding: 0 !important;
          }
          
          .rdp-day {
            width: 32px !important;
            height: 32px !important;
            margin: 0 auto !important;
            font-size: 0.85rem !important;
          }
          
          .rdp-day_selected {
            background-color: #4f46e5 !important;
            color: white !important;
          }
          
          .rdp-day_today {
            background-color: #f3f4f6 !important;
            font-weight: bold !important;
          }
          
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
            background-color: #e5e7eb !important;
          }
          
          .rdp-nav {
            padding: 4px !important;
          }
          
          .rdp-caption {
            padding: 0 !important;
            margin-bottom: 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          
          .rdp-caption_label {
            font-size: 1.1rem !important;
            font-weight: 600 !important;
          }
          
          .rdp-nav_button {
            width: 28px !important;
            height: 28px !important;
          }
          
          /* Fix width of the day picker to ensure all 7 days show */
          .rdp-head_row,
          .rdp-row {
            display: flex !important;
            justify-content: space-between !important;
            width: 100% !important;
          }
          
          /* Ensure all cells are equal width */
          .rdp-head_cell,
          .rdp-cell {
            flex: 1 !important;
            width: calc(100% / 7) !important;
            min-width: 0 !important;
          }
        `}</style>
        
        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="mx-auto"
            showOutsideDays={true}
            fixedWeeks={true}
          />
        </div>
        
        {/* Filter buttons */}
        <div className="mt-6 space-y-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`w-full text-left px-4 py-2.5 rounded-lg ${
              filterStatus === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            All Appointments
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`w-full text-left px-4 py-2.5 rounded-lg ${
              filterStatus === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`w-full text-left px-4 py-2.5 rounded-lg ${
              filterStatus === 'completed' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus('with-reports')}
            className={`w-full text-left px-4 py-2.5 rounded-lg ${
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
                  src={getDoctorById(selectedAppointment.doctorId)?.image || '/images/placeholder-doctor.jpg'}
                  alt={selectedAppointment.doctorName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">{selectedAppointment.doctorName}</h3>
              <p className="text-gray-600 mb-2">{getDoctorById(selectedAppointment.doctorId)?.specialty}</p>
              <div className="flex items-center gap-1">
                <Rating value={4.5} />
                <span className="text-sm text-gray-600">4.5</span>
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