import React, { useState } from 'react';

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

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState(tempDepartments);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [newService, setNewService] = useState({ name: '', price: '', duration: '' });
  const [editingService, setEditingService] = useState(null);

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
  const handleViewDepartment = (department) => {
    setSelectedDepartment(department);
    setShowDetailModal(true);
    setActiveTab('overview');
  };

  // Handle service form change
  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  // Handle service save/update
  const handleSaveService = () => {
    if (!newService.name || !newService.price || !newService.duration) {
      alert('Please fill in all fields');
      return;
    }

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
  const handleDeleteService = (serviceId) => {
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
  const handleEditService = (service) => {
    setNewService({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString()
    });
    setEditingService(service.id);
    setShowServiceModal(true);
  };

  // Get department icon based on name
  const getDepartmentIcon = (name) => {
    const icons = {
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Add New Department
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search Departments</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div 
            key={department.id} 
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewDepartment(department)}
          >
            <div className="p-6">
              <div className="flex items-start">
                <div className="text-3xl mr-4">{getDepartmentIcon(department.name)}</div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{department.name}</h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{department.description}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>{department.doctorCount} Doctors</span>
                <span>{department.serviceCount} Services</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No departments found matching your search criteria.</p>
        </div>
      )}

      {/* Department Detail Modal */}
      {showDetailModal && selectedDepartment && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div>
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{getDepartmentIcon(selectedDepartment.name)}</div>
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        {selectedDepartment.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{selectedDepartment.description}</p>
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="border-b border-gray-200 mt-6">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        className={`${
                          activeTab === 'overview'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('overview')}
                      >
                        Overview
                      </button>
                      <button
                        className={`${
                          activeTab === 'services'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('services')}
                      >
                        Services
                      </button>
                      <button
                        className={`${
                          activeTab === 'doctors'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('doctors')}
                      >
                        Doctors
                      </button>
                    </nav>
                  </div>
                  
                  {/* Tab content */}
                  <div className="mt-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Department ID</p>
                          <p className="text-base font-medium">#{selectedDepartment.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created On</p>
                          <p className="text-base font-medium">
                            {new Date(selectedDepartment.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Number of Doctors</p>
                          <p className="text-base font-medium">{selectedDepartment.doctorCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Number of Services</p>
                          <p className="text-base font-medium">{selectedDepartment.serviceCount}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="text-base">{selectedDepartment.description}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Services Tab */}
                    {activeTab === 'services' && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900">Department Services</h4>
                          <button 
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
                            onClick={() => {
                              setNewService({ name: '', price: '', duration: '' });
                              setEditingService(null);
                              setShowServiceModal(true);
                            }}
                          >
                            Add Service
                          </button>
                        </div>
                        
                        {selectedDepartment.services.length > 0 ? (
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
                                {selectedDepartment.services.map((service) => (
                                  <tr key={service.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                      {service.name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{service.price}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{service.duration}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                      <button
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditService(service);
                                        }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="text-red-600 hover:text-red-900"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteService(service.id);
                                        }}
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
                          <p className="text-gray-500 text-center py-4">No services found for this department.</p>
                        )}
                      </div>
                    )}
                    
                    {/* Doctors Tab */}
                    {activeTab === 'doctors' && (
                      <div className="text-center py-4">
                        <p className="text-gray-500">Doctor information would be displayed here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => alert('Edit functionality would be implemented here')}
                >
                  Edit Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {showServiceModal && selectedDepartment && (
        <div className="fixed inset-0 overflow-y-auto z-10" aria-labelledby="service-modal" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="service-name" className="block text-sm font-medium text-gray-700">Service Name</label>
                    <input
                      type="text"
                      id="service-name"
                      name="name"
                      value={newService.name}
                      onChange={handleServiceFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter service name"
                    />
                  </div>
                  <div>
                    <label htmlFor="service-price" className="block text-sm font-medium text-gray-700">Price (RM)</label>
                    <input
                      type="number"
                      id="service-price"
                      name="price"
                      value={newService.price}
                      onChange={handleServiceFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter price"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="service-duration" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                    <input
                      type="number"
                      id="service-duration"
                      name="duration"
                      value={newService.duration}
                      onChange={handleServiceFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter duration"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSaveService}
                >
                  {editingService ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setNewService({ name: '', price: '', duration: '' });
                    setEditingService(null);
                    setShowServiceModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  getDepartment: async (id) => {
    // Example: return await fetch(`/api/departments/${id}`)
    return tempDepartments.find(department => department.id === id);
  },
  
  // Create new department
  createDepartment: async (departmentData) => {
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
  updateDepartment: async (id, departmentData) => {
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
  getDepartmentServices: async (departmentId) => {
    // Example: return await fetch(`/api/departments/${departmentId}/services`)
    const department = tempDepartments.find(d => d.id === departmentId);
    return department ? department.services : [];
  },
  
  // Add service to department
  addService: async (departmentId, serviceData) => {
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
  updateService: async (departmentId, serviceId, serviceData) => {
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
  deleteService: async (departmentId, serviceId) => {
    // Example:
    // return await fetch(`/api/departments/${departmentId}/services/${serviceId}`, {
    //   method: 'DELETE'
    // })
    console.log('Deleting service:', departmentId, serviceId);
    return { success: true }; // Mock response
  }
};