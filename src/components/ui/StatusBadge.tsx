'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  className?: string;
}

const statusConfig = {
  scheduled: {
    color: 'bg-blue-100 text-blue-800',
    label: 'Scheduled'
  },
  confirmed: {
    color: 'bg-green-100 text-green-800',
    label: 'Confirmed'
  },
  completed: {
    color: 'bg-gray-100 text-gray-800',
    label: 'Completed'
  },
  cancelled: {
    color: 'bg-red-100 text-red-800',
    label: 'Cancelled'
  },
  rescheduled: {
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Rescheduled'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}; 