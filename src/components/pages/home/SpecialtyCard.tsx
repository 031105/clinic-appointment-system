import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SpecialtyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  icon,
  title,
  description,
  isSelected = false,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        'flex h-32 w-32 flex-col items-center justify-center rounded-xl border p-4 text-center transition-all hover:border-blue-500 hover:shadow-md',
        isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-600'
          : 'border-gray-200 bg-white text-gray-700',
        className
      )}
    >
      <div className="mb-2 text-2xl">{icon}</div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </button>
  );
};

export default SpecialtyCard; 