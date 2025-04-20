'use client';

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Appointment } from '@/lib/mockData';

interface CalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  appointments: Appointment[];
}

export default function Calendar({ value, onChange, appointments }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(value);
    date.setDate(1);
    return date;
  });

  // Get days in month
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  // Generate array of days
  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return dayNumber;
  });

  // Navigation functions
  const prevMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(date);
  };

  const nextMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(date);
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (day: number) => {
    const date = new Date(currentMonth);
    date.setDate(day);
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date();
    const date = new Date(currentMonth);
    date.setDate(day);
    return date.toDateString() === today.toDateString();
  };

  // Check if a date is selected
  const isSelected = (day: number) => {
    const date = new Date(currentMonth);
    date.setDate(day);
    return date.toDateString() === value.toDateString();
  };

  return (
    <div className="select-none">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="font-semibold">
          {currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) return <div key={index} className="aspect-square" />;

          const dateAppointments = getAppointmentsForDate(day);
          const hasUpcoming = dateAppointments.some(a => a.status === 'upcoming');
          const hasCompleted = dateAppointments.some(a => a.status === 'completed');

          return (
            <button
              key={index}
              onClick={() => {
                const date = new Date(currentMonth);
                date.setDate(day);
                onChange(date);
              }}
              className={`
                aspect-square relative flex items-center justify-center
                text-sm font-medium rounded-lg transition-colors
                ${isSelected(day)
                  ? 'bg-blue-600 text-white'
                  : isToday(day)
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
                }
              `}
            >
              {day}
              
              {/* Appointment indicators */}
              {(hasUpcoming || hasCompleted) && (
                <div className="absolute bottom-1 flex gap-1">
                  {hasUpcoming && (
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                  {hasCompleted && (
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 