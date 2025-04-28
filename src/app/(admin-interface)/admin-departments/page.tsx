'use client';

import React, { useState } from 'react';
import { 
  SearchFilterBar, 
  DataTable, 
  ModalDialog,
  FormField,
  DepartmentDetails
} from '@/components/admin';

// Temporary department data
const tempDepartments = [
  { 
    id: '1',
    name: 'Cardiology',
    description: 'Specialized care for heart conditions and cardiovascular diseases',
    iconUrl: '/images/departments/cardiology.png',
    doctorCount: 4,
    serviceCount: 12,
    createdAt: '2023-01-01',
    services: [
      { id: '101', name: 'ECG', price: 150, duration: 30 },
      { id: '102', name: 'Echo', price: 300, duration: 45 },
      { id: '103', name: 'Stress Test', price: 250, duration: 60 }
    ]
  },
  { 
    id: '2', 
    name: 'Pediatrics',
    description: 'Healthcare for children and adolescents',
    iconUrl: '/images/departments/pediatrics.png',
    doctorCount: 3,
    serviceCount: 10,
    createdAt: '2023-01-01',
    services: [
      { id: '201', name: 'Well-child visit', price: 100, duration: 30 },
      { id: '202', name: 'Vaccination', price: 50, duration: 15 },
      { id: '203', name: 'Pediatric consultation', price: 120, duration: 30 }
    ]
  },
  { 
    id: '3', 
    name: 'Dermatology',
    description: 'Treatment of skin conditions and cosmetic procedures',
    iconUrl: '/images/departments/dermatology.png',
    doctorCount: 3,
    serviceCount: 15,
    createdAt: '2023-01-01',
    services: [
      { id: '301', name: 'Skin consultation', price: 120, duration: 30 },
      { id: '302', name: 'Mole removal', price: 200, duration: 45 },
      { id: '303', name: 'Acne treatment', price: 150, duration: 30 }
    ]
  },
  { 
    id: '4', 
    name: 'Orthopedics',
    description: 'Bone and joint care including sports medicine',
    iconUrl: '/images/departments/orthopedics.png',
    doctorCount: 3,
    serviceCount: 8,
    createdAt: '2023-01-01',
    services: [
      { id: '401', name: 'Joint consultation', price: 150, duration: 30 },
      { id: '402', name: 'X-ray analysis', price: 200, duration: 45 },
      { id: '403', name: 'Physical therapy session', price: 100, duration: 60 }
    ]
  },
  { 
    id: '5', 
    name: 'Neurology',
    description: 'Diagnosis and treatment of nervous system disorders',
    iconUrl: '/images/departments/neurology.png',
    doctorCount: 3,
    serviceCount: 7,
    createdAt: '2023-01-01',
    services: [
      { id: '501', name: 'Neurological examination', price: 180, duration: 45 },
      { id: '502', name: 'EEG', price: 250, duration: 60 },
      { id: '503', name: 'Cognitive assessment', price: 200, duration: 60 }
    ]
  },
  { 
    id: '6', 
    name: 'Ophthalmology',
    description: 'Eye care and vision health services',
    iconUrl: '/images/departments/ophthalmology.png',
    doctorCount: 2,
    serviceCount: 9,
    createdAt: '2023-01-01',
    services: [
      { id: '601', name: 'Vision test', price: 80, duration: 30 },
      { id: '602', name: 'Eye examination', price: 120, duration: 45 },
      { id: '603', name: 'Glaucoma screening', price: 150, duration: 30 }
    ]
  },
  { 
    id: '7', 
    name: 'Dentistry',
    description: 'Oral health and dental care services',
    iconUrl: '/images/departments/dentistry.png',
    doctorCount: 1,
    serviceCount: 12,
    createdAt: '2023-01-01',
    services: [
      { id: '701', name: 'Dental checkup', price: 100, duration: 30 },
      { id: '702', name: 'Teeth cleaning', price: 150, duration: 45 },
      { id: '703', name: 'Cavity filling', price: 200, duration: 60 }
    ]
  }
];

// Define types for our data
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

// Define department table columns
const departmentColumns = [
  { 
    header: 'ID', 
    accessor: (department: Department) => <div className="text-sm font-medium text-gray-900">#{department.id}</div> 
  },
  { 
    header: 'Department', 
    accessor: (department: Department) => (
      <div className="flex items-center">
        <div className="h-10 w-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg mr-3">
          {getDepartmentIcon(department.name)}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{department.name}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">{department.description}</div>
        </div>
      </div>
    )
  },
  { 
    header: 'Statistics', 
    accessor: (department: Department) => (
      <div>
        <div className="text-sm text-gray-500">Doctors: <span className="font-medium text-gray-900">{department.doctorCount}</span></div>
        <div className="text-sm text-gray-500">Services: <span className="font-medium text-gray-900">{department.serviceCount}</span></div>
      </div>
    )
  },
  { 
    header: 'Created At', 
    accessor: (department: Department) => (
      <div className="text-sm text-gray-900">
        {new Date(department.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}
      </div>
    )
  }
];

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

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>(tempDepartments);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'services'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [newService, setNewService] = useState({ name: '', price: '', duration: '' });
  const [editingService, setEditingService] = useState<string | null>(null);

  // Filter departments based on search query
  const filteredDepartments = departments.filter(department => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        department.name.toLowerCase().includes(query) ||
        department.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Handle department view
  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setShowDetailModal(true);
    setActiveTab('overview');
  };

  // Handle service form change
  const handleServiceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  // Handle service save/update
  const handleSaveService = () => {
    if (!newService.name || !newService.price || !newService.duration) {
      alert('Please fill in all fields');
      return;
    }

    if (!selectedDepartment) return;

    if (editingService) {
      // Update existing service
      const updatedDepartment = {
        ...selectedDepartment,
        services: selectedDepartment.services.map(service => 
          service.id === editingService 
            ? { 
                ...service, 
                name: newService.name, 
                price: parseInt(newService.price), 
                duration: parseInt(newService.duration) 
              } 
            : service
        )
      };
      
      setDepartments(departments.map(dept => 
        dept.id === selectedDepartment.id ? updatedDepartment : dept
      ));
      
      setSelectedDepartment(updatedDepartment);
    } else {
      // Add new service
      const newServiceObj = {
        id: Date.now().toString(),
        name: newService.name,
        price: parseInt(newService.price),
        duration: parseInt(newService.duration)
      };
      
      const updatedDepartment = {
        ...selectedDepartment,
        services: [...selectedDepartment.services, newServiceObj],
        serviceCount: selectedDepartment.serviceCount + 1
      };
      
      setDepartments(departments.map(dept => 
        dept.id === selectedDepartment.id ? updatedDepartment : dept
      ));
      
      setSelectedDepartment(updatedDepartment);
    }
    
    // Reset form and close modal
    setNewService({ name: '', price: '', duration: '' });
    setEditingService(null);
    setShowServiceModal(false);
  };

  // Handle service delete
  const handleDeleteService = (serviceId: string) => {
    if (!selectedDepartment) return;
    
    if (window.confirm('Are you sure you want to delete this service?')) {
      const updatedDepartment = {
        ...selectedDepartment,
        services: selectedDepartment.services.filter(service => service.id !== serviceId),
        serviceCount: selectedDepartment.serviceCount - 1
      };
      
      setDepartments(departments.map(dept => 
        dept.id === selectedDepartment.id ? updatedDepartment : dept
      ));
      
      setSelectedDepartment(updatedDepartment);
    }
  };

  // Handle edit service
  const handleEditService = (service: Service) => {
    setNewService({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString()
    });
    setEditingService(service.id);
    setShowServiceModal(true);
  };

  // Handle add new service
  const handleAddNewService = () => {
    setNewService({ name: '', price: '', duration: '' });
    setEditingService(null);
    setShowServiceModal(true);
  };

  // Table actions
  const tableActions = [
    {
      label: 'View',
      onClick: handleViewDepartment,
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Edit',
      onClick: (department: Department) => {
        // Implement edit functionality
        console.log('Edit department:', department);
      },
      className: 'text-gray-500 hover:text-gray-700'
    }
  ];

  // Service form footer
  const serviceFormFooter = (
    <div className="flex justify-end space-x-2">
      <button 
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        onClick={() => {
          setShowServiceModal(false);
          setEditingService(null);
          setNewService({ name: '', price: '', duration: '' });
        }}
      >
        Cancel
      </button>
      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={handleSaveService}
      >
        {editingService ? 'Update' : 'Add'} Service
      </button>
    </div>
  );

  // Department detail footer with tabs
  const departmentDetailFooter = (
    <div className="flex justify-between items-center">
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeTab === 'overview' 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeTab === 'services' 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Services
        </button>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-1 text-sm rounded-md hover:bg-blue-700"
        onClick={() => setShowDetailModal(false)}
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Add New Department
        </button>
      </div>

      {/* Search Bar */}
      <SearchFilterBar
        searchPlaceholder="Search by department name or description..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        className="mb-6"
      />

      {/* Department Table */}
      <DataTable
        data={filteredDepartments}
        columns={departmentColumns}
        keyField="id"
        actions={tableActions}
        emptyMessage="No departments found matching your search criteria."
      />

      {/* Department Detail Modal */}
      <ModalDialog
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedDepartment ? `Department: ${selectedDepartment.name}` : 'Department Details'}
        footer={departmentDetailFooter}
        size="lg"
      >
        {selectedDepartment && (
          <DepartmentDetails
            department={selectedDepartment}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddService={handleAddNewService}
            onEditService={handleEditService}
            onDeleteService={handleDeleteService}
          />
        )}
      </ModalDialog>

      {/* Service Form Modal */}
      <ModalDialog
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingService(null);
          setNewService({ name: '', price: '', duration: '' });
        }}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        footer={serviceFormFooter}
        size="md"
      >
        <div className="space-y-4">
          <FormField
            id="name"
            label="Service Name"
            type="text"
            value={newService.name}
            onChange={handleServiceFormChange}
            placeholder="Enter service name"
            required
          />
          <FormField
            id="price"
            label="Price (RM)"
            type="number"
            value={newService.price}
            onChange={handleServiceFormChange}
            placeholder="Enter price"
            required
          />
          <FormField
            id="duration"
            label="Duration (minutes)"
            type="number"
            value={newService.duration}
            onChange={handleServiceFormChange}
            placeholder="Enter duration"
            required
          />
        </div>
      </ModalDialog>
    </div>
  );
}

// API functions to connect with backend later
export const departmentApi = {
  // Get all departments
  getDepartments: async () => {
    // This will be replaced with actual API call
    // Example: return await fetch('/api/departments')
    return tempDepartments; // Currently returns mock data
  },
  
  // Get a single department
  getDepartment: async (id: string) => {
    // Example: return await fetch(`/api/departments/${id}`)
    return tempDepartments.find(department => department.id === id);
  },
  
  // Create new department
  createDepartment: async (departmentData: Partial<Department>) => {
    // Example: 
    // return await fetch('/api/departments', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(departmentData)
    // })
    console.log('Creating department:', departmentData);
    return { success: true, id: Date.now().toString() }; // Mock response
  },
  
  // Update department
  updateDepartment: async (id: string, departmentData: Partial<Department>) => {
    // Example:
    // return await fetch(`/api/departments/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(departmentData)
    // })
    console.log('Updating department:', id, departmentData);
    return { success: true }; // Mock response
  },
  
  // Get department services
  getDepartmentServices: async (departmentId: string) => {
    // Example: return await fetch(`/api/departments/${departmentId}/services`)
    const department = tempDepartments.find(d => d.id === departmentId);
    return department ? department.services : [];
  },
  
  // Add service to department
  addService: async (departmentId: string, serviceData: Partial<Service>) => {
    // Example:
    // return await fetch(`/api/departments/${departmentId}/services`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(serviceData)
    // })
    console.log('Adding service to department:', departmentId, serviceData);
    return { success: true, id: Date.now().toString() }; // Mock response
  },
  
  // Update service
  updateService: async (departmentId: string, serviceId: string, serviceData: Partial<Service>) => {
    // Example:
    // return await fetch(`/api/departments/${departmentId}/services/${serviceId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(serviceData)
    // })
    console.log('Updating service:', departmentId, serviceId, serviceData);
    return { success: true }; // Mock response
  },
  
  // Delete service
  deleteService: async (departmentId: string, serviceId: string) => {
    // Example:
    // return await fetch(`/api/departments/${departmentId}/services/${serviceId}`, {
    //   method: 'DELETE'
    // })
    console.log('Deleting service:', departmentId, serviceId);
    return { success: true }; // Mock response
  }
};