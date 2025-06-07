'use client';

import React, { useState } from 'react';
import { 
  SearchFilterBar, 
  DataTable, 
  ModalDialog,
  FormField
} from '@/components/admin';
import { 
  useAdminDepartments, 
  useAdminDepartmentServices, 
  useAdminDepartmentStats,
  useAdminDepartmentDoctors 
} from '@/hooks/use-admin-departments';
import { Department, Service, DepartmentRequest, ServiceRequest, DepartmentDoctor } from '@/lib/api/admin-client';
import { Loader2, Plus, Edit, Trash2, Eye, ChevronDown, ChevronUp, Save, X, UserPlus, UserMinus } from 'lucide-react';
import { 
  validateRequired, 
  validateLength, 
  validateNumber,
  validateEmoji,
  sanitizeText,
  validateFields,
  validateSearchQuery
} from '@/utils/validation';

// Define department table columns
const departmentColumns = [
  { 
    header: 'ID', 
    accessor: (department: Department) => <div className="text-sm font-medium text-gray-900">#{department.department_id}</div> 
  },
  { 
    header: 'Department', 
    accessor: (department: Department) => (
      <div className="flex items-center">
        <div className="h-10 w-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg mr-3">
          {department.emoji_icon || '🏥'}
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
        <div className="text-sm text-gray-500">Doctors: <span className="font-medium text-gray-900">{department.doctor_count || 0}</span></div>
        <div className="text-sm text-gray-500">Services: <span className="font-medium text-gray-900">{department.service_count || 0}</span></div>
      </div>
    )
  },
  { 
    header: 'Status', 
    accessor: (department: Department) => (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        department.is_active 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {department.is_active ? 'Active' : 'Inactive'}
      </span>
    )
  },
  { 
    header: 'Created At', 
    accessor: (department: Department) => (
      <div className="text-sm text-gray-900">
        {new Date(department.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}
      </div>
    )
  }
];

export default function DepartmentManagement() {
  const {
    departments,
    isLoadingDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    isCreatingDepartment,
    isUpdatingDepartment,
    isDeletingDepartment
  } = useAdminDepartments();

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'doctors'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  
  // Form validation states
  const [serviceFormErrors, setServiceFormErrors] = useState<{
    name?: string;
    description?: string;
    price?: string;
    duration?: string;
  }>({});
  
  // Department form state
  const [departmentForm, setDepartmentForm] = useState<DepartmentRequest>({
    name: '',
    description: '',
    emoji_icon: '🏥'
  });
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Service form state
  const [serviceForm, setServiceForm] = useState<ServiceRequest>({
    name: '',
    description: '',
    price: 0,
    duration: 30
  });

  // Services and stats for selected department
  const {
    services,
    isLoadingServices,
    createService,
    updateService,
    deleteService,
    isCreatingService,
    isUpdatingService,
    isDeletingService
  } = useAdminDepartmentServices(selectedDepartment?.department_id || null);

  const {
    stats,
    isLoadingStats
  } = useAdminDepartmentStats(selectedDepartment?.department_id || null);

  // Doctors for selected department
  const {
    doctors,
    unassignedDoctors,
    isLoadingDoctors,
    isLoadingUnassigned,
    assignDoctor,
    removeDoctor,
    isAssigningDoctor,
    isRemovingDoctor
  } = useAdminDepartmentDoctors(selectedDepartment?.department_id || null);

  // Department validation
  const validateDepartmentForm = (): boolean => {
    const validationResults = {
      name: validateRequired(sanitizeText(departmentForm.name), 'Department name') &&
             validateLength(sanitizeText(departmentForm.name), 3, 100, 'Department name'),
      description: departmentForm.description ? 
        validateLength(sanitizeText(departmentForm.description), 0, 500, 'Description') : 
        { isValid: true },
      emoji_icon: validateEmoji(departmentForm.emoji_icon || '', 'Icon')
    };

    // Convert validation results to boolean
    const isValid = validationResults.name.isValid && 
                   validationResults.description.isValid && 
                   validationResults.emoji_icon.isValid;

    return isValid;
  };

  // Service validation functions using our validation tools
  const validateServiceForm = (): boolean => {
    const validationResults = {
      name: validateRequired(sanitizeText(serviceForm.name), 'Service name') &&
             validateLength(sanitizeText(serviceForm.name), 3, 100, 'Service name'),
      description: serviceForm.description ? 
        validateLength(sanitizeText(serviceForm.description), 0, 500, 'Description') : 
        { isValid: true },
      price: validateNumber(serviceForm.price, 0, 10000, 'Price', true, true),
      duration: validateNumber(serviceForm.duration, 5, 480, 'Duration', true, false)
    };

    const { isValid, errors } = validateFields(validationResults);
    setServiceFormErrors(errors);
    return isValid;
  };

  // Enhanced search validation
  const handleSearchChange = (query: string) => {
    const searchValidation = validateSearchQuery(query);
    if (searchValidation.isValid) {
      setSearchQuery(query);
    }
  };

  // Filter departments based on search query
  const filteredDepartments = departments.filter(department => {
    // Hide "Unassigned" department from the list
    if (department.name.toLowerCase() === 'unassigned') {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        department.name.toLowerCase().includes(query) ||
        department.description?.toLowerCase().includes(query)
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

  // Handle department form
  const handleDepartmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDepartmentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveDepartment = () => {
    if (!validateDepartmentForm()) {
      alert('Please correct the errors in the form');
      return;
    }

    const formattedData: DepartmentRequest = {
      name: sanitizeText(departmentForm.name),
      description: sanitizeText(departmentForm.description || ''),
      emoji_icon: departmentForm.emoji_icon || '🏥'
    };

    if (editingDepartment) {
      updateDepartment({
        id: editingDepartment.department_id,
        data: formattedData
      });
    } else {
      createDepartment(formattedData);
    }

    setShowDepartmentModal(false);
    setDepartmentForm({ name: '', description: '', emoji_icon: '🏥' });
    setEditingDepartment(null);
  };
      
  const handleEditDepartment = (department: Department) => {
    setDepartmentForm({
      name: department.name,
      description: department.description || '',
      emoji_icon: department.emoji_icon
    });
    setEditingDepartment(department);
    setShowDepartmentModal(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    if (window.confirm(`Are you sure you want to delete department "${department.name}"?`)) {
      deleteDepartment(department.department_id);
    }
  };

  const handleAddNewDepartment = () => {
    setDepartmentForm({ name: '', description: '', emoji_icon: '🏥' });
    setEditingDepartment(null);
    setShowDepartmentModal(true);
  };

  // Handle services
  const handleAddNewService = () => {
    setServiceForm({ name: '', description: '', price: 0, duration: 30 });
    setEditingService(null);
    setServiceFormErrors({});
    setShowAddServiceForm(true);
    setExpandedService(null); // Close any expanded services
  };

  const handleServiceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'price' || name === 'duration' ? parseFloat(value) || 0 : value;
    
    setServiceForm(prev => ({ 
      ...prev, 
      [name]: newValue 
    }));

    // Clear the error for this field when user starts typing
    if (serviceFormErrors[name as keyof typeof serviceFormErrors]) {
      setServiceFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSaveService = () => {
    if (!validateServiceForm()) {
      return;
    }

    if (!selectedDepartment) return;

    // Format the data before submission
    const formattedData: ServiceRequest = {
      name: sanitizeText(serviceForm.name),
      description: sanitizeText(serviceForm.description || ''),
      price: Math.round(serviceForm.price * 100) / 100, // Round to 2 decimal places
      duration: Math.round(serviceForm.duration) // Round to integer
    };

    if (editingService) {
      updateService({
        serviceId: editingService.service_id,
        data: formattedData
      });
    } else {
      createService(formattedData);
    }

    setShowAddServiceForm(false);
    setServiceForm({ name: '', description: '', price: 0, duration: 30 });
    setEditingService(null);
    setServiceFormErrors({});
  };

  const handleEditService = (service: Service) => {
    setServiceForm({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration
    });
    setEditingService(service);
    setExpandedService(service.service_id);
  };

  const handleDeleteService = (service: Service) => {
    if (!selectedDepartment) return;
    
    if (window.confirm(`Are you sure you want to delete service "${service.name}"?`)) {
      deleteService(service.service_id);
    }
  };

  const handleSaveEditedService = () => {
    if (!editingService || !selectedDepartment) return;
    
    // Validate form first
    if (!validateServiceForm()) {
      return;
    }
    
    // Format the data before comparing and updating
    const formattedData = {
      name: sanitizeText(serviceForm.name),
      description: sanitizeText(serviceForm.description || ''),
      price: Math.round(serviceForm.price * 100) / 100,
      duration: Math.round(serviceForm.duration)
    };
    
    // Prepare data for API call - only send fields that have changed
    const updateData: any = {};
    
    // Compare with original service data and only include changed fields
    if (formattedData.name !== editingService.name) {
      updateData.name = formattedData.name;
    }
    
    // Handle description - allow empty strings
    const originalDescription = editingService.description || '';
    if (formattedData.description !== originalDescription) {
      updateData.description = formattedData.description;
    }
    
    if (formattedData.price !== editingService.price) {
      updateData.price = formattedData.price;
    }
    
    if (formattedData.duration !== editingService.duration) {
      updateData.duration = formattedData.duration;
    }
    
    // Check if we have any changes to send
    if (Object.keys(updateData).length === 0) {
      console.log('No changes detected, skipping update');
      setEditingService(null);
      setExpandedService(null);
      setServiceFormErrors({});
      return;
    }
    
    console.log('Saving edited service:', {
      serviceId: editingService.service_id,
      updateData: updateData,
      departmentId: selectedDepartment.department_id,
      originalService: editingService,
      formattedData: formattedData
    });
    
    updateService({
      serviceId: editingService.service_id,
      data: updateData
    });
    
    setEditingService(null);
    setExpandedService(null);
    setServiceFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setExpandedService(null);
    setServiceFormErrors({});
  };

  const handleCancelAddService = () => {
    setShowAddServiceForm(false);
    setServiceForm({ name: '', description: '', price: 0, duration: 30 });
    setServiceFormErrors({});
  };

  // Table actions
  const tableActions = [
    {
      label: 'View',
      onClick: handleViewDepartment,
      className: 'text-blue-600 hover:text-blue-900',
      icon: <Eye className="w-4 h-4" />
    },
    {
      label: 'Edit',
      onClick: handleEditDepartment,
      className: 'text-gray-500 hover:text-gray-700',
      icon: <Edit className="w-4 h-4" />
    },
    {
      label: 'Delete',
      onClick: handleDeleteDepartment,
      className: 'text-red-500 hover:text-red-700',
      icon: <Trash2 className="w-4 h-4" />
    }
  ];

  if (isLoadingDepartments) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading departments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          onClick={handleAddNewDepartment}
          disabled={isCreatingDepartment}
        >
          {isCreatingDepartment ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add New Department
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <SearchFilterBar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search departments..."
        />

        <DataTable<Department>
          data={filteredDepartments}
          columns={departmentColumns}
          keyField="department_id"
          actions={tableActions}
        />
      </div>

      {/* Department Form Modal */}
      <ModalDialog
        isOpen={showDepartmentModal}
        onClose={() => {
          setShowDepartmentModal(false);
          setDepartmentForm({ name: '', description: '', emoji_icon: '🏥' });
          setEditingDepartment(null);
        }}
        title={editingDepartment ? 'Edit Department' : 'Add New Department'}
        size="md"
        footer={
          <div className="flex justify-end space-x-2">
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              onClick={() => {
                setShowDepartmentModal(false);
                setDepartmentForm({ name: '', description: '', emoji_icon: '🏥' });
                setEditingDepartment(null);
              }}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              onClick={handleSaveDepartment}
              disabled={isCreatingDepartment || isUpdatingDepartment}
            >
              {(isCreatingDepartment || isUpdatingDepartment) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {editingDepartment ? 'Update' : 'Create'} Department
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Department Name"
            id="name"
            value={departmentForm.name || ''}
            onChange={handleDepartmentFormChange}
            placeholder="Enter department name"
            required
          />

          <FormField
            label="Description"
            id="description"
            type="textarea"
            value={departmentForm.description || ''}
            onChange={handleDepartmentFormChange}
            placeholder="Enter department description"
            rows={3}
          />

          <FormField
            label="Emoji Icon"
            id="emoji_icon"
            value={departmentForm.emoji_icon || '🏥'}
            onChange={handleDepartmentFormChange}
            placeholder="🏥"
          />
        </div>
      </ModalDialog>

      {/* Department Detail Modal */}
      {selectedDepartment && (
        <ModalDialog
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`${selectedDepartment.name} Details`}
          size="lg"
          footer={
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
                <button
                  onClick={() => setActiveTab('doctors')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    activeTab === 'doctors' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Doctors
                </button>
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-1 text-sm rounded-md hover:bg-blue-700"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          }
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Department Overview */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="h-14 w-14 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl mr-4 text-2xl">
                    {selectedDepartment.emoji_icon || '🏥'}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{selectedDepartment.name}</h3>
                    <p className="text-gray-600">{selectedDepartment.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Doctors</p>
                        <p className="text-xl font-medium">{selectedDepartment.doctor_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Services</p>
                        <p className="text-xl font-medium">{selectedDepartment.service_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-sm font-medium">
                          {new Date(selectedDepartment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-sm font-medium">
                          {selectedDepartment.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {stats && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Detailed Statistics</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Total Appointments</p>
                          <p className="text-xl font-medium">{stats.total_appointments}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Completed Appointments</p>
                          <p className="text-xl font-medium">{stats.completed_appointments}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Services</h3>
                <button
                  onClick={handleAddNewService}
                  className="bg-green-600 text-white px-3 py-1 text-sm rounded-md hover:bg-green-700 flex items-center gap-2"
                  disabled={isCreatingService || showAddServiceForm}
                >
                  {isCreatingService ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add Service
                </button>
              </div>

              {/* Add Service Form (Expandable) */}
              {showAddServiceForm && (
                <div className="border rounded-lg bg-green-50 border-green-200">
                  <div className="p-4 space-y-4">
                    <h4 className="font-medium text-green-800">Add New Service</h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <FormField
                          label="Service Name"
                          id="name"
                          value={serviceForm.name || ''}
                          onChange={handleServiceFormChange}
                          placeholder="Enter service name"
                          required
                        />
                        {serviceFormErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{serviceFormErrors.name}</p>
                        )}
                      </div>
                      
                      <div>
                        <FormField
                          label="Description"
                          id="description"
                          type="textarea"
                          value={serviceForm.description || ''}
                          onChange={handleServiceFormChange}
                          placeholder="Enter service description (optional)"
                          rows={2}
                        />
                        {serviceFormErrors.description && (
                          <p className="mt-1 text-sm text-red-600">{serviceFormErrors.description}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FormField
                            label="Price ($)"
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            max="10000"
                            value={serviceForm.price.toString()}
                            onChange={handleServiceFormChange}
                            placeholder="0.00"
                            required
                          />
                          {serviceFormErrors.price && (
                            <p className="mt-1 text-sm text-red-600">{serviceFormErrors.price}</p>
                          )}
                        </div>
                        
                        <div>
                          <FormField
                            label="Duration (minutes)"
                            id="duration"
                            type="number"
                            min="5"
                            max="480"
                            value={serviceForm.duration.toString()}
                            onChange={handleServiceFormChange}
                            placeholder="30"
                            required
                          />
                          {serviceFormErrors.duration && (
                            <p className="mt-1 text-sm text-red-600">{serviceFormErrors.duration}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelAddService}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveService}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
                        disabled={isCreatingService}
                      >
                        {isCreatingService ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                        Add Service
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoadingServices ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading services...</span>
                </div>
              ) : services.length === 0 && !showAddServiceForm ? (
                <div className="text-center py-8 text-gray-500">
                  No services available for this department
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {services.map((service) => (
                    <div key={service.service_id} className="border rounded-lg">
                      {/* Service Header */}
                      <div className="flex justify-between items-center p-3">
                        <div className="flex-1">
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-gray-500">{service.description}</div>
                          )}
                          <div className="text-sm text-gray-600">
                            ${service.price} • {service.duration} minutes
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (expandedService === service.service_id) {
                                setExpandedService(null);
                                setEditingService(null);
                                setServiceFormErrors({});
                              } else {
                                setShowAddServiceForm(false); // Close add form
                                setExpandedService(service.service_id);
                                setServiceForm({
                                  name: service.name,
                                  description: service.description || '',
                                  price: service.price,
                                  duration: service.duration
                                });
                                setServiceFormErrors({});
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            {expandedService === service.service_id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteService(service)}
                            className="text-red-600 hover:text-red-800 p-1"
                            disabled={isDeletingService}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Edit Form */}
                      {expandedService === service.service_id && (
                        <div className="border-t bg-gray-50 p-4 space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <FormField
                                label="Service Name"
                                id="name"
                                value={serviceForm.name || ''}
                                onChange={handleServiceFormChange}
                                placeholder="Enter service name"
                                required
                              />
                              {serviceFormErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{serviceFormErrors.name}</p>
                              )}
                            </div>
                            
                            <div>
                              <FormField
                                label="Description"
                                id="description"
                                type="textarea"
                                value={serviceForm.description || ''}
                                onChange={handleServiceFormChange}
                                placeholder="Enter service description"
                                rows={2}
                              />
                              {serviceFormErrors.description && (
                                <p className="mt-1 text-sm text-red-600">{serviceFormErrors.description}</p>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormField
                                  label="Price ($)"
                                  id="price"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="10000"
                                  value={serviceForm.price.toString()}
                                  onChange={handleServiceFormChange}
                                  placeholder="0.00"
                                  required
                                />
                                {serviceFormErrors.price && (
                                  <p className="mt-1 text-sm text-red-600">{serviceFormErrors.price}</p>
                                )}
                              </div>
                              
                              <div>
                                <FormField
                                  label="Duration (minutes)"
                                  id="duration"
                                  type="number"
                                  min="5"
                                  max="480"
                                  value={serviceForm.duration.toString()}
                                  onChange={handleServiceFormChange}
                                  placeholder="30"
                                  required
                                />
                                {serviceFormErrors.duration && (
                                  <p className="mt-1 text-sm text-red-600">{serviceFormErrors.duration}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (validateServiceForm()) {
                                  setEditingService(service);
                                  handleSaveEditedService();
                                }
                              }}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                              disabled={isUpdatingService}
                            >
                              {isUpdatingService ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              {/* Current Doctors Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Current Doctors</h3>
                {isLoadingDoctors ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading doctors...</span>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No doctors assigned to this department
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doctor) => (
                      <div key={doctor.doctor_id} className="bg-white border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              Dr. {doctor.first_name} {doctor.last_name}
                            </h4>
                            {doctor.specialty && (
                              <p className="text-sm text-gray-600">{doctor.specialty}</p>
                            )}
                            <p className="text-sm text-gray-500">{doctor.email}</p>
                            {doctor.experience && (
                              <p className="text-sm text-gray-500">{doctor.experience} years experience</p>
                            )}
                            {doctor.consultation_fee && (
                              <p className="text-sm font-medium text-green-600">
                                ${doctor.consultation_fee} consultation fee
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove Dr. ${doctor.first_name} ${doctor.last_name} from this department?`)) {
                                console.log('Removing doctor:', doctor.doctor_id, 'from department:', selectedDepartment?.department_id);
                                removeDoctor({ doctorId: doctor.doctor_id });
                              }
                            }}
                            className="text-red-600 hover:text-red-800 p-2"
                            disabled={isRemovingDoctor}
                            title="Remove from department"
                          >
                            {isRemovingDoctor ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserMinus className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Doctors Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Available Doctors</h3>
                {isLoadingUnassigned ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading available doctors...</span>
                  </div>
                ) : unassignedDoctors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No unassigned doctors available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unassignedDoctors.map((doctor) => (
                      <div key={doctor.doctor_id} className="bg-gray-50 border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              Dr. {doctor.first_name} {doctor.last_name}
                            </h4>
                            {doctor.specialty && (
                              <p className="text-sm text-gray-600">{doctor.specialty}</p>
                            )}
                            <p className="text-sm text-gray-500">{doctor.email}</p>
                            {doctor.experience && (
                              <p className="text-sm text-gray-500">{doctor.experience} years experience</p>
                            )}
                            {doctor.consultation_fee && (
                              <p className="text-sm font-medium text-green-600">
                                ${doctor.consultation_fee} consultation fee
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to assign Dr. ${doctor.first_name} ${doctor.last_name} to this department?`)) {
                                assignDoctor({ doctorId: doctor.doctor_id });
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            disabled={isAssigningDoctor}
                            title="Assign to department"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </ModalDialog>
      )}
    </div>
  );
}