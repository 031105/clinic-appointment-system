import React, { useState } from 'react';

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

export default function PatientManagement() {
  const [patients, setPatients] = useState(tempPatients);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
    setActiveTab('details');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Register New Patient
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{patient.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.email}</div>
                    <div className="text-sm text-gray-500">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(patient.lastVisit).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleViewPatient(patient)}
                    >
                      View
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No patients found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {showDetailModal && selectedPatient && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Patient Information - {selectedPatient.name}
                    </h3>
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mt-4">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          className={`${
                            activeTab === 'details'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                          onClick={() => setActiveTab('details')}
                        >
                          Personal Details
                        </button>
                        <button
                          className={`${
                            activeTab === 'medical'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                          onClick={() => setActiveTab('medical')}
                        >
                          Medical History
                        </button>
                        <button
                          className={`${
                            activeTab === 'appointments'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                          onClick={() => setActiveTab('appointments')}
                        >
                          Appointments
                        </button>
                      </nav>
                    </div>
                    
                    {/* Tab content */}
                    <div className="mt-4">
                      {/* Personal Details Tab */}
                      {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="text-base font-medium">{selectedPatient.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="text-base font-medium">
                              {new Date(selectedPatient.dateOfBirth).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="text-base font-medium">
                              {selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-base font-medium">{selectedPatient.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-base font-medium">{selectedPatient.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="text-base font-medium">{selectedPatient.address}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Registration Date</p>
                            <p className="text-base font-medium">
                              {new Date(selectedPatient.registrationDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedPatient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedPatient.status.charAt(0).toUpperCase() + selectedPatient.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Medical History Tab */}
                      {activeTab === 'medical' && (
                        <div>
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Allergies</h4>
                            {selectedPatient.allergies.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedPatient.allergies.map((allergy, index) => (
                                  <span key={index} className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {allergy}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">No known allergies</p>
                            )}
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-2">Medical Records</h4>
                          {selectedPatient.medicalRecords.length > 0 ? (
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                              <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Diagnosis</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Doctor</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                  {selectedPatient.medicalRecords.map((record) => (
                                    <tr key={record.id}>
                                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                        {new Date(record.date).toLocaleDateString()}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.diagnosis}</td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.doctor}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500">No medical records found</p>
                          )}
                        </div>
                      )}
                      
                      {/* Appointments Tab */}
                      {activeTab === 'appointments' && (
                        <div>
                          <p className="text-center text-gray-500 py-4">Appointment history would be displayed here.</p>
                        </div>
                      )}
                    </div>
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
                  Edit Patient
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
export const patientApi = {
  // Get all patients
  getPatients: async (filters = {}) => {
    // This will be replaced with actual API call
    // Example: return await fetch('/api/patients?' + new URLSearchParams(filters))
    return tempPatients; // Currently returns mock data
  },
  
  // Get a single patient
  getPatient: async (id) => {
    // Example: return await fetch(`/api/patients/${id}`)
    return tempPatients.find(patient => patient.id === id);
  },
  
  // Create new patient
  createPatient: async (patientData) => {
    // Example: 
    // return await fetch('/api/patients', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(patientData)
    // })
    console.log('Creating patient:', patientData);
    return { success: true, id: Date.now().toString() }; // Mock response
  },
  
  // Update patient
  updatePatient: async (id, patientData) => {
    // Example:
    // return await fetch(`/api/patients/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(patientData)
    // })
    console.log('Updating patient:', id, patientData);
    return { success: true }; // Mock response
  },
  
  // Get patient medical records
  getMedicalRecords: async (patientId) => {
    // Example: return await fetch(`/api/patients/${patientId}/medical-records`)
    const patient = tempPatients.find(p => p.id === patientId);
    return patient ? patient.medicalRecords : [];
  },
  
  // Get patient appointments
  getPatientAppointments: async (patientId) => {
    // Example: return await fetch(`/api/patients/${patientId}/appointments`)
    console.log('Getting appointments for patient:', patientId);
    return []; // Mock empty response
  }
};