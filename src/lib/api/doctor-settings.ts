import httpClient from './http-client';

export interface DoctorProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  qualifications: string[];
  experienceYears: number;
  consultationFee: number;
  bio: string;
  profilePicture?: string;
  departmentName: string;
  departmentId: number;
}

const doctorSettingsClient = {
  getProfile: async () => {
    const response = await httpClient.get('/doctor-setting/profile');
    return response.data;
  },
  
  updateProfile: async (data: Partial<DoctorProfile>) => {
    const response = await httpClient.put('/doctor-setting/profile', data);
    return response.data;
  },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await httpClient.post('/doctor-setting/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await httpClient.post('/doctor-setting/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

export default doctorSettingsClient; 