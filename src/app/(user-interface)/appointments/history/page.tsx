'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { Rating } from '@/components/ui/Rating';
import { useAppointments, useMedicalRecords, ExtendedAppointment } from '@/hooks';
import { DoctorAvatar } from '@/components/ui/DoctorAvatar';
import type { Doctor, MedicalRecord } from '@/lib/api/patient-client';
import patientClient from '@/lib/api/patient-client';

// 在当前文件中扩展Doctor接口，增加可能需要的字段
interface FullDoctorInfo extends Omit<Doctor, 'consultationFee'> {
  consultationFee?: number;
  name?: string;
  profileImage?: string;
}

// 扩展MedicalRecord接口
interface ExtendedMedicalRecord extends MedicalRecord {
  recordType?: string;
}

export default function AppointmentHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id') ? parseInt(searchParams.get('id')!) : null;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<ExtendedAppointment | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  // Use our custom hooks for data fetching
  const { 
    appointments, 
    loading: appointmentsLoading, 
    error: appointmentsError 
  } = useAppointments();
  
  const { 
    medicalRecords, 
    loading: medicalRecordsLoading,
    error: medicalRecordsError
  } = useMedicalRecords();
  
  // 如果URL中有appointmentId，自动选择该appointment
  useEffect(() => {
    if (appointmentId && appointments.length > 0) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
      }
    }
  }, [appointmentId, appointments]);
  
  // 从URL获取过滤参数
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter) {
      if (urlFilter === 'upcoming' || urlFilter === 'completed') {
        setFilter(urlFilter);
      } else if (urlFilter === 'cancelled') {
        setFilter('cancelled');
      } else {
        setFilter('all');
      }
    }
  }, [searchParams]);
  
  // Combine loading states
  const loading = appointmentsLoading || medicalRecordsLoading;
  const error = appointmentsError || medicalRecordsError;
  
  // Filter appointments based on selected date and filter
  const filteredAppointments = useMemo(() => {
    return appointments?.filter(appointment => {
      // 将状态转换为小写以便比较
      const status = appointment.status.toLowerCase();
      
      if (filter === 'all') return true;
      
      if (filter === 'upcoming') {
        // upcoming包括所有非completed, cancelled和no_show的预约
        return !['completed', 'cancelled', 'no_show'].includes(status);
      }
      
      if (filter === 'completed') return status === 'completed';
      if (filter === 'cancelled') return status === 'cancelled';
      
      return true;
    });
  }, [appointments, filter]);
  
  // Helper function to get medical record for an appointment
  const getMedicalRecordForAppointment = (appointmentId: number): ExtendedMedicalRecord | undefined => {
    return medicalRecords.find(record => record.appointmentId === appointmentId) as ExtendedMedicalRecord | undefined;
  };

  // Cancel appointment handler
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await patientClient.cancelAppointment(selectedAppointment.id, cancelReason);
      setActionSuccess('Appointment cancelled successfully.');
      setShowCancelModal(false);
      setCancelReason('');
      window.location.reload();
    } catch (err: any) {
      setActionError('Failed to cancel appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reschedule appointment handler
  const handleRescheduleAppointment = () => {
    if (!selectedAppointment) return;
    // Pass appointmentId and doctorId for pre-filling
    router.push(`/appointments/book?appointmentId=${selectedAppointment.id}&doctorId=${selectedAppointment.doctorId}`);
  };

  // If data is loading, show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointment history...</p>
          {error && <p className="mt-2 text-amber-600">Warning: {error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Similar to image 2 */}
      <div className="w-72 bg-white border-r border-gray-200 p-5 sticky top-0 h-screen">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-5">Appointment History</h2>
          
          {/* Filters */}
          <div className="space-y-2 mb-6">
            <button
              onClick={() => {
                setFilter('all');
                setSelectedAppointment(null);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'
              }`}
            >
              All Appointments
            </button>
            <button
              onClick={() => {
                setFilter('upcoming');
                setSelectedAppointment(null);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                filter === 'upcoming' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => {
                setFilter('completed');
                setSelectedAppointment(null);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                filter === 'completed' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => {
                setFilter('cancelled');
                setSelectedAppointment(null);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                filter === 'cancelled' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'
              }`}
            >
              Cancelled
            </button>
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => router.push('/medical-reports')}
                className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Medical Reports</span>
              </button>
            </div>
          </div>
  
          {/* Calendar placeholder */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Date</h3>
            <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-center text-sm text-gray-400">
              Calendar coming soon
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - List like in image 1 */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Appointments History</h1>
            <button
              onClick={() => router.push('/user-dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Book New Appointment
            </button>
          </div>
          
          {/* Appointment List - Similar to image 1 */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Appointments Found</h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You don't have any appointments yet." 
                  : filter === 'upcoming'
                  ? "You don't have any upcoming appointments."
                  : filter === 'completed'
                  ? "You don't have any completed appointments."
                  : "You don't have any appointments with medical reports."}
              </p>
              <button
                onClick={() => router.push('/user-dashboard')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const hasMedicalRecord = getMedicalRecordForAppointment(appointment.id) !== undefined;
                const medicalRecord = getMedicalRecordForAppointment(appointment.id);
                
                return (
                  <div 
                    key={appointment.id} 
                    onClick={() => setSelectedAppointment(appointment)}
                    className={`bg-white p-4 rounded-lg shadow-sm border transition-all flex flex-col md:flex-row gap-4 cursor-pointer ${
                      selectedAppointment?.id === appointment.id ? 'border-blue-500' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="md:w-1/4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.appointmentDateTime).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                          {new Date(appointment.appointmentDateTime).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="md:w-3/4 flex flex-col md:flex-row md:items-center md:justify-between flex-grow">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <DoctorAvatar 
                            className="w-full h-full" 
                            userId={appointment.doctor?.userId}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {appointment.doctorName || `Doctor #${appointment.doctorId}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {appointment.specialty || 'Medical Specialist'}
                          </p>
                          
                          {hasMedicalRecord && (
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Diagnosis:</span> {medicalRecord?.diagnosis ? 
                                (medicalRecord.diagnosis.length > 50 ? 
                                  `${medicalRecord.diagnosis.substring(0, 50)}...` : 
                                  medicalRecord.diagnosis) 
                                : 'No diagnosis provided'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end mt-4 md:mt-0 gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                          
                          {hasMedicalRecord && (
                            <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Report
                            </span>
                          )}
                        </div>
                        
                        {appointment.type && (
                          <span className="text-xs text-gray-500">
                            {appointment.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Appointment Details */}
      {selectedAppointment && (
        <div className="w-96 bg-white border-l border-gray-200 p-6 sticky top-0 h-screen overflow-y-auto">
          {(() => {
            const medicalRecord = getMedicalRecordForAppointment(selectedAppointment.id);
            const doctor = selectedAppointment.doctor as FullDoctorInfo;
            
            return (
              <>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    <DoctorAvatar
                      className="w-full h-full"
                      userId={selectedAppointment.doctor?.userId}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedAppointment.doctorName}</h2>
                    <p className="text-blue-600">{selectedAppointment.specialty}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Appointment Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Appointment Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(selectedAppointment.appointmentDateTime).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Time:</span>{' '}
                        {new Date(selectedAppointment.appointmentDateTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Status:</span>{' '}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium
                            ${selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            selectedAppointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            selectedAppointment.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {selectedAppointment.status}
                        </span>
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Type:</span> {selectedAppointment.type || 'Regular Check-up'}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Reason:</span> {selectedAppointment.reason || 'Not specified'}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Notes:</span> {selectedAppointment.notes || 'No additional notes'}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Fee:</span> RM {doctor?.consultationFee || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Medical Record (if available) */}
                  {medicalRecord && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Medical Record</h3>
                      <div className="space-y-2 text-sm">
                        {medicalRecord.diagnosis && (
                          <p>
                            <span className="font-medium">Diagnosis:</span>{' '}
                            {medicalRecord.diagnosis}
                          </p>
                        )}
                        {medicalRecord.notes && (
                          <p>
                            <span className="font-medium">Notes:</span>{' '}
                            {medicalRecord.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Actions</h3>
                    <div className="flex flex-col space-y-2">
                      {selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed' ? (
                        <>
                          <button
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            onClick={handleRescheduleAppointment}
                            disabled={actionLoading}
                          >
                            Reschedule Appointment
                          </button>
                          <button
                            className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg text-sm border border-red-200 hover:bg-red-100 transition-colors"
                            onClick={() => setShowCancelModal(true)}
                            disabled={actionLoading}
                          >
                            Cancel Appointment
                          </button>
                          {showCancelModal && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                                <h2 className="text-lg font-semibold mb-2">Cancel Appointment</h2>
                                <p className="mb-4 text-gray-600">Please provide a reason for cancellation:</p>
                                <textarea
                                  className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                                  rows={3}
                                  value={cancelReason}
                                  onChange={e => setCancelReason(e.target.value)}
                                  placeholder="Enter reason..."
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                                    disabled={actionLoading}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                    onClick={handleCancelAppointment}
                                    disabled={actionLoading || !cancelReason.trim()}
                                  >
                                    Confirm Cancel
                                  </button>
                                </div>
                                {actionError && <div className="text-red-600 text-xs mt-2">{actionError}</div>}
                              </div>
                            </div>
                          )}
                          {actionSuccess && <div className="text-green-600 text-xs mt-2">{actionSuccess}</div>}
                        </>
                      ) : selectedAppointment.status === 'completed' && !medicalRecord ? (
                        <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Leave a Review
                        </button>
                      ) : selectedAppointment.status === 'cancelled' ? (
                        <div className="text-center text-gray-500 py-4">
                          This appointment has been cancelled. No further actions are available.
                        </div>
                      ) : selectedAppointment.status === 'completed' ? (
                        <div className="text-center text-gray-500 py-4">
                          This appointment is completed. No further actions are available.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
} 