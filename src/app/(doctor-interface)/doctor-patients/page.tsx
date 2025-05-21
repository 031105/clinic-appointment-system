'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useDoctorPatients } from '@/hooks/doctor/useDoctorPatients';

export default function DoctorPatients() {
  const {
    patients,
    selectedPatient,
    fetchPatients,
    selectPatient,
    addNote,
    scheduleAppointment,
    loading,
    error,
  } = useDoctorPatients();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'appointments' | 'notes'>('info');
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  // 搜索过滤
  const filteredPatients = patients.filter(patient => {
    const name = (patient.firstName + ' ' + patient.lastName).toLowerCase();
    return (
      name.includes(searchQuery.toLowerCase()) ||
      patient.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (patient.phone && patient.phone.includes(searchQuery))
    );
  });

  // 选择患者
  const handlePatientClick = (patient: any) => {
    selectPatient(patient.id);
    setActiveTab('info');
    setShowAddNoteForm(false);
    setNewNote('');
  };

  // 添加笔记
  const handleAddNote = async () => {
    if (selectedPatient && newNote.trim()) {
      await addNote(selectedPatient.id, newNote);
      setNewNote('');
      setShowAddNoteForm(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Patients</h1>

      {/* 搜索栏 */}
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
        {/* 患者列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Patient List</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
              ) : error ? (
                <div className="p-4 text-center text-sm text-red-500">{error}</div>
              ) : filteredPatients.length > 0 ? (
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
                        <p className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-gray-500">{patient.id}</p>
                      </div>
                      <div className="text-right">
                        {/* 年龄和性别可根据 date_of_birth 计算 */}
                        <p className="text-xs text-gray-500">{patient.gender}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">No patients found</div>
              )}
            </div>
          </div>
        </div>

        {/* 患者详情 */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="bg-white rounded-xl shadow-sm">
              {/* 头部 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedPatient.id} {selectedPatient.gender ? `• ${selectedPatient.gender}` : ''}
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
                <nav className="flex space-x-8" aria-label="Tabs">
                  <button
                    className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('info')}
                  >
                    Personal Info
                  </button>
                  <button
                    className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'medical' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('medical')}
                  >
                    Medical History
                  </button>
                  <button
                    className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'appointments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('appointments')}
                  >
                    Appointments
                  </button>
                  <button
                    className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'notes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
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
                  </div>
                )}

                {/* Medical History Tab */}
                {activeTab === 'medical' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Allergies</h3>
                      <div className="mt-2">
                        {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.allergies.map((allergy: any, index: number) => (
                              <span key={index} className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                                {allergy.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No allergies recorded</p>
                        )}
                      </div>
                    </div>
                    {/* 可扩展：病历、慢性病等 */}
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
                    <div className="text-sm text-gray-500 text-center py-8">
                      {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedPatient.appointments.map((appt: any) => (
                            <li key={appt.id} className="flex justify-between">
                              <span>{appt.appointment_date} {appt.appointment_time}</span>
                              <span>{appt.status}</span>
                              <span>{appt.type}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        'Appointment history will be displayed here.'
                      )}
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
                      <div className="mb-4">
                        <textarea
                          className="w-full border rounded p-2 text-sm"
                          rows={3}
                          value={newNote}
                          onChange={e => setNewNote(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                            onClick={handleAddNote}
                          >
                            Save Note
                          </button>
                          <button
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs"
                            onClick={() => setShowAddNoteForm(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <div>
                      {selectedPatient.medicalRecords && selectedPatient.medicalRecords.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedPatient.medicalRecords.map((record: any) => (
                            <li key={record.id} className="border-b pb-2">
                              <span className="block text-xs text-gray-500">{record.created_at}</span>
                              <span className="block text-sm">{record.description}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No notes recorded</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm text-gray-500 text-center">
              Select a patient to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 