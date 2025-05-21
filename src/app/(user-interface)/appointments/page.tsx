'use client';

import React, { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppointments } from '@/hooks';
import { DoctorAvatar } from '@/components/ui/DoctorAvatar';

export default function AppointmentsRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  
  useEffect(() => {
    // 提取URL参数，如果有的话
    const queryParams = filter ? `?filter=${filter}` : '';
    
    // 重定向到history页面
    router.replace(`/appointments/history${queryParams}`);
  }, [router, filter]);
  
  // 显示加载状态，直到重定向完成
  return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to appointments...</p>
      </div>
    </div>
  );
}

export function AppointmentsPage() {
  const router = useRouter();
  const { 
    filteredAppointments, 
    loading, 
    error, 
    filter, 
    setFilter 
  } = useAppointments();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
          {error && <p className="mt-2 text-amber-600">Warning: {error}</p>}
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Appointments</h1>
          <button
            onClick={() => router.push('/user-dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Book New Appointment
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'upcoming' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'completed' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'cancelled' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelled
          </button>
        </div>
        
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Appointments Found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You don't have any appointments yet." 
                : filter === 'upcoming'
                ? "You don't have any upcoming appointments."
                : filter === 'completed'
                ? "You don't have any completed appointments."
                : "You don't have any cancelled appointments."}
            </p>
            <button
              onClick={() => router.push('/user-dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 relative"
              >
                <div className="md:w-1/4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.appointmentDateTime).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-xl font-bold text-blue-600 mt-1">
                      {new Date(appointment.appointmentDateTime).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="md:w-3/4 flex flex-col md:flex-row md:items-center md:justify-between flex-grow">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <DoctorAvatar 
                        className="w-full h-full" 
                        userId={appointment.doctor?.userId}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {appointment.doctorName || `Doctor #${appointment.doctorId}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.specialty || 'Medical Specialist'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-4 md:mt-0 gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                    
                    <button
                      onClick={() => router.push(`/appointments/history?id=${appointment.id}`)}
                      className="text-sm text-blue-600 font-medium hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 