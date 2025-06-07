'use client';

import React from 'react';
import { useDoctorDashboard } from '@/hooks/doctor/useDoctorDashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { useRouter } from 'next/navigation';

// 颜色常量
const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray: '#6B7280',
};

const APPOINTMENT_TYPE_COLORS = {
  checkup: '#3B82F6',
  followup: '#10B981',
  consultation: '#F59E0B',
  emergency: '#EF4444',
};

// Function to format a date string as a readable date
const formatDateString = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function DoctorDashboard() {
  const { stats, loading, error, fixedDate } = useDoctorDashboard();
  const router = useRouter();
  
  // Format the fixed date for display
  const formattedFixedDate = formatDateString(fixedDate || '2023-05-28');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // 转换预约类型数据为饼图格式
  const appointmentTypeData = Object.entries(stats.appointmentTypes || {}).map(([key, value]) => ({
    name: key,
    value: value
  }));

  // Safety getters to avoid rendering objects directly
  const getTodayAppointmentsCount = () => {
    const count = stats.todayAppointments?.count;
    return typeof count === 'number' ? count : 0;
  };

  const getTodayAppointmentsChange = () => {
    const change = stats.todayAppointments?.change;
    return typeof change === 'number' ? change : 0;
  };
  
  const getTotalPatientsCount = () => {
    const count = stats.totalPatients?.count;
    return typeof count === 'number' ? count : 0;
  };
  
  const getTotalPatientsChange = () => {
    const change = stats.totalPatients?.change;
    return typeof change === 'number' ? change : 0;
  };
  
  const getAvgConsultationMinutes = () => {
    const minutes = stats.avgConsultationTime?.minutes;
    return typeof minutes === 'number' ? minutes : 0;
  };
  
  const getAvgConsultationChange = () => {
    const change = stats.avgConsultationTime?.change;
    return typeof change === 'number' ? change : 0;
  };
  
  const getSatisfactionRating = () => {
    const rating = stats.satisfactionRating?.rating;
    return typeof rating === 'number' ? rating : 0;
  };
  
  const getSatisfactionChange = () => {
    const change = stats.satisfactionRating?.change;
    return typeof change === 'number' ? change : 0;
  };

  // Function to navigate to appointment details
  const navigateToAppointment = (appointmentId: number) => {
    router.push(`/doctor-appointments?appointmentId=${appointmentId}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Week
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50">
            Month
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50">
            Year
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Fixed Date Appointments */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Appointments</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{getTodayAppointmentsCount()}</h2>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <span className="text-sm font-medium text-red-600">17</span>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +{getTodayAppointmentsChange()} from last week
          </p>
        </div>

        {/* Total Patients */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{getTotalPatientsCount()}</h2>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +{getTotalPatientsChange()} from last week
          </p>
        </div>

        {/* Avg. Consultation Time */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Consultation Time</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{getAvgConsultationMinutes()}m</h2>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className={`text-sm ${getAvgConsultationChange() >= 0 ? 'text-green-600' : 'text-red-600'} mt-2`}>
            {getAvgConsultationChange() >= 0 ? '+' : ''}{getAvgConsultationChange()}m from last week
          </p>
        </div>

        {/* Satisfaction Rating */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction Rating</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{getSatisfactionRating()}</h2>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +{getSatisfactionChange()} from last month
          </p>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Appointments Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Weekly Appointments</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(stats.weeklyAppointments || []).map(item => ({
                day: typeof item.day === 'string' ? item.day : (item as any).date || '',
                count: typeof item.count === 'number' ? item.count : 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke={COLORS.primary} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Types Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Appointment Types</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {appointmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={APPOINTMENT_TYPE_COLORS[entry.name as keyof typeof APPOINTMENT_TYPE_COLORS] || COLORS.gray} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            {appointmentTypeData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: APPOINTMENT_TYPE_COLORS[entry.name as keyof typeof APPOINTMENT_TYPE_COLORS] || COLORS.gray }}
                  />
                  <span className="text-sm text-gray-600 capitalize">{entry.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fixed Date Appointments List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Appointments for {formattedFixedDate}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.todayAppointments?.appointments && stats.todayAppointments.appointments.length > 0 ? (
              stats.todayAppointments.appointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => navigateToAppointment(appointment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500">{appointment.time}</p>
                    </div>
                    <span className="text-sm text-gray-600 capitalize px-3 py-1 bg-gray-100 rounded-full">
                      {appointment.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No appointments for {formattedFixedDate}</div>
            )}
          </div>
        </div>

        {/* Recent Patient Notes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Patient Notes</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentNotes && stats.recentNotes.length > 0 ? (
              stats.recentNotes.map((note, index) => (
                <div 
                  key={index} 
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => navigateToAppointment(note.appointmentId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">{note.patientName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(note.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{note.note}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No recent notes</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 