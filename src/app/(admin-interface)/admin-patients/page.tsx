'use client';

import React, { useState, useEffect } from 'react';
import { 
  SearchFilterBar, 
  DataTable, 
  StatusBadge, 
  ModalDialog 
} from '@/components/admin';
import { PatientRegistrationModal } from '@/components/admin/PatientRegistrationModal';
import { useAdminPatients, usePatientDetails } from '@/hooks/admin/useAdminPatients';
import { Patient, MedicalRecord } from '@/lib/api/admin-patients-client';

// Define table columns
const patientColumns = [
  { 
    header: 'Patient ID', 
    accessor: (patient: Patient) => <div className="text-sm font-medium text-gray-900">#{patient.id}</div> 
  },
  { 
    header: 'Name', 
    accessor: (patient: Patient) => (
      <div>
        <div className="text-sm font-medium text-gray-900">{patient.first_name} {patient.last_name}</div>
        <div className="text-sm text-gray-500">{new Date(patient.date_of_birth).toLocaleDateString()}</div>
      </div>
    )
  },
  { 
    header: 'Contact', 
    accessor: (patient: Patient) => (
      <div>
        <div className="text-sm text-gray-900">{patient.email}</div>
        <div className="text-sm text-gray-500">{patient.phone}</div>
      </div>
    )
  },
  { 
    header: 'Last Visit', 
    accessor: (patient: Patient) => (
      <div className="text-sm text-gray-900">
        {patient.last_visit ? 
          new Date(patient.last_visit).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : 
          'No visits'
        }
      </div>
    )
  },
  { 
    header: 'Status', 
    accessor: (patient: Patient) => <StatusBadge status={patient.status as any} />
  },
];

// Filter options
const statusFilterOptions = [
  { id: 'all', label: 'All Statuses' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

export default function PatientManagement() {
  const {
    patients,
    loading,
    error,
    pagination,
    fetchPatients,
    searchPatients,
    filterPatients,
    createPatient,
    changePage,
    changeLimit
  } = useAdminPatients();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const {
    patient: selectedPatient,
    medicalRecords,
    loading: detailsLoading,
    medicalRecordsLoading
  } = usePatientDetails(selectedPatientId || undefined);

  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    searchPatients(query);
  };

  // Handle filter change
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    filterPatients(status as 'all' | 'active' | 'inactive');
  };

  // Handle patient view
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setShowDetailModal(true);
    setActiveTab('details');
  };

  // Handle patient registration
  const handlePatientRegistration = async (data: any) => {
    await createPatient(data);
    setShowRegistrationModal(false);
  };

  // Table actions (removed Edit button as requested)
  const tableActions = [
    {
      label: 'View',
      onClick: handleViewPatient,
      className: 'text-blue-600 hover:text-blue-900'
    }
  ];

  // Function to render the patient detail modal content
  const renderPatientDetail = () => {
    if (!selectedPatient) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Patient Info */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Basic Information</h3>
                <div className="mt-2 border rounded-md p-3">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-sm font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                  
                  <div className="grid grid-cols-2 mt-3">
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="text-sm font-medium capitalize">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="text-sm font-medium">{new Date(selectedPatient.date_of_birth).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {selectedPatient.blood_type && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <p className="text-sm font-medium">{selectedPatient.blood_type}</p>
                    </div>
                  )}

                  {(selectedPatient.height || selectedPatient.weight) && (
                    <div className="grid grid-cols-2 mt-3">
                      {selectedPatient.height && (
                        <div>
                          <p className="text-sm text-gray-500">Height</p>
                          <p className="text-sm font-medium">{selectedPatient.height} cm</p>
                        </div>
                      )}
                      {selectedPatient.weight && (
                        <div>
                          <p className="text-sm text-gray-500">Weight</p>
                          <p className="text-sm font-medium">{selectedPatient.weight} kg</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <div className="mt-2 border rounded-md p-3">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium">{selectedPatient.email}</p>
                  
                  <p className="text-sm text-gray-500 mt-3">Phone</p>
                  <p className="text-sm font-medium">{selectedPatient.phone}</p>
                  
                  {selectedPatient.address && (
                    <>
                      <p className="text-sm text-gray-500 mt-3">Address</p>
                      <p className="text-sm font-medium">{selectedPatient.address}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Patient History</h3>
              <div className="mt-2 border rounded-md p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Registration Date</p>
                    <p className="text-sm font-medium">{new Date(selectedPatient.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Visit</p>
                    <p className="text-sm font-medium">
                      {selectedPatient.last_visit ? 
                        new Date(selectedPatient.last_visit).toLocaleDateString() : 
                        'No visits yet'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Allergies</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      selectedPatient.allergies.map((allergy, index) => (
                        <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
                          {allergy.name} ({allergy.severity})
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No known allergies</p>
                    )}
                  </div>
                </div>

                {selectedPatient.stats && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Statistics</p>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-lg font-semibold text-blue-600">{selectedPatient.stats.total_appointments}</p>
                        <p className="text-xs text-blue-800">Total Appointments</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-lg font-semibold text-green-600">{selectedPatient.stats.completed_appointments}</p>
                        <p className="text-xs text-green-800">Completed</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <p className="text-lg font-semibold text-purple-600">{selectedPatient.stats.medical_records_count}</p>
                        <p className="text-xs text-purple-800">Medical Records</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Medical Records */}
        {activeTab === 'records' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Medical Records</h3>
            </div>
            
            {medicalRecordsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : medicalRecords.length > 0 ? (
              <div className="space-y-3">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{new Date(record.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">{record.doctor_name}</p>
                        </div>
                        <p className="text-sm mt-2 font-medium text-gray-900">{record.diagnosis}</p>
                        {record.prescription && record.prescription.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Prescription:</p>
                            <ul className="text-sm text-gray-700 list-disc list-inside">
                              {record.prescription.map((med, index) => (
                                <li key={index}>{med}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {record.notes && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Notes:</p>
                            <p className="text-sm text-gray-700">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No medical records available</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Modal footer with tabs
  const modalFooter = (
    <div className="flex justify-between items-center">
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeTab === 'details' 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Patient Details
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeTab === 'records' 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Medical Records
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

  if (loading && patients.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => setShowRegistrationModal(true)}
        >
          Register New Patient
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Search and Filter Bar */}
      <SearchFilterBar
        searchPlaceholder="Search by name, email, phone, patient ID..."
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        filterOptions={statusFilterOptions}
        filterValue={filterStatus}
        onFilterChange={handleFilterChange}
        className="mb-6"
      />

      {/* Data Table */}
      <DataTable
        data={patients}
        columns={patientColumns}
        keyField="id"
        actions={tableActions}
        emptyMessage="No patients found matching your search criteria."
        isLoading={loading}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} patients
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      <ModalDialog
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPatientId(null);
        }}
        title={selectedPatient ? `Patient: ${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Patient Details'}
        footer={modalFooter}
        size="lg"
      >
        {renderPatientDetail()}
      </ModalDialog>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={handlePatientRegistration}
        loading={loading}
      />
    </div>
  );
}