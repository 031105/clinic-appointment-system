// Types
export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  departmentId: string;
  experience: number;
  consultationFee: number;
  reviewCount: number;
  about: string;
  image?: string;
}

export interface Report {
  diagnosis: string;
  prescription: string;
  notes: string;
  date: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  hasReport: boolean;
  report?: Report;
}

// Mock Data
export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Cardiology',
    description: 'Specialized care for heart conditions',
  },
  {
    id: '2',
    name: 'Pediatrics',
    description: 'Healthcare for children and adolescents',
  },
  {
    id: '3',
    name: 'Dermatology',
    description: 'Treatment of skin conditions',
  },
  {
    id: '4',
    name: 'Orthopedics',
    description: 'Bone and joint care',
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'John Smith',
    specialty: 'Cardiology',
    departmentId: '1',
    experience: 15,
    consultationFee: 50,
    reviewCount: 100,
    about: 'Experienced cardiologist with a focus on heart health.',
    image: '/images/doctors/doctor-1.jpg',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    specialty: 'Pediatrics',
    departmentId: '2',
    experience: 10,
    consultationFee: 40,
    reviewCount: 80,
    about: 'Specializes in pediatric care and growth.',
    image: '/images/doctors/doctor-2.jpg',
  },
  {
    id: '3',
    name: 'Michael Brown',
    specialty: 'Dermatology',
    departmentId: '3',
    experience: 12,
    consultationFee: 30,
    reviewCount: 90,
    about: 'Expert in skin conditions and cosmetic treatments.',
    image: '/images/doctors/doctor-3.jpg',
  },
  {
    id: '4',
    name: 'Emily Davis',
    specialty: 'Orthopedics',
    departmentId: '4',
    experience: 8,
    consultationFee: 45,
    reviewCount: 70,
    about: 'Specializes in bone and joint health.',
    image: '/images/doctors/doctor-4.jpg',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorId: '1',
    doctorName: 'John Smith',
    specialty: 'Cardiology',
    date: '2024-03-20',
    time: '10:00',
    status: 'completed',
    hasReport: true,
    report: {
      diagnosis: 'Hypertension Stage 1',
      prescription: 'Lisinopril 10mg daily',
      notes: 'Blood pressure slightly elevated. Recommend lifestyle changes including reduced salt intake and regular exercise. Follow-up in 3 months.',
      date: '2024-03-20',
    },
  },
  {
    id: '2',
    doctorId: '2',
    doctorName: 'Sarah Johnson',
    specialty: 'Pediatrics',
    date: '2024-03-25',
    time: '14:00',
    status: 'upcoming',
    hasReport: false,
  },
  {
    id: '3',
    doctorId: '3',
    doctorName: 'Michael Brown',
    specialty: 'Dermatology',
    date: '2024-03-15',
    time: '11:00',
    status: 'completed',
    hasReport: true,
    report: {
      diagnosis: 'Atopic Dermatitis',
      prescription: 'Topical corticosteroid cream, apply twice daily',
      notes: 'Skin condition showing improvement. Continue current treatment plan. Return in 2 weeks if symptoms persist.',
      date: '2024-03-15',
    },
  },
  {
    id: '4',
    doctorId: '4',
    doctorName: 'Emily Davis',
    specialty: 'Orthopedics',
    date: '2024-03-28',
    time: '16:00',
    status: 'upcoming',
    hasReport: false,
  },
  {
    id: '5',
    doctorId: '1',
    doctorName: 'John Smith',
    specialty: 'Cardiology',
    date: '2024-03-10',
    time: '09:00',
    status: 'cancelled',
    hasReport: false,
  },
]; 