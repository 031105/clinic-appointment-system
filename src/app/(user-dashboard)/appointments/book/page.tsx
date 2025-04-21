'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Rating } from '@/components/ui/Rating';
import { dataService } from '@/lib/dataService';

export default function BookAppointment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const doctor = doctorId ? dataService.getDoctorById(doctorId) : null;

  if (!doctor) {
    return <div>Doctor not found</div>;
  }

  const availableDates = [
    '2024-03-25',
    '2024-03-26',
    '2024-03-27',
    '2024-03-28',
    '2024-03-29'
  ];

  const availableTimes = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle appointment booking logic here
    console.log('Booking appointment:', { selectedDate, selectedTime, reason });
    router.push('/appointments/confirmation');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={doctor.image}
              alt={doctor.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Book Appointment with Dr. {doctor.name}
            </h1>
            <p className="text-blue-600 text-lg mb-2">{doctor.specialty}</p>
            <div className="flex items-center gap-2 mb-2">
              <Rating value={doctor.rating} size="sm" readOnly />
              <span className="text-sm text-gray-600">({doctor.experience} years experience)</span>
            </div>
            <p className="text-blue-600 font-medium">$100 per consultation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="grid grid-cols-5 gap-2">
              {availableDates.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded-lg text-center transition-all duration-200 ${
                    selectedDate === date
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg text-center transition-all duration-200 ${
                    selectedTime === time
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Please describe your symptoms or reason for visit..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedDate || !selectedTime || !reason}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 