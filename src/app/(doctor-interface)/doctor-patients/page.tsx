'use client';

import React, { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { Input } from '@/components/ui/Input';

// Define interface for patient data
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  lastVisit?: string;
  nextAppointment?: string;
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
  notes?: string;
  bloodType?: string;
}

// Sample patient data
const initialPatients: Patient[] = [
  {
    id: 'P1001',
    name: 'John Wong',
    age: 45,
    gender: 'Male',
    phone: '+60 12-345-6789',
    email: 'john.wong@example.com',
    address: '123 Jalan Bukit Bintang, Kuala Lumpur',
    lastVisit: '2023-07-25',
    nextAppointment: '2023-08-10',
    medicalConditions: ['Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg'],
    bloodType: 'A+',
    notes: 'Patient is maintaining a healthy diet and exercise routine. Blood sugar levels are stabilizing.'
  },
  {
    id: 'P1002',
    name: 'Mary Chen',
    age: 35,
    gender: 'Female',
    phone: '+60 12-987-6543',
    email: 'mary.chen@example.com',
    address: '456 Jalan Ampang, Kuala Lumpur',
    lastVisit: '2023-07-15',
    nextAppointment: '2023-08-15',
    medicalConditions: ['Asthma'],
    allergies: ['Peanuts', 'Dust mites'],
    medications: ['Albuterol inhaler'],
    bloodType: 'O+',
    notes: 'Patient experiences occasional asthma attacks, especially during haze periods.'
  },
  {
    id: 'P1003',
    name: 'David Lee',
    age: 62,
    gender: 'Male',
    phone: '+60 16-555-7890',
    email: 'david.lee@example.com',
    address: '789 Jalan Tun Razak, Kuala Lumpur',
    lastVisit: '2023-07-20',
    nextAppointment: '2023-08-20',
    medicalConditions: ['Coronary Artery Disease', 'Hypercholesterolemia'],
    allergies: ['Sulfa drugs'],
    medications: ['Atorvastatin 20mg', 'Aspirin 81mg', 'Metoprolol 25mg'],
    bloodType: 'B+',
    notes: 'Patient needs to monitor cholesterol levels closely. Has been advised to follow a low-fat diet.'
  },
  {
    id: 'P1004',
    name: 'Sarah Tan',
    age: 28,
    gender: 'Female',
    phone: '+60 19-876-5432',
    email: 'sarah.tan@example.com',
    address: '101 Jalan Sultan Ismail, Kuala Lumpur',
    lastVisit: '2023-07-30',
    nextAppointment: '2023-08-30',
    medicalConditions: ['Migraine'],
    allergies: [],
    medications: ['Sumatriptan 50mg as needed'],
    bloodType: 'A-',
    notes: 'Patient reports migraines typically triggered by stress and lack of sleep.'
  },
  {
    id: 'P1005',
    name: 'James Lim',
    age: 55,
    gender: 'Male',
    phone: '+60 13-222-3333',
    email: 'james.lim@example.com',
    address: '222 Jalan Imbi, Kuala Lumpur',
    lastVisit: '2023-08-02',
    medicalConditions: ['Arthritis', 'Gout'],
    allergies: ['Shellfish'],
    medications: ['Naproxen 500mg', 'Allopurinol 300mg'],
    bloodType: 'AB+',
    notes: 'Patient experiences joint pain during weather changes. Advised to reduce purine-rich foods.'
  },
];

export default function DoctorPatients() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'appointments' | 'notes'>('info');
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);
    
    return matchesSearch;
  });

  // Handle patient selection
  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('info');
  };

  // Handle adding a new note
  const handleAddNote = () => {
    if (selectedPatient && newNote.trim()) {
      const updatedPatients = patients.map(patient => {
        if (patient.id === selectedPatient.id) {
          const updatedNotes = patient.notes 
            ? `${patient.notes}\n\n${new Date().toLocaleDateString()}: ${newNote}` 
            : `${new Date().toLocaleDateString()}: ${newNote}`;
          
          return { ...patient, notes: updatedNotes };
        }
        return patient;
      });
      
      setPatients(updatedPatients);
      setSelectedPatient({
        ...selectedPatient, 
        notes: selectedPatient.notes 
          ? `${selectedPatient.notes}\n\n${new Date().toLocaleDateString()}: ${newNote}` 
          : `${new Date().toLocaleDateString()}: ${newNote}`
      });
      
      setNewNote('');
      setShowAddNoteForm(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Patients</h1>

      {/* Enhanced Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search patients by name, ID, email, or phone"
            className="pl-10 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Patient List</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedPatient?.id === patient.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handlePatientClick(patient)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-500">{patient.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{patient.age} years</p>
                        <p className="text-xs text-gray-500">{patient.gender}</p>
                      </div>
                    </div>
                    {patient.nextAppointment && (
                      <div className="mt-2">
                        <p className="text-xs text-blue-600">
                          Next appointment: {new Date(patient.nextAppointment).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">No patients found</div>
              )}
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="bg-white rounded-xl shadow-sm">
              {/* Patient Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedPatient.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedPatient.id} • {selectedPatient.age} years • {selectedPatient.gender}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Schedule Appointment
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'info'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('info')}
                  >
                    Personal Info
                  </button>
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'medical'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('medical')}
                  >
                    Medical History
                  </button>
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'appointments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('appointments')}
                  >
                    Appointments
                  </button>
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'notes'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('notes')}
                  >
                    Notes
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Personal Info Tab */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm">{selectedPatient.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm">{selectedPatient.email}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500">Address</p>
                          <p className="text-sm">{selectedPatient.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Appointment Information</h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Last Visit</p>
                          <p className="text-sm">
                            {selectedPatient.lastVisit 
                              ? new Date(selectedPatient.lastVisit).toLocaleDateString() 
                              : 'No record'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Next Appointment</p>
                          <p className="text-sm">
                            {selectedPatient.nextAppointment 
                              ? new Date(selectedPatient.nextAppointment).toLocaleDateString() 
                              : 'None scheduled'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medical History Tab */}
                {activeTab === 'medical' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Medical Conditions</h3>
                      <div className="mt-2">
                        {selectedPatient.medicalConditions && selectedPatient.medicalConditions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.medicalConditions.map((condition, index) => (
                              <span key={index} className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                                {condition}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No medical conditions recorded</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Allergies</h3>
                      <div className="mt-2">
                        {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.allergies.map((allergy, index) => (
                              <span key={index} className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                                {allergy}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No allergies recorded</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Current Medications</h3>
                      <div className="mt-2">
                        {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {selectedPatient.medications.map((medication, index) => (
                              <li key={index} className="text-sm">
                                {medication}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No medications recorded</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                      <p className="mt-2 text-sm">
                        {selectedPatient.bloodType || 'Not recorded'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Appointments Tab */}
                {activeTab === 'appointments' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-gray-900">Appointment History</h3>
                      <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Schedule New
                      </button>
                    </div>
                    
                    {/* This would be populated with real appointment data */}
                    <div className="text-sm text-gray-500 text-center py-8">
                      Appointment history will be displayed here.
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-gray-900">Patient Notes</h3>
                      <button 
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={() => setShowAddNoteForm(true)}
                      >
                        Add Note
                      </button>
                    </div>
                    
                    {showAddNoteForm && (
                      <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Add New Note</h4>
                        <textarea
                          rows={4}
                          className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Enter your notes about the patient here..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                            onClick={() => {
                              setShowAddNoteForm(false);
                              setNewNote('');
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={handleAddNote}
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedPatient.notes ? (
                        <pre className="text-sm whitespace-pre-wrap font-sans">{selectedPatient.notes}</pre>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No notes recorded for this patient</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center justify-center h-full">
              <div className="text-gray-400 mb-4">
                <Eye className="h-12 w-12" />
              </div>
              <p className="text-gray-500 text-center">
                Select a patient from the list to view their details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 