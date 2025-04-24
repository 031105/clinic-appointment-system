// src/types/models.ts
// Simplified interfaces for Clinic Appointment System

// Department related interfaces
export interface Department {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  createdAt: Date;
}

// Doctor related interfaces
export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  departmentId: string;
  experience: number;
  consultationFee: number;
  rating: number;
  totalRatings: number;
  about: string;
  image?: string;
  isAvailable: boolean;
  schedules: DoctorSchedule[];
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Appointment related interfaces
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduleId: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type?: string;
  reason?: string;
  notes?: string;
  createdAt: Date;
  // Derived/computed properties for UI
  doctorName?: string;
  patientName?: string;
  specialty?: string;
  hasReport?: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  createdAt: Date;
}

// User related interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: 'admin' | 'doctor' | 'patient';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  profilePictureUrl?: string;
  allergies?: Allergy[];
  emergencyContacts?: EmergencyContact[];
}

export interface Allergy {
  id: string;
  userId: string;
  name: string;
  severity: 'Low' | 'Medium' | 'High';
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
}

// Review related interfaces
export interface Review {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Message related interfaces
export interface MessageLog {
  id: string;
  recipientId: string;
  messageType: 'email';
  subject: string;
  content: string;
  status: 'sent' | 'delivered' | 'failed';
  sentAt: Date;
  createdAt: Date;
}