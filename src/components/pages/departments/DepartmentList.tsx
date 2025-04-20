import React from 'react';
import Link from 'next/link';
import { Department } from '@/lib/mockData';

interface DepartmentListProps {
  departments: Department[];
}

const DepartmentList: React.FC<DepartmentListProps> = ({ departments }) => {
  const getEmoji = (name: string) => {
    const emojiMap: { [key: string]: string } = {
      'Cardiology': '❤️',
      'Pediatrics': '👶',
      'Dermatology': '✏️',
      'Orthopedics': '🦴',
      // Add more mappings as needed
    };
    return emojiMap[name] || '👨‍⚕️';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {departments.map((department) => (
        <Link
          key={department.id}
          href={`/departments/${department.id}`}
          className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <span className="text-2xl mb-2">{getEmoji(department.name)}</span>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {department.name}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-2">
              {department.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DepartmentList; 