import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/auth/SessionContext';
import patientClient from '@/lib/api/patient-client';
import { Allergy, EmergencyContact } from '@/lib/api/patient-client';

export function useSettings() {
  const { data, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 加载所有设置页面所需的数据
  const loadSettingsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. 获取用户个人资料
      const profile = await patientClient.getProfile();
      setProfileData(profile);
      
      // 2. 获取过敏信息
      const allergyData = await patientClient.getAllergies();
      setAllergies(allergyData);
      
      // 3. 获取紧急联系人
      const contactData = await patientClient.getEmergencyContacts();
      setEmergencyContacts(contactData);
      
    } catch (err: any) {
      console.error('Failed to load settings data:', err);
      setError(err.message || 'Failed to load settings data');
    } finally {
      setIsLoading(false);
    }
  };

  // 更新个人基本信息
  const updateProfile = async (data: any) => {
    try {
      setError(null);
      const updatedProfile = await patientClient.updateProfile(data);
      setProfileData(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // 更改密码
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      await patientClient.changePassword(currentPassword, newPassword);
      return true;
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setError(err.message || 'Failed to change password');
      throw err;
    }
  };

  // 过敏信息CRUD操作
  const addAllergy = async (allergyData: any) => {
    try {
      setError(null);
      const newAllergy = await patientClient.addAllergy(allergyData);
      setAllergies(prev => [...prev, newAllergy]);
      return newAllergy;
    } catch (err: any) {
      console.error('Failed to add allergy:', err);
      setError(err.message || 'Failed to add allergy');
      throw err;
    }
  };
  
  const updateAllergy = async (id: number, allergyData: any) => {
    try {
      setError(null);
      const updatedAllergy = await patientClient.updateAllergy(id, allergyData);
      setAllergies(prev => prev.map(allergy => 
        allergy.id === id ? updatedAllergy : allergy
      ));
      return updatedAllergy;
    } catch (err: any) {
      console.error('Failed to update allergy:', err);
      setError(err.message || 'Failed to update allergy');
      throw err;
    }
  };
  
  const deleteAllergy = async (id: number) => {
    try {
      setError(null);
      await patientClient.deleteAllergy(id);
      setAllergies(prev => prev.filter(allergy => allergy.id !== id));
      return true;
    } catch (err: any) {
      console.error('Failed to delete allergy:', err);
      setError(err.message || 'Failed to delete allergy');
      throw err;
    }
  };

  // 紧急联系人CRUD操作
  const addEmergencyContact = async (contactData: any) => {
    try {
      setError(null);
      const newContact = await patientClient.addEmergencyContact(contactData);
      
      // 如果新联系人是主要联系人，更新其他联系人的状态
      if (newContact.isPrimary) {
        setEmergencyContacts(prev => prev.map(contact => ({
          ...contact,
          isPrimary: contact.id === newContact.id
        })));
      } else {
        setEmergencyContacts(prev => [...prev, newContact]);
      }
      
      return newContact;
    } catch (err: any) {
      console.error('Failed to add emergency contact:', err);
      setError(err.message || 'Failed to add emergency contact');
      throw err;
    }
  };
  
  const updateEmergencyContact = async (id: number, contactData: any) => {
    try {
      setError(null);
      const updatedContact = await patientClient.updateEmergencyContact(id, contactData);
      
      // 如果更新的联系人是主要联系人，更新其他联系人的状态
      if (updatedContact.isPrimary) {
        setEmergencyContacts(prev => prev.map(contact => ({
          ...contact,
          isPrimary: contact.id === id
        })));
      } else {
        setEmergencyContacts(prev => prev.map(contact => 
          contact.id === id ? updatedContact : contact
        ));
      }
      
      return updatedContact;
    } catch (err: any) {
      console.error('Failed to update emergency contact:', err);
      setError(err.message || 'Failed to update emergency contact');
      throw err;
    }
  };
  
  const deleteEmergencyContact = async (id: number) => {
    try {
      setError(null);
      await patientClient.deleteEmergencyContact(id);
      setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
      return true;
    } catch (err: any) {
      console.error('Failed to delete emergency contact:', err);
      setError(err.message || 'Failed to delete emergency contact');
      throw err;
    }
  };

  // 初始加载
  useEffect(() => {
    if (data.user && status === 'authenticated') {
      loadSettingsData();
    }
  }, [data.user, status]);

  return {
    isLoading,
    error,
    profileData,
    allergies,
    emergencyContacts,
    loadSettingsData,
    updateProfile,
    changePassword,
    addAllergy,
    updateAllergy,
    deleteAllergy,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact
  };
} 