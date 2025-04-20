'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Rating } from '@/components/ui/Rating';
import { Doctor } from '@/lib/mockData';

interface DoctorDetailsProps {
  doctor: Doctor;
}

export default function DoctorDetails({ doctor }: DoctorDetailsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={doctor.image}
            alt={doctor.name}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Dr. {doctor.name}</h2>
          <p className="text-blue-600">{doctor.specialty}</p>
          <div className="flex items-center gap-2 mt-1">
            <Rating value={doctor.rating} size="sm" readOnly />
            <span className="text-sm text-gray-600">({doctor.experience} years experience)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Consultation Fee</p>
            <p className="text-lg font-semibold">$100</p>
          </div>
          <Link
            href={`/appointments/book?doctorId=${doctor.id}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
} 