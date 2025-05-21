'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Rating } from '@/components/ui/Rating';
import { useSession } from '@/contexts/auth/SessionContext';
import type { Doctor, AppointmentRequest, Appointment } from '@/lib/api/patient-client';
import patientClient from '@/lib/api/patient-client';
import { DoctorAvatar } from '@/components/ui/DoctorAvatar';

export default function BookAppointment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get doctorId from query parameters
  const doctorIdParam = searchParams.get('doctorId');
  const doctorId = doctorIdParam ? parseInt(doctorIdParam, 10) : null;
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('REGULAR');
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const appointmentIdParam = searchParams.get('appointmentId');
  const appointmentId = appointmentIdParam ? parseInt(appointmentIdParam, 10) : null;
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch doctor data
  useEffect(() => {
    async function fetchDoctorData() {
      if (!doctorId) {
        setError("No doctor ID provided");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        setUsingMockData(false);
        
        // Fetch doctor data with timeout
        const doctorData = await fetchDoctorById(doctorId);
        
        if (!doctorData || !doctorData.id) {
          setError("Could not find doctor information");
          setLoading(false);
          return;
        }
        
        console.log("[APPOINTMENT] Doctor data retrieved:", doctorData.id);
        setDoctor(doctorData);
        
        // Fetch available appointment slots (in a real implementation, this would 
        // come from an API call - for now we'll generate dates)
        await fetchAvailability(doctorData.id);
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        setError("Failed to load doctor information. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    // Fetch doctor availability from the backend
    async function fetchAvailability(doctorId: number) {
      try {
        // In a real implementation, this would be an API call like:
        // const slots = await api.getDoctorAvailability(doctorId);
        
        // For now, generate the next 5 days
        const today = new Date();
        const dates = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        setAvailableDates(dates);
        
        // Standard time slots
        const times = [
          '09:00 AM', '10:00 AM', '11:00 AM',
          '02:00 PM', '03:00 PM', '04:00 PM'
        ];
        setAvailableTimes(times);
      } catch (error) {
        console.error('Error fetching availability:', error);
        // Even if availability fetch fails, we can still show standard slots
        const today = new Date();
        const dates = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        setAvailableDates(dates);
        
        const times = [
          '09:00 AM', '10:00 AM', '11:00 AM',
          '02:00 PM', '03:00 PM', '04:00 PM'
        ];
        setAvailableTimes(times);
      }
    }

    if (!doctorId) {
      setError("Please select a doctor to book an appointment");
      setLoading(false);
    } else {
      fetchDoctorData();
    }
  }, [doctorId]);

  // Pre-fill form if rescheduling
  useEffect(() => {
    async function fetchAppointmentData() {
      if (!appointmentId) return;
      setIsRescheduling(true);
      try {
        const appointment: Appointment = await patientClient.getAppointmentById(appointmentId);
        setReason(appointment.reason || '');
        setSymptoms(appointment.symptoms || []);
        setAppointmentType(appointment.type ? appointment.type.toUpperCase() : 'REGULAR');
        // Parse date and time from appointmentDateTime
        if (appointment.appointmentDateTime) {
          const dt = new Date(appointment.appointmentDateTime);
          setSelectedDate(dt.toISOString().split('T')[0]);
          let hour = dt.getHours();
          const minute = dt.getMinutes().toString().padStart(2, '0');
          let period = 'AM';
          if (hour >= 12) {
            period = 'PM';
            if (hour > 12) hour -= 12;
          } else if (hour === 0) {
            hour = 12;
          }
          setSelectedTime(`${hour.toString().padStart(2, '0')}:${minute} ${period}`);
        }
      } catch (err) {
        setError('Failed to load appointment for rescheduling.');
      } finally {
        setIsRescheduling(false);
      }
    }
    if (appointmentId) {
      fetchAppointmentData();
    }
  }, [appointmentId]);

  const addSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !selectedDate || !selectedTime || !reason) return;
    try {
      setIsSubmitting(true);
      setError(null);
      // Format date and time for the appointment
      const [time, period] = selectedTime.split(' '); // e.g., "09:00", "AM"
      let [hours, minutes] = time.split(':');
      let hour = parseInt(hours, 10);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      const appointmentDateTime = `${selectedDate}T${hour.toString().padStart(2, '0')}:${minutes}:00`;
      if (appointmentId) {
        // Reschedule existing appointment
        await patientClient.rescheduleAppointment(appointmentId, appointmentDateTime);
        setShowSuccess(true);
      } else {
        // Create new appointment
        const appointmentRequest: AppointmentRequest = {
          doctorId: doctor.id,
          appointmentDateTime,
          type: appointmentType.toLowerCase(),
          reason,
          symptoms,
          duration: 30 // Default 30 minutes
        };
        await createAppointment(appointmentRequest);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error creating/rescheduling appointment:', error);
      setError('Failed to book/reschedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">Error</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Show success modal/toast
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg shadow text-center">
          <h1 className="text-2xl font-bold text-green-700 mb-2">{appointmentId ? 'Appointment Rescheduled!' : 'Appointment Booked Successfully!'}</h1>
          <p className="text-green-800 mb-4">Your appointment has been {appointmentId ? 'rescheduled' : 'scheduled'}. You will receive a confirmation and further details soon.</p>
          <button
            onClick={() => router.push('/appointments/history')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View My Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {usingMockData && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                Using Demo Mode
              </p>
              <p className="text-xs text-amber-600 mt-1">
                You're viewing mock data for demonstration purposes. In production, this would connect to a real database.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Doctor Information Column */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-32 h-32 relative rounded-full overflow-hidden mb-4 border-4 border-white shadow">
                <DoctorAvatar className="w-32 h-32" userId={doctor?.userId} />
              </div>
              <h2 className="text-xl font-bold">Dr. {doctor?.user?.firstName} {doctor?.user?.lastName}</h2>
              <p className="text-blue-600">{doctor?.department?.name}</p>
              
              {doctor?.averageRating && (
                <div className="flex items-center mt-2">
                  <Rating value={doctor.averageRating} />
                  <span className="text-sm text-gray-500 ml-2">({doctor.reviewCount} reviews)</span>
                </div>
              )}
              
              <p className="mt-2 text-lg font-semibold text-blue-600">${doctor?.consultationFee} per consultation</p>
              {usingMockData && (
                <span className="mt-1 inline-block px-2 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded">Mock Data</span>
              )}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">About</h3>
              <p className="text-sm text-gray-600">{doctor?.about}</p>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {doctor?.specializations?.map((spec: string, index: number) => (
                  <span key={index} className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Qualifications</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {doctor?.qualifications?.map((qual: string, index: number) => (
                  <li key={index}>{qual}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Appointment Form Column */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Book Appointment</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="font-medium">Error</p>
                <p>{error}</p>
                {usingMockData && (
                  <p className="text-sm mt-1">Note: You're currently in demo mode using mock data.</p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['REGULAR', 'FOLLOW_UP', 'URGENT'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAppointmentType(type)}
                      className={`p-3 rounded-lg text-center transition-all duration-200 ${
                        appointmentType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-lg text-center transition-all duration-200 ${
                        selectedDate === date
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg text-center transition-all duration-200 ${
                        selectedTime === time
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Please describe the reason for your visit"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms (Optional)
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add symptom"
                  />
                  <button
                    type="button"
                    onClick={addSymptom}
                    className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                
                {symptoms.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {symptoms.map((symptom, index) => (
                      <div key={index} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                        {symptom}
                        <button
                          type="button"
                          onClick={() => removeSymptom(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTime || !reason || isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const fetchDoctorById = async (doctorId: number): Promise<Doctor | null> => {
  try {
    return await patientClient.getDoctorById(doctorId) as Doctor;
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    return null;
  }
};

const createAppointment = async (appointmentRequest: AppointmentRequest) => {
  try {
    return await patientClient.createAppointment(appointmentRequest);
  } catch (error) {
    throw error;
  }
}; 