import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  className?: string;
}

/**
 * StatCard - A reusable component for displaying statistics on dashboard
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBgColor = 'bg-blue-50',
  className = '',
}) => {
  // Determine if change is positive, negative, or neutral
  const getChangeColor = (changeValue: string): string => {
    if (changeValue.startsWith('+')) {
      return 'text-green-600';
    } else if (changeValue.startsWith('-')) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${getChangeColor(change)}`}>
              {change} from last month
            </p>
          )}
        </div>
        {icon && (
          <div className={`text-2xl ${iconBgColor} p-3 rounded-lg text-blue-600`}>{icon}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard; 