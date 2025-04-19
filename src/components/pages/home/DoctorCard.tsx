'use client';

import React from 'react';
import { Doctor, Schedule } from '@/lib/mockData';
import { Avatar } from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface DoctorCardProps {
  doctor: Doctor;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const isAvailable = doctor.schedules.some((schedule: Schedule) => schedule.isAvailable);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar
          src={`/images/doctor-${doctor.id}.jpg`}
          alt={doctor.name}
          size="lg"
        />
        <div>
          <h3 className="text-lg font-semibold">Dr. {doctor.name}</h3>
          <p className="text-gray-600">{doctor.specialty}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Experience: {doctor.experience} years
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-yellow-500">★</span>
          <span className="text-sm text-gray-600">{doctor.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge color={isAvailable ? 'success' : 'danger'}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
        <Button
          variant="primary"
          onClick={() => window.location.href = `/doctors/${doctor.id}`}
          disabled={!isAvailable}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
}; 