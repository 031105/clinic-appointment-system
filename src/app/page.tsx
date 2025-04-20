'use client';

import { useState, useEffect } from 'react';
import { dataService } from '@/lib/dataService';
import { Department, Doctor, Appointment } from '@/lib/mockData';
import Image from 'next/image';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const departments = dataService.getDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState<Department>(departments[0]);
  const doctors = dataService.getDoctorsByDepartment(selectedDepartment.id);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const departments = dataService.getDepartments();
    const doctors = dataService.getDoctors();
    const appointments = dataService.getUpcomingAppointments();
    
    if (departments.length > 0) {
      setSelectedDepartment(departments[0]);
      if (doctors.length > 0) {
        setSelectedDoctor(doctors[0]);
      }
    }
    setUpcomingAppointments(appointments);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Main content area */}
      <div className="flex-1 p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, Kayden!</h1>
          <p className="text-gray-600 text-lg">Hello there! Welcome to our medical app, how can we assist you?</p>
        </div>

        {/* Department list */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
          <button
            className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-sm p-3 hover:shadow-md transition-shadow"
            onClick={() => setSelectedDepartment(departments[0])}
          >
            <div className="text-2xl mb-2">👨‍⚕️</div>
            <span className="text-sm font-medium">GP</span>
          </button>
          <button
            className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-sm p-3 hover:shadow-md transition-shadow"
            onClick={() => setSelectedDepartment(departments[1])}
          >
            <div className="text-2xl mb-2">❤️</div>
            <span className="text-sm font-medium">Cardiologist</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl p-3 transition-shadow ${
              selectedDepartment.name === 'Dentist' 
                ? 'bg-blue-50 border-2 border-blue-500 shadow-sm' 
                : 'bg-white shadow-sm hover:shadow-md'
            }`}
            onClick={() => setSelectedDepartment(departments[2])}
          >
            <div className="text-2xl mb-2">🦷</div>
            <span className="text-sm font-medium">Dentist</span>
          </button>
          <button
            className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-sm p-3 hover:shadow-md transition-shadow"
            onClick={() => setSelectedDepartment(departments[3])}
          >
            <div className="text-2xl mb-2">👨‍⚕️</div>
            <span className="text-sm font-medium">Oncologist</span>
          </button>
        </div>

        {/* Doctor List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Doctor List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                className={`text-left p-6 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all ${
                  selectedDoctor?.id === doctor.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-4 flex items-center justify-center text-4xl">
                  X
                </div>
                <h3 className="font-semibold text-lg mb-1">{doctor.name}</h3>
                <p className="text-gray-500 mb-2">{doctor.specialty}</p>
                <p className="text-blue-600 font-medium">RM 99/h</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-1/4 bg-white rounded-lg p-3">
        {/* Upcoming Appointments Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Upcoming Schedule</h2>
          <div className="space-y-2">
            {upcomingAppointments.map((appointment: Appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg border p-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                    X
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{appointment.doctorName}</h3>
                    <p className="text-gray-500 text-xs">{appointment.specialty}</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs">{appointment.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs">{appointment.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 mb-3">
          <button 
            onClick={() => router.push('/appointments?filter=upcoming')}
            className="w-full text-center text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
          >
            View More
          </button>
        </div>

        {/* Doctor Details Section */}
        {selectedDoctor && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                X
              </div>
              <div>
                <h3 className="font-medium text-sm">{selectedDoctor.name}</h3>
                <p className="text-gray-500 text-xs">{selectedDoctor.specialty}</p>
                <p className="text-blue-600 text-xs">RM {selectedDoctor.consultationFee}/h</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-2 bg-gray-50 rounded-lg p-2">
              <div>
                <p className="text-lg font-semibold">{selectedDoctor.experience} Years</p>
                <p className="text-gray-500 text-xs">Experience</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{selectedDoctor.reviewCount}K</p>
                <p className="text-gray-500 text-xs">Review</p>
              </div>
            </div>

            <div className="mb-3">
              <h4 className="text-sm font-semibold mb-1">About</h4>
              <p className="text-gray-600 text-xs leading-relaxed">{selectedDoctor.about}</p>
            </div>

            <button 
              onClick={() => router.push(`/appointments/book/${selectedDoctor.id}`)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Booking Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 