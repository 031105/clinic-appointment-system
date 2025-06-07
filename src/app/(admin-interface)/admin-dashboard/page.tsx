'use client';

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import Link from 'next/link';
import { StatCard } from '@/components/admin';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';
import { AdminNotification } from '@/lib/api/admin-dashboard-client';
import { Bell, Calendar, FileText, MessageCircle, Users, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Modals components
import SendNotificationModal from './components/SendNotificationModal';
import GenerateReportModal from './components/GenerateReportModal';
import CreateAppointmentModal from './components/CreateAppointmentModal';
import { PatientRegistrationModal } from '@/components/admin/PatientRegistrationModal';
import { useAdminPatients } from '@/hooks/admin/useAdminPatients';

export default function AdminDashboard() {
  const {
    stats,
    notifications,
    loadingStats,
    loadingNotifications,
    sendingNotification,
    generatingReport,
    fetchNotifications,
    sendNotification,
    markNotificationRead,
    generateReport,
    error
  } = useAdminDashboard();

  const { createPatient } = useAdminPatients();

  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showCreateAppointmentModal, setShowCreateAppointmentModal] = useState(false);
  const [showRegisterPatientModal, setShowRegisterPatientModal] = useState(false);
  const [dateRange, setDateRange] = useState<'week'>('week');

  // Handle notification click to mark as read
  const handleNotificationClick = async (notification: AdminNotification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.notification_id);
    }
  };

  // Handle patient registration
  const handlePatientRegistration = async (data: any) => {
    try {
      await createPatient(data);
      // Optionally refresh dashboard stats after creating patient
      console.log('Patient registered successfully');
    } catch (error) {
      console.error('Failed to register patient:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'system':
        return '⚙️';
      case 'reminder':
        return '⏰';
      case 'message':
        return '💬';
      default:
        return '📢';
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1.5 rounded-md ${dateRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setDateRange('week')}
          >
            Week
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {loadingStats ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Total Appointments"
              value={stats.totalAppointments.count.toLocaleString()}
              change={`${stats.totalAppointments.change > 0 ? '+' : ''}${stats.totalAppointments.change}%`}
              icon="📅"
            />
            <StatCard
              title="Active Patients"
              value={stats.activePatients.count.toLocaleString()}
              change={`${stats.activePatients.change > 0 ? '+' : ''}${stats.activePatients.change}%`}
              icon="👥"
            />
            <StatCard
              title="Active Doctors"
              value={stats.activeDoctors.count.toLocaleString()}
              change={`${stats.activeDoctors.change > 0 ? '+' : ''}${stats.activeDoctors.change}%`}
              icon="👨‍⚕️"
            />
          <StatCard
              title="Avg. Satisfaction"
              value={stats.avgSatisfaction.rating.toFixed(1)}
              change={`${stats.avgSatisfaction.change > 0 ? '+' : ''}${stats.avgSatisfaction.change}`}
              icon="⭐"
            />
          </>
        ) : (
          // Error state
          <div className="col-span-4 text-center py-8 text-gray-500">
            Failed to load statistics
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Appointment Trends Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm xl:col-span-4">
          <h2 className="text-lg font-semibold mb-4">Appointment Trends (Week of May 25-31, 2025)</h2>
          {loadingStats || !stats ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={stats.appointmentTrends}
                  margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12, fill: '#374151' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    domain={[0, 20]}
                    tick={{ fontSize: 12, fill: '#374151' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    label={{ value: 'Appointments', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    width={50}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    formatter={(value, name) => [value, 'Appointments']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Notifications Panel */}
        <div className="bg-white rounded-xl p-6 shadow-sm xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h2>
            <button
              onClick={() => fetchNotifications()}
              className="text-blue-600 text-sm hover:text-blue-700"
              disabled={loadingNotifications}
            >
              {loadingNotifications ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {loadingNotifications ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.is_read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No notifications
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <Link
              href="/admin-notifications"
              className="text-blue-600 text-sm font-medium mt-4 block hover:text-blue-700"
            >
              View All Notifications
            </Link>
          )}
        </div>
      </div>

      {/* Second Row with Department Performance and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-6">
        {/* Department Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm xl:col-span-4">
          <h2 className="text-lg font-semibold mb-4">Department Performance (Week of May 25-31, 2025)</h2>
          {loadingStats || !stats ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={stats.departmentPerformance.filter(dept => 
                    dept.department_name.toLowerCase() !== 'unassigned'
                  )}
                  margin={{ top: 20, right: 30, left: 50, bottom: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="department_name" 
                    tick={{ fontSize: 11, fill: '#374151' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                  />
                  <YAxis 
                    domain={[0, 20]}
                    tick={{ fontSize: 12, fill: '#374151' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    label={{ value: 'Appointments', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    width={50}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    formatter={(value, name) => [value, 'Appointments']}
                  />
                  <Bar 
                    dataKey="appointment_count" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm xl:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowCreateAppointmentModal(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              New Appointment
            </button>
            <button
              onClick={() => setShowRegisterPatientModal(true)}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              Register Patient
            </button>
            <button
              onClick={() => setShowGenerateReportModal(true)}
              disabled={generatingReport}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </button>
            <button
              onClick={() => setShowSendNotificationModal(true)}
              disabled={sendingNotification}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {sendingNotification ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SendNotificationModal
        isOpen={showSendNotificationModal}
        onClose={() => setShowSendNotificationModal(false)}
        onSend={sendNotification}
        isLoading={sendingNotification}
      />
      
      <GenerateReportModal
        isOpen={showGenerateReportModal}
        onClose={() => setShowGenerateReportModal(false)}
        onGenerate={generateReport}
        isLoading={generatingReport}
      />

      <CreateAppointmentModal
        isOpen={showCreateAppointmentModal}
        onClose={() => setShowCreateAppointmentModal(false)}
        onSuccess={() => {
          // Optionally refresh dashboard stats after creating appointment
          console.log('Appointment created successfully');
        }}
      />

      <PatientRegistrationModal
        isOpen={showRegisterPatientModal}
        onClose={() => setShowRegisterPatientModal(false)}
        onSubmit={handlePatientRegistration}
      />
    </div>
  );
}