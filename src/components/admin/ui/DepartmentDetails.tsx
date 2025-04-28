'use client';

import React from 'react';

// Define types for department data
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Department {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  doctorCount: number;
  serviceCount: number;
  createdAt: string;
  services: Service[];
}

// Get department icon based on name
const getDepartmentIcon = (name: string): string => {
  const icons: Record<string, string> = {
    'Cardiology': '❤️',
    'Pediatrics': '👶',
    'Dermatology': '🧪',
    'Orthopedics': '🦴',
    'Neurology': '🧠',
    'Ophthalmology': '👁️',
    'Dentistry': '🦷',
    'Default': '🩺'
  };
  
  return icons[name] || icons['Default'];
};

interface DepartmentDetailsProps {
  department: Department;
  activeTab: 'overview' | 'services';
  onTabChange: (tab: 'overview' | 'services') => void;
  onAddService?: () => void;
  onEditService?: (service: Service) => void;
  onDeleteService?: (serviceId: string) => void;
}

const DepartmentDetails: React.FC<DepartmentDetailsProps> = ({
  department,
  activeTab,
  onTabChange,
  onAddService,
  onEditService,
  onDeleteService,
}) => {
  return (
    <div className="space-y-6">
      {activeTab === 'overview' && (
        <div>
          <div className="flex items-center mb-4">
            <div className="h-14 w-14 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl mr-4 text-2xl">
              {getDepartmentIcon(department.name)}
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900">{department.name}</h3>
              <p className="text-gray-600">{department.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Doctors</p>
                  <p className="text-xl font-medium">{department.doctorCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Services</p>
                  <p className="text-xl font-medium">{department.serviceCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium">
                    {new Date(department.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Actions</h4>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                  Edit Department
                </button>
                <button className="w-full bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm">
                  View Doctors
                </button>
                <button 
                  className="w-full bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  onClick={() => onTabChange('services')}
                >
                  Manage Services
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Services</h3>
            <button 
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
              onClick={onAddService}
            >
              Add New Service
            </button>
          </div>

          {department.services.length > 0 ? (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Service Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price (RM)</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration (min)</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {department.services.map((service) => (
                    <tr key={service.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{service.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{service.price}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{service.duration}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => onEditService && onEditService(service)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => onDeleteService && onDeleteService(service.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No services available for this department.</p>
              <button 
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={onAddService}
              >
                Add a service now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DepartmentDetails; 