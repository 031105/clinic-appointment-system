'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, ClockIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { initializeWithSession } from '@/lib/api/patient-client';
import { useSession } from '@/contexts/auth/SessionContext';
import { useDashboardStats, ExtendedDoctor, ExtendedAppointment } from '@/hooks';
import { DoctorAvatar } from '@/components/ui/DoctorAvatar';
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from '@/components/ui/Toast';

// Login notification component
const LoginNotification = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
      <div className="bg-white border border-green-100 shadow-lg rounded-lg p-4 max-w-md flex items-start space-x-3">
        <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">Login Successful</h3>
          <p className="text-sm text-gray-500 mt-1">Welcome back to your medical dashboard!</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const { data, status } = useSession();
  
  // 使用新的dashboard hook
  const {
    departments,
    selectedDepartment,
    doctors,
    upcomingAppointments,
    loading,
    error,
    selectDepartment
  } = useDashboardStats();
  
  // 本地选中的医生状态 (不是dashboard hook的一部分)
  const [selectedDoctor, setSelectedDoctor] = useState<ExtendedDoctor | null>(null);
  
  // 获取当前用户名称
  const [userName, setUserName] = useState('Guest');
  
  // Login notification state
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  
  // 初始化patient-client与用户会话
  useEffect(() => {
    // Check if we're in a browser environment before accessing localStorage
    const isBrowser = typeof window !== 'undefined';
    
    if (status === 'authenticated' && data?.user) {
      console.log('Initializing patient client with user session');
      
      // Only access localStorage in browser environment
      if (isBrowser) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          initializeWithSession({ user: { token } });
          setUserName(data.user.name || 'Guest');
          // Show login notification
          setShowLoginNotification(true);
          // Auto hide after 5 seconds
          setTimeout(() => setShowLoginNotification(false), 5000);
        } else {
          console.error('No access token found in localStorage');
          // Redirect to login if no token found
          router.push('/login');
        }
      }
    } else if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [status, data, router]);

  // 当选择的部门改变时，更新医生列表
  useEffect(() => {
    if (selectedDepartment) {
      const departmentDoctors = doctors.filter(
        doctor => doctor.departmentId === selectedDepartment.id
      );
      if (departmentDoctors.length > 0) {
        setSelectedDoctor(departmentDoctors[0]);
      } else {
        setSelectedDoctor(null);
      }
    }
  }, [selectedDepartment, doctors]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          {error && <p className="mt-2 text-amber-600">Warning: {error}</p>}
        </div>
      </div>
    );
  }

  // 如果未认证，不渲染内容（重定向会处理）
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <>
      {showLoginNotification && (
        <LoginNotification onClose={() => setShowLoginNotification(false)} />
      )}
      
      <div className="flex min-h-screen">
        {/* Main content area - adjust width to accommodate larger sidebar */}
        <div className="flex-1 p-8 max-w-[calc(100%-350px)] overflow-y-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome, {userName}!</h1>
            <p className="text-gray-600 text-lg">Hello there! Welcome to our medical app, how can we assist you?</p>
          </div>

          {/* Display error message if any */}
          {error && (
            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Department list */}
          <div className="relative mb-8 w-full">
            <div className="flex gap-2 overflow-x-auto pb-4 w-full no-scrollbar" 
                 style={{ 
                   WebkitOverflowScrolling: 'touch',
                   scrollbarWidth: 'none',
                   msOverflowStyle: 'none'
                 }}>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <button
                    key={dept.id}
                    className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[6rem] max-w-[9rem] w-auto h-24 rounded-2xl p-3 transition-shadow ${
                      selectedDepartment?.id === dept.id
                        ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                        : 'bg-white shadow-sm hover:shadow-md'
                    }`}
                    onClick={() => selectDepartment(dept)}
                  >
                    <div className="text-2xl mb-1">{dept.emojiIcon || dept.name.charAt(0) || '👨‍⚕️'}</div>
                    <span className="text-xs font-medium w-full text-center leading-tight dept-name">{dept.name}</span>
                  </button>
                ))
              ) : (
                <div className="w-full p-4 bg-gray-50 rounded-xl text-center text-gray-500">
                  No departments available
                </div>
              )}
            </div>
          </div>

          {/* Doctor List */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Doctor List</h2>
            {(!selectedDepartment || doctors.filter(doctor => doctor.departmentId === selectedDepartment.id).length === 0) ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">👩‍⚕️</div>
                <h3 className="text-lg font-medium text-blue-700 mb-1">
                  {selectedDepartment ? 'No Doctors Available' : 'Please Select a Department'}
                </h3>
                <p className="text-sm text-blue-600">
                  {selectedDepartment 
                    ? `We currently don't have any doctors in the ${selectedDepartment.name} department.`
                    : 'Please select a department to view available doctors.'}
                  <br />{selectedDepartment && 'Please select another department or check back later.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors
                  .filter(doctor => !selectedDepartment || doctor.departmentId === selectedDepartment.id)
                  .map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`text-left p-6 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all ${
                        selectedDoctor?.id === doctor.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                        <DoctorAvatar className="w-full h-full" userId={doctor.userId} />
                      </div>
                      <h3 className="font-semibold text-lg mb-1 truncate">{doctor.name || `${doctor.user.firstName} ${doctor.user.lastName}`}</h3>
                      <p className="text-gray-500 mb-2 truncate">{doctor.department?.name || ''}</p>
                      <p className="text-blue-600 font-medium">RM {doctor.consultationFee || 0}/h</p>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar - increased width */}
        <div className="w-[350px] flex-shrink-0 bg-white rounded-lg p-5 h-screen sticky top-0 flex flex-col overflow-hidden shadow-md">
          {/* Upcoming Appointments Section - made more prominent */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Schedule</h2>
            
            {upcomingAppointments.length > 0 ? (
              <>
                {/* Stacked cards container - made taller */}
                <div className="relative mb-6" style={{ height: "180px" }}>
                  {upcomingAppointments.slice(0, 3).map((appointment, index) => (
                    <div 
                      key={appointment.id} 
                      className="absolute w-full bg-white rounded-lg border transition-all duration-300"
                      style={{
                        zIndex: 3 - index,
                        transform: `translateY(${index * 12}px) scale(${1 - index * 0.03})`,
                        opacity: 1 - index * 0.15,
                        padding: "20px",
                        border: "1px solid #f0f0f0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          <DoctorAvatar className="w-full h-full" userId={appointment.doctor?.userId} />
                        </div>
                        <div>
                          <h3 className="font-medium text-base">{appointment.doctorName}</h3>
                          <p className="text-gray-500 text-sm">{appointment.specialty}</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 mb-5">
                  <button 
                    onClick={() => router.push('/appointments/history?filter=upcoming')}
                    className="w-full text-center py-2 px-4 bg-blue-100 text-blue-600 text-sm font-medium hover:bg-blue-200 transition-colors rounded-lg"
                  >
                    View All Appointments
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-700 mb-6">
                <div className="text-4xl mb-2">📅</div>
                <p className="mb-3 font-medium">No upcoming appointments</p>
                <button 
                  onClick={() => router.push('/user-dashboard')}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                >
                  Book Your First Appointment
                </button>
              </div>
            )}
          </div>

          {/* Doctor Details Section */}
          {selectedDoctor && (
            <div className="flex-grow flex flex-col overflow-y-auto">
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold mb-3">Doctor Details</h2>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <DoctorAvatar className="w-full h-full" userId={selectedDoctor.userId} />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{selectedDoctor.name || `${selectedDoctor.user.firstName} ${selectedDoctor.user.lastName}`}</h3>
                    <p className="text-gray-500 text-sm">{selectedDoctor.department?.name || ''}</p>
                    <p className="text-blue-600 text-sm font-medium">RM {selectedDoctor.consultationFee || 0}/h</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="text-lg font-semibold">{selectedDoctor.experienceYears || 0} Years</p>
                    <p className="text-gray-500 text-sm">Experience</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{selectedDoctor.reviewCount || 0}K</p>
                    <p className="text-gray-500 text-sm">Review</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 overflow-y-auto">
                <h4 className="text-sm font-semibold mb-2">About</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedDoctor.about || 'No information available'}</p>
              </div>

              <button 
                onClick={() => router.push(`/appointments/book?doctorId=${selectedDoctor.id}`)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mt-auto"
              >
                Book Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}