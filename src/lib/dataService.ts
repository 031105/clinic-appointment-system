import { mockDoctors, mockDepartments, mockAppointments, Doctor, Department, Appointment } from './mockData';

export const dataService = {
  getDoctors: (): Doctor[] => {
    return mockDoctors;
  },

  getDoctorById: (id: string): Doctor | undefined => {
    return mockDoctors.find(doctor => doctor.id === id);
  },

  getDoctorsByDepartment: (departmentId: string): Doctor[] => {
    return mockDoctors.filter(doctor => doctor.departmentId === departmentId);
  },

  getDepartments: (): Department[] => {
    return mockDepartments;
  },

  getDepartmentById: (id: string): Department | undefined => {
    return mockDepartments.find(department => department.id === id);
  },

  getUpcomingAppointments: (): Appointment[] => {
    return mockAppointments.filter(appointment => appointment.status === 'upcoming');
  },

  getAppointments: (): Appointment[] => {
    return mockAppointments;
  },
}; 