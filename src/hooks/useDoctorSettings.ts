import { useState, useEffect } from 'react';
import doctorSettingsClient, { DoctorProfile } from '../lib/api/doctor-settings';

export const useDoctorSettings = () => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      setError(null);
      const data = await doctorSettingsClient.getProfile();
      setProfile(data);
    } catch (err) {
      setError('Failed to fetch profile');
      console.error('Error fetching profile:', err);
    }
  };

  const updateProfile = async (data: Partial<DoctorProfile>) => {
    try {
      setError(null);
      const updated = await doctorSettingsClient.updateProfile(data);
      setProfile(updated);
      return true;
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
      return false;
    }
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      setError(null);
      const data = await doctorSettingsClient.uploadProfilePicture(file);
      setProfile(prev => prev ? { ...prev, profilePicture: data.profilePicture } : null);
      return true;
    } catch (err) {
      setError('Failed to upload profile picture');
      console.error('Error uploading profile picture:', err);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      await doctorSettingsClient.changePassword(currentPassword, newPassword);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
      throw err;
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };
    init();
  }, []);

  return {
    profile,
    loading,
    error,
    isEditing,
    updateProfile,
    uploadProfilePicture,
    toggleEditMode,
    changePassword
  };
}; 