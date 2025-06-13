import httpClient from './http-client';

export interface AdminProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  roleName: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

const adminSettingClient = {
  getProfile: async () => {
    const response = await httpClient.get('/admin/setting/profile');
    return response.data;
  },
  
  updateProfile: async (data: Partial<AdminProfile>) => {
    const response = await httpClient.put('/admin/setting/profile', data);
    return response.data;
  },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await httpClient.post('/admin/setting/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await httpClient.post('/admin/setting/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

export default adminSettingClient; 