'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useDoctorPatients, PatientWithFullInfo } from '@/hooks/doctor/useDoctorPatients';
import { useRouter } from 'next/navigation';

// Helper function to format dates
interface FormattedDate {
  fullDate: string;
  time: string;
}

const formatDate = (dateString: string | undefined | null): FormattedDate => {
  console.log('Formatting date string:', dateString); // Debug log
  if (!dateString) {
    console.log('Date string is null or undefined'); // Debug log
    return { fullDate: 'Invalid Date', time: 'Invalid Time' };
  }

  try {
    const date = new Date(dateString);
    console.log('Parsed date object:', date); // Debug log
    if (isNaN(date.getTime())) {
      console.log('Invalid date object'); // Debug log
      return { fullDate: 'Invalid Date', time: 'Invalid Time' };
    }

    // Format the date using Intl.DateTimeFormat for consistent formatting
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Singapore',
    });

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Singapore',
    });

    const formattedDate = dateFormatter.format(date);
    const formattedTime = timeFormatter.format(date);

    return {
      fullDate: `${formattedDate} at ${formattedTime}`,
      time: formattedTime
    };
  } catch (error) {
    console.error('Error formatting date:', error);
    return { fullDate: 'Invalid Date', time: 'Invalid Time' };
  }
};

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
  const [activeTab, setActiveTab] = useState<'info' | 'appointments'>('info');
  const router = useRouter();

  useEffect(() => {
    fetchPatients();
  }, []);

  // Debug log for appointments data
  useEffect(() => {
    if (selectedPatient && selectedPatient.appointments) {
      console.log('Selected patient appointments:', selectedPatient.appointments);
    }
  }, [selectedPatient]);

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
  const handlePatientClick = (patient: PatientWithFullInfo) => {
    selectPatient(patient.id);
    setActiveTab('info');
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
                  <div className="w-full">
                    <h2 className="text-xl font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedPatient.id} {selectedPatient.gender ? `• ${selectedPatient.gender}` : ''}
                    </p>
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
                    className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'appointments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('appointments')}
                  >
                    Appointments
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Personal Info Tab */}
                {activeTab === 'info' && (
                  <div className="space-y-8 max-w-5xl mx-auto px-4">
                    <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center border-b pb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                          <p className="text-sm font-medium text-gray-600 mb-2">Phone</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedPatient.phone}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                          <p className="text-sm font-medium text-gray-600 mb-2">Email</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedPatient.email}</p>
                        </div>
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                          <p className="text-sm font-medium text-gray-600 mb-2">Address</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedPatient.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Medical History Section */}
                    <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center border-b pb-4">Medical History</h3>
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-lg font-medium text-gray-700 mb-4">Allergies</h4>
                          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                              <div className="flex flex-wrap gap-3">
                                {selectedPatient.allergies.map((allergy: any, index: number) => (
                                  <span key={index} className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium border border-yellow-200">
                                    {allergy.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">No allergies recorded</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium text-gray-700 mb-4">Medical Records</h4>
                          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            {selectedPatient.medicalRecords && selectedPatient.medicalRecords.length > 0 ? (
                              <div className="space-y-6">
                                {selectedPatient.medicalRecords.map((record: any) => (
                                  <div key={record.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-3">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {new Date(record.created_at).toLocaleDateString()}
                                      </span>
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{record.record_type}</span>
                                    </div>
                                    <p className="text-gray-700">{record.description}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">No medical records available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointments Tab */}
                {activeTab === 'appointments' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-gray-900">Appointment History</h3>
                      <button 
                        onClick={() => router.push('/doctor-appointments/new')}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Schedule New
                      </button>
                    </div>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {selectedPatient.appointments.map((appt: any) => {
                            console.log('Processing appointment:', appt); // Debug log
                            const formattedDate = formatDate(appt.appointmentDateTime);
                            const formattedEndDate = formatDate(appt.endDateTime);
                            console.log('Formatted date:', formattedDate); // Debug log
                            return (
                              <div 
                                key={appt.id}
                                onClick={() => router.push(`/doctor-appointments?appointmentId=${appt.id}`)}
                                className="p-4 hover:bg-gray-50 cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{formattedDate.fullDate}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-sm text-gray-500">
                                        {formattedDate.time} - {formattedEndDate.time}
                                      </p>
                                      <span className="text-sm text-gray-600 capitalize px-2 py-0.5 bg-gray-100 rounded">
                                        {appt.type?.replace('_', ' ')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                      ${appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                      appt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'}`}
                                    >
                                      {appt.status}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-8">
                          No appointment history available
                        </div>
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