'use client';

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

// Temporary data for doctor dashboard
const statCards = [
  { title: 'Today\'s Appointments', value: '8', change: '+2', icon: '📅' },
  { title: 'Total Patients', value: '143', change: '+5', icon: '👥' },
  { title: 'Avg. Consultation Time', value: '22m', change: '-2m', icon: '⏱️' },
  { title: 'Satisfaction Rating', value: '4.9', change: '+0.2', icon: '⭐' },
];

const appointmentTrends = [
  { name: 'Mon', appointments: 5 },
  { name: 'Tue', appointments: 8 },
  { name: 'Wed', appointments: 6 },
  { name: 'Thu', appointments: 9 },
  { name: 'Fri', appointments: 7 },
  { name: 'Sat', appointments: 4 },
  { name: 'Sun', appointments: 2 },
];

const appointmentTypes = [
  { name: 'Check-up', value: 55 },
  { name: 'Follow-up', value: 25 },
  { name: 'Emergency', value: 10 },
  { name: 'Consultation', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const upcomingAppointments = [
  { id: 1, patientName: 'John Wong', time: '10:30 AM', type: 'Check-up' },
  { id: 2, patientName: 'Sarah Lee', time: '11:45 AM', type: 'Follow-up' },
  { id: 3, patientName: 'David Chen', time: '2:15 PM', type: 'Consultation' },
  { id: 4, patientName: 'Michelle Tan', time: '3:30 PM', type: 'Check-up' },
  { id: 5, patientName: 'Robert Lim', time: '4:45 PM', type: 'Follow-up' },
];

const recentPatientNotes = [
  { id: 1, patientName: 'Lisa Zhang', update: 'Blood pressure levels returning to normal after medication adjustment.', time: '2 hours ago' },
  { id: 2, patientName: 'Kevin Teo', update: 'Referred to specialist for further tests on recurring symptoms.', time: '4 hours ago' },
  { id: 3, patientName: 'Jenny Lau', update: 'Post-surgery recovery progressing well. Scheduled follow-up in 2 weeks.', time: '1 day ago' },
];

// Stat Card Component
const StatCard = ({ title, value, change, icon }: { title: string, value: string, change: string, icon: string }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className={`text-xs font-medium mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {change} from last week
        </p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

export default function DoctorDashboard() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');

  // Function to handle date range changes
  const handleDateRangeChange = (range: 'week' | 'month' | 'year') => {
    setDateRange(range);
    // In a real application, this would fetch new data based on the range
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
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

      {/* Stat Cards */}
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
        {/* Weekly Appointment Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Weekly Appointments</h2>
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

        {/* Appointment Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Appointment Types</h2>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {appointmentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.patientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <button className="text-blue-600 text-sm font-medium">View All Appointments</button>
          </div>
        </div>

        {/* Recent Patient Notes */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Patient Notes</h2>
          <div className="space-y-4">
            {recentPatientNotes.map((note) => (
              <div key={note.id} className="border-b border-gray-100 pb-3">
                <p className="text-sm font-medium text-gray-900">{note.patientName}</p>
                <p className="text-sm text-gray-600 mt-1">{note.update}</p>
                <p className="text-xs text-gray-500 mt-1">{note.time}</p>
              </div>
            ))}
          </div>
          <button className="text-blue-600 text-sm font-medium mt-4">View All Notes</button>
        </div>
      </div>
    </div>
  );
} 