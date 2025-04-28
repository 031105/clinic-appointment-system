import React from 'react';

type StatusType = 'active' | 'inactive' | 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

/**
 * StatusBadge - A reusable component for displaying status indicators
 * Used across admin interfaces for appointments, patients, etc.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // Status color mapping
  const getStatusStyles = (status: StatusType): string => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    };
    
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Format status text to capitalize first letter
  const formatStatusText = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(status)} ${className}`}
    >
      {formatStatusText(status)}
    </span>
  );
};

export default StatusBadge; 