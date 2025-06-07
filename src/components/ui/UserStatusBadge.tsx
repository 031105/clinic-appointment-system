import React from 'react';
import { cn } from '@/lib/utils';

interface UserStatusBadgeProps {
  status: 'active' | 'inactive';
  className?: string;
}

const statusConfig = {
  active: {
    color: 'bg-green-100 text-green-800',
    label: 'Active'
  },
  inactive: {
    color: 'bg-gray-100 text-gray-800',
    label: 'Inactive'
  }
};

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status, className }) => {
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