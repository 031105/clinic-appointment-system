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
  rating: number;
  schedules: Schedule[];
}

export interface Schedule {
  id: string;
  date: string;
  time: string;
  isAvailable: boolean;
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
    rating: 4.8,
    schedules: [
      { id: '1', date: '2024-03-20', time: '09:00', isAvailable: true },
      { id: '2', date: '2024-03-20', time: '10:00', isAvailable: false },
    ],
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    specialty: 'Pediatrics',
    departmentId: '2',
    experience: 10,
    rating: 4.9,
    schedules: [
      { id: '3', date: '2024-03-20', time: '14:00', isAvailable: true },
      { id: '4', date: '2024-03-20', time: '15:00', isAvailable: true },
    ],
  },
]; 