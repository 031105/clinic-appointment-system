'use client';

import React from 'react';
import { Doctor, Schedule } from '@/lib/mockData';
import { Avatar } from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating'; // We need to create this component

interface DoctorCardProps {
  doctor: Doctor;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const isAvailable = doctor.schedules.some((schedule: Schedule) => schedule.isAvailable);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <Avatar
          src={`/images/doctor-${doctor.id}.jpg`}
          alt={doctor.name}
          size="lg"
        />
        <div>
          <h3 className="text-lg font-semibold">Dr. {doctor.name}</h3>
          <p className="text-blue-600">{doctor.specialty}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Experience: {doctor.experience} years
        </p>
        <div className="flex items-center">
          <Rating value={doctor.rating} readOnly />
          <span className="text-sm text-gray-600 ml-2">{doctor.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge color={isAvailable ? 'success' : 'danger'}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
        <div className="text-blue-600 font-semibold">
          ${doctor.price || '99'}/hr
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full mt-4"
        onClick={() => window.location.href = `/doctors/${doctor.id}`}
        disabled={!isAvailable}
      >
        Book Appointment
      </Button>
    </div>
  );
};