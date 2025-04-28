'use client';

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { StatCard } from '@/components/admin';

// Temporary data for dashboard
const statCards = [
  { title: 'Total Appointments', value: '1,248', change: '+12%', icon: '📅' },
  { title: 'Active Patients', value: '586', change: '+5%', icon: '👥' },
  { title: 'Revenue', value: 'RM 125K', change: '+8%', icon: '💰' },
  { title: 'Avg. Satisfaction', value: '4.8', change: '+0.2', icon: '⭐' },
];

const appointmentTrends = [
  { name: 'Jan', appointments: 65 },
  { name: 'Feb', appointments: 59 },
  { name: 'Mar', appointments: 80 },
  { name: 'Apr', appointments: 81 },
  { name: 'May', appointments: 56 },
  { name: 'Jun', appointments: 55 },
  { name: 'Jul', appointments: 40 },
];

const departmentPerformance = [
  { name: 'Cardiology', appointments: 78, revenue: 120 },
  { name: 'Dentistry', appointments: 65, revenue: 90 },
  { name: 'Pediatrics', appointments: 54, revenue: 70 },
  { name: 'Orthopedics', appointments: 43, revenue: 95 },
  { name: 'Dermatology', appointments: 29, revenue: 60 },
];

const recentActivity = [
  { id: 1, type: 'appointment', message: 'New appointment scheduled with Dr. John Smith', time: '10 minutes ago' },
  { id: 2, type: 'patient', message: 'New patient registration: Jessica Tan', time: '25 minutes ago' },
  { id: 3, type: 'review', message: 'New 5-star review for Dr. Emily Wong', time: '1 hour ago' },
  { id: 4, type: 'appointment', message: 'Appointment cancelled by Michael Chan', time: '2 hours ago' },
  { id: 5, type: 'appointment', message: 'Appointment rescheduled: David Wong', time: '3 hours ago' },
];

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');

  // Function to handle date range changes
  const handleDateRangeChange = (range: 'week' | 'month' | 'year') => {
    setDateRange(range);
    // In a real application, this would fetch new data based on the range
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1.5 rounded-md ${dateRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => handleDateRangeChange('week')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md ${dateRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => handleDateRangeChange('month')}
          >
            Month
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md ${dateRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => handleDateRangeChange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stat Cards - Now using the StatCard component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Trends Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Appointment Trends</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="appointments" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="border-b border-gray-100 pb-3">
                <p className="text-sm text-gray-800">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
          <button className="text-blue-600 text-sm font-medium mt-4">View All Activity</button>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Department Performance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              New Appointment
            </button>
            <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
              Register Patient
            </button>
            <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
              Generate Report
            </button>
            <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
              Send Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}