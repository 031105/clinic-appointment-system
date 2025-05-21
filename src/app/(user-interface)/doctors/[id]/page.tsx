'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Award, CheckCircle, Video } from 'lucide-react';
import { Rating } from '@/components/ui/Rating';
import type { Doctor } from '@/lib/api/patient-client';
import { Tab, Tabs } from '@/components/ui/Tabs';

// Extended Doctor type with additional properties for the UI
interface ExtendedDoctorInfo extends Doctor {
  hospital?: string;
  address?: string;
  phoneNumber?: string;
  availableOnline?: boolean;
}

export default function DoctorProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const doctorId = parseInt(params.id, 10);
  
  const [doctor, setDoctor] = useState<ExtendedDoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('about');
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Use API client
  const { api, loading: apiLoading, isMock, error: apiError } = usePatientApi();
  
  // Fetch doctor data
  useEffect(() => {
    async function fetchDoctorData() {
      if (!doctorId) return;
      
      try {
        setLoading(true);
        setUsingMockData(!!isMock);
        
        // Check if API has required methods
        if (!api?.getDoctorById) {
          console.error('API methods not available');
          provideFallbackData();
          return;
        }
        
        try {
          // Use Promise.race to implement a timeout for better UX
          const fetchPromise = api.getDoctorById(doctorId);
          const timeoutPromise = new Promise<null>((_, reject) => {
            setTimeout(() => reject(new Error("Doctor data fetch timeout")), 5000);
          });
          
          const doctorData = await Promise.race([fetchPromise, timeoutPromise]) as Doctor;
          
          // Extend doctor data with UI-specific properties
          const extendedData: ExtendedDoctorInfo = {
            ...doctorData,
            hospital: 'Main Hospital',
            address: '123 Medical Center Drive, Suite 100',
            phoneNumber: '(555) 123-4567',
            availableOnline: true
          };
          setDoctor(extendedData);
        } catch (error) {
          console.error('Error or timeout fetching doctor data:', error);
          provideFallbackData();
        }
      } catch (error) {
        console.error('Error in doctor data fetch flow:', error);
        provideFallbackData();
      } finally {
        setLoading(false);
      }
    }
    
    // Provide mock data in case of API failure
    function provideFallbackData() {
      setUsingMockData(true);
      // Create mock doctor data for development/testing
      const mockDoctor: ExtendedDoctorInfo = {
        id: doctorId,
        userId: doctorId,
        departmentId: 1,
        specializations: ["General Medicine", "Family Medicine"],
        qualifications: ["MD", "Board Certified", "Medical School Graduate"],
        experienceYears: 15,
        consultationFee: 120,
        about: "Experienced doctor specializing in general and family medicine with a focus on preventive care and holistic health management.",
        workingHours: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@example.com",
          phone: "123-456-7890",
          profilePicture: "/images/placeholder-doctor.jpg"
        },
        department: {
          id: 1,
          name: "General Medicine"
        },
        averageRating: 4.9,
        reviewCount: 150,
        hospital: 'Main Hospital',
        address: '123 Medical Center Drive, Suite 100',
        phoneNumber: '(555) 123-4567',
        availableOnline: true
      };
      
      setDoctor(mockDoctor);
    }
    
    if (!apiLoading && api && doctorId) {
      fetchDoctorData();
    }
  }, [api, apiLoading, doctorId, isMock]);
  
  const handleBookAppointment = () => {
    router.push(`/appointments/book?doctorId=${doctorId}`);
  };
  
  if (loading || apiLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor information...</p>
          {apiError && <p className="mt-2 text-amber-600">Warning: {apiError}</p>}
        </div>
      </div>
    );
  }
  
  if (!doctor) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">Doctor Not Found</h2>
        <p className="mt-2 text-gray-600">We couldn't find the requested doctor. Please try again or browse our other doctors.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  // Sample data for reviews and available time slots
  const reviews = [
    { id: 1, rating: 5, patientName: 'John D.', date: '2023-07-15', comment: 'Excellent doctor! Very thorough and professional.' },
    { id: 2, rating: 4, patientName: 'Sarah M.', date: '2023-06-22', comment: 'Dr. was very helpful and knowledgeable. Would recommend.' },
    { id: 3, rating: 5, patientName: 'Robert T.', date: '2023-05-30', comment: 'Great experience. The doctor explained everything clearly.' }
  ];
  
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
  
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Doctor Profile */}
        <div className="lg:w-2/3 bg-white rounded-2xl p-6 shadow-sm">
          {/* Top Section - Doctor Info */}
          <div className="flex flex-col md:flex-row gap-6 pb-6 border-b">
            <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 mx-auto md:mx-0 relative">
              <Image
                src={doctor.user.profilePicture || '/images/placeholder-doctor.jpg'}
                alt={`Dr. ${doctor.user.firstName} ${doctor.user.lastName}`}
                fill
                className="h-full w-full object-cover"
              />
              {usingMockData && (
                <div className="absolute top-0 right-0 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-600 rounded-bl">
                  Demo
                </div>
              )}
            </div>
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Dr. {doctor.user.firstName} {doctor.user.lastName}
                  </h1>
                  <p className="text-blue-600 text-lg mb-2">{doctor.department.name}</p>
                  <div className="flex items-center gap-2 mb-3">
                    {doctor.averageRating && (
                      <>
                        <Rating value={doctor.averageRating} />
                        <span className="text-sm text-gray-600">({doctor.reviewCount} reviews)</span>
                      </>
                    )}
                  </div>
                </div>
                {usingMockData && (
                  <span className="inline-block px-2 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded">Mock Data</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">{doctor.experienceYears} years experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">{doctor.hospital}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Verified Doctor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">{doctor.availableOnline ? 'Online consultation available' : 'In-person only'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <Tab value="about" label="About" />
              <Tab value="reviews" label="Reviews" />
              <Tab value="location" label="Location" />
            </Tabs>
            
            <div className="mt-6">
              {currentTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">About Dr. {doctor.user.firstName} {doctor.user.lastName}</h3>
                    <p className="text-gray-600 leading-relaxed">{doctor.about}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.specializations?.map((specialization, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {specialization}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Qualifications</h3>
                    <ul className="space-y-2">
                      {doctor.qualifications?.map((qualification, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{qualification}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Working Hours</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Monday - Friday</span>
                        <span className="font-medium">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Saturday</span>
                        <span className="font-medium">9:00 AM - 1:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Sunday</span>
                        <span className="font-medium text-red-500">Closed</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{doctor.averageRating?.toFixed(1) || '4.5'}</div>
                      <Rating value={doctor.averageRating || 4.5} />
                      <div className="text-sm text-gray-500 mt-1">Based on {doctor.reviewCount || 65} reviews</div>
                    </div>
                    <div className="flex-1">
                      {/* Rating distribution */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-sm w-4">{rating}</span>
                            <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full rounded-full" 
                                style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{review.patientName}</span>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <Rating value={review.rating} />
                        <p className="mt-2 text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentTab === 'location' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Office Location</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{doctor.hospital}</p>
                          <p className="text-gray-600">{doctor.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 mt-3">
                        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Office Hours</p>
                          <p className="text-gray-600">Mon-Fri: 9am - 5pm</p>
                          <p className="text-gray-600">Sat: 9am - 1pm</p>
                          <p className="text-gray-600">Sun: Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Map preview would be displayed here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Book Appointment */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
            <h3 className="text-lg font-medium mb-4">Book an Appointment</h3>
            
            <div className="mb-4">
              <p className="font-medium text-lg text-blue-600 mb-1">${doctor.consultationFee}</p>
              <p className="text-sm text-gray-600">Consultation Fee</p>
            </div>
            
            <button
              onClick={handleBookAppointment}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Book Appointment
            </button>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Available: Mon-Sat</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Response time: Within 1 hour</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Email: {doctor.user.email}</p>
                <p>Phone: {doctor.phoneNumber || doctor.user.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 