'use client';

import React, { useState } from 'react';
import { 
  SearchFilterBar, 
  DataTable, 
  StatusBadge, 
  ModalDialog 
} from '@/components/admin';

// Temporary patient data
const tempPatients = [
  {
    id: '21',
    name: 'Michael Chan',
    email: 'patient1@email.com',
    phone: '+6012345698',
    dateOfBirth: '1990-04-10',
    gender: 'male',
    address: '202 Patient Lane, Patient City',
    registrationDate: '2023-01-15',
    lastVisit: '2025-06-16',
    status: 'active',
    medicalRecords: [
      { id: 1, date: '2025-06-16', diagnosis: 'Mild hypertension', doctor: 'Dr. John Smith' },
      { id: 2, date: '2024-12-10', diagnosis: 'Common cold', doctor: 'Dr. Sarah Johnson' }
    ],
    allergies: ['Penicillin']
  },
  {
    id: '22',
    name: 'Jessica Tan',
    email: 'patient2@email.com',
    phone: '+6012345699',
    dateOfBirth: '1988-09-22',
    gender: 'female',
    address: '303 Health Avenue, Patient City',
    registrationDate: '2023-02-20',
    lastVisit: '2025-06-18',
    status: 'active',
    medicalRecords: [
      { id: 3, date: '2025-06-18', diagnosis: 'Stable coronary artery disease', doctor: 'Dr. John Smith' },
      { id: 4, date: '2024-11-05', diagnosis: 'Seasonal allergies', doctor: 'Dr. Emily Wong' }
    ],
    allergies: ['Sulfa drugs', 'Peanuts']
  },
  {
    id: '23',
    name: 'David Wong',
    email: 'patient3@email.com',
    phone: '+6012345700',
    dateOfBirth: '1979-12-30',
    gender: 'male',
    address: '404 Wellness Street, Patient City',
    registrationDate: '2023-03-10',
    lastVisit: '2025-06-18',
    status: 'active',
    medicalRecords: [
      { id: 5, date: '2025-06-18', diagnosis: 'Acute otitis media', doctor: 'Dr. Natalie Clarke' },
      { id: 6, date: '2024-09-22', diagnosis: 'Lower back pain', doctor: 'Dr. William Tan' }
    ],
    allergies: []
  },
  {
    id: '24',
    name: 'Emily Lim',
    email: 'patient4@email.com',
    phone: '+6012345701',
    dateOfBirth: '1995-01-18',
    gender: 'female',
    address: '505 Care Road, Patient City',
    registrationDate: '2023-04-05',
    lastVisit: '2025-06-19',
    status: 'active',
    medicalRecords: [
      { id: 7, date: '2025-06-19', diagnosis: 'Atrial fibrillation', doctor: 'Dr. James Wilson' },
      { id: 8, date: '2025-06-17', diagnosis: 'Moderate acne vulgaris', doctor: 'Dr. Emily Wong' }
    ],
    allergies: ['Latex']
  },
  {
    id: '25',
    name: 'Jason Ng',
    email: 'patient5@email.com',
    phone: '+6012345702',
    dateOfBirth: '1992-05-28',
    gender: 'male',
    address: '606 Therapy Lane, Patient City',
    registrationDate: '2023-05-12',
    lastVisit: '2025-06-20',
    status: 'active',
    medicalRecords: [
      { id: 9, date: '2025-06-20', diagnosis: 'Congestive heart failure', doctor: 'Dr. Kimberly Novak' },
      { id: 10, date: '2025-06-18', diagnosis: 'Seborrheic dermatitis', doctor: 'Dr. Lisa Mueller' }
    ],
    allergies: ['Ibuprofen']
  }
];

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
        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
        <div className="text-sm text-gray-500">{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
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
        {new Date(patient.lastVisit).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}
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

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  registrationDate: string;
  lastVisit: string;
  status: string;
  medicalRecords: Array<{
    id: number;
    date: string;
    diagnosis: string;
    doctor: string;
  }>;
  allergies: string[];
}

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>(tempPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter patients based on search query and status
  const filteredPatients = patients.filter(patient => {
    // Status filter
    if (filterStatus !== 'all' && patient.status !== filterStatus) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.includes(query) ||
        patient.id.includes(query)
      );
    }
    
    return true;
  });

  // Handle patient view
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
    setActiveTab('details');
  };

  // Table actions
  const tableActions = [
    {
      label: 'View',
      onClick: handleViewPatient,
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Edit',
      onClick: (patient: Patient) => {
        // Implement edit functionality
        console.log('Edit patient:', patient);
      },
      className: 'text-gray-500 hover:text-gray-700'
    }
  ];

  // Function to render the patient detail modal content
  const renderPatientDetail = () => {
    if (!selectedPatient) return null;

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
                  <p className="text-sm font-medium">{selectedPatient.name}</p>
                  
                  <div className="grid grid-cols-2 mt-3">
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="text-sm font-medium capitalize">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="text-sm font-medium">{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <div className="mt-2 border rounded-md p-3">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium">{selectedPatient.email}</p>
                  
                  <p className="text-sm text-gray-500 mt-3">Phone</p>
                  <p className="text-sm font-medium">{selectedPatient.phone}</p>
                  
                  <p className="text-sm text-gray-500 mt-3">Address</p>
                  <p className="text-sm font-medium">{selectedPatient.address}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Patient History</h3>
              <div className="mt-2 border rounded-md p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Registration Date</p>
                    <p className="text-sm font-medium">{new Date(selectedPatient.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Visit</p>
                    <p className="text-sm font-medium">{new Date(selectedPatient.lastVisit).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Allergies</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPatient.allergies.length > 0 ? (
                      selectedPatient.allergies.map((allergy, index) => (
                        <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
                          {allergy}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No known allergies</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Medical Records */}
        {activeTab === 'records' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Medical Records</h3>
              <button className="text-xs bg-blue-50 text-blue-600 py-1 px-2 rounded">
                Add New Record
              </button>
            </div>
            
            {selectedPatient.medicalRecords.length > 0 ? (
              <div className="space-y-3">
                {selectedPatient.medicalRecords.map((record) => (
                  <div key={record.id} className="border rounded-md p-3">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{new Date(record.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">{record.doctor}</p>
                    </div>
                    <p className="text-sm mt-2">{record.diagnosis}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No medical records available</p>
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Register New Patient
        </button>
      </div>

      {/* Using SearchFilterBar component */}
      <SearchFilterBar
        searchPlaceholder="Search by name, email, phone..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterOptions={statusFilterOptions}
        filterValue={filterStatus}
        onFilterChange={setFilterStatus}
        className="mb-6"
      />

      {/* Using DataTable component */}
      <DataTable
        data={filteredPatients}
        columns={patientColumns}
        keyField="id"
        actions={tableActions}
        emptyMessage="No patients found matching your search criteria."
      />

      {/* Using ModalDialog component for patient details */}
      <ModalDialog
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedPatient ? `Patient: ${selectedPatient.name}` : 'Patient Details'}
        footer={modalFooter}
        size="lg"
      >
        {renderPatientDetail()}
      </ModalDialog>
    </div>
  );
}