import React from 'react';
import { Department } from '@/lib/mockData';
import Link from 'next/link';

interface DepartmentCardProps {
  department: Department;
  onClick?: () => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, onClick }) => {
  return (
    <Link 
      href={`/departments/${department.id}`} 
      className="block"
      onClick={onClick}
    >
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:border-blue-300 border border-gray-200">
        {/* You could add an icon here */}
        <div className="text-2xl mb-3 flex justify-center">
          {getDepartmentIcon(department.name)}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
          {department.name}
        </h3>
        
        {department.description && (
          <p className="text-gray-600 text-center">{department.description}</p>
        )}
      </div>
    </Link>
  );
};

// Helper function to get an appropriate icon for each department
function getDepartmentIcon(name: string): React.ReactNode {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('cardio')) {
    return '❤️';
  } else if (lowerName.includes('pediatric')) {
    return '👶';
  } else if (lowerName.includes('derm')) {
    return '🧪';
  } else if (lowerName.includes('ortho')) {
    return '🦴';
  } else if (lowerName.includes('neuro')) {
    return '🧠';
  } else if (lowerName.includes('eye') || lowerName.includes('ophthal')) {
    return '👁️';
  } else if (lowerName.includes('dent')) {
    return '🦷';
  } else {
    return '🩺';
  }
}