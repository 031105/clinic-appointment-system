import React from 'react';
import { Department } from '@/lib/mockData';

interface DepartmentCardProps {
  department: Department;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ department }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {department.name}
      </h3>
      {department.description && (
        <p className="text-gray-600">{department.description}</p>
      )}
    </div>
  );
}; 