import { mockDoctors, mockDepartments } from './mockData';

export const dataService = {
  getDoctors: () => mockDoctors,
  getDoctorById: (id: string) => mockDoctors.find(doctor => doctor.id === id),
  getDoctorsByDepartment: (departmentId: string) => 
    mockDoctors.filter(doctor => doctor.departmentId === departmentId),
  getDepartments: () => mockDepartments,
  getDepartmentById: (id: string) => 
    mockDepartments.find(department => department.id === id),
}; 