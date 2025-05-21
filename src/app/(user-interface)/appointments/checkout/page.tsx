'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutAppointment() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-2">Appointment Booked Successfully!</h1>
        <p className="text-green-800 mb-4">Your appointment has been scheduled. You will receive a confirmation and further details soon.</p>
        <button
          onClick={() => router.push('/appointments/history')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View My Appointments
        </button>
      </div>
    </div>
  );
} 