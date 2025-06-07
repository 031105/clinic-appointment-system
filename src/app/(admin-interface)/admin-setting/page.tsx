'use client';

import React, { useState } from 'react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { User, Lock, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';
import AdminImage from '@/components/AdminImage';
import { 
  validatePassword,
  validateName,
  validateMalaysiaPhone,
  validateFile,
  sanitizeText
} from '@/utils/validation';

// Enhanced password validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AdminSettings() {
  const {
    profile,
    loading,
    error,
    isEditing,
    updateProfile,
    uploadProfilePicture,
    toggleEditMode,
    changePassword
  } = useAdminSettings();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Form validation states
  const [profileErrors, setProfileErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    profilePicture?: string;
  }>({});

  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Clear specific error when user starts typing
  const clearProfileError = (fieldName: string) => {
    if (profileErrors[fieldName as keyof typeof profileErrors]) {
      setProfileErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const clearPasswordError = (fieldName: string) => {
    if (passwordErrors[fieldName as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  // Validate profile form
  const validateProfileForm = (formData: FormData): boolean => {
    const errors: typeof profileErrors = {};
    let isValid = true;

    // Validate firstName
    const firstName = sanitizeText(formData.get('firstName') as string);
    const firstNameValidation = validateName(firstName, 'First name');
    if (!firstNameValidation.isValid) {
      errors.firstName = firstNameValidation.error;
      isValid = false;
    }

    // Validate lastName
    const lastName = sanitizeText(formData.get('lastName') as string);
    const lastNameValidation = validateName(lastName, 'Last name');
    if (!lastNameValidation.isValid) {
      errors.lastName = lastNameValidation.error;
      isValid = false;
    }

    // Validate phone (optional)
    const phone = sanitizeText(formData.get('phone') as string);
    const phoneValidation = validateMalaysiaPhone(phone, false);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error;
      isValid = false;
    }

    setProfileErrors(errors);
    return isValid;
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    const errors: typeof passwordErrors = {};
    let isValid = true;

    // Validate current password
    if (!currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    // Validate new password
    const newPasswordValidation = validatePassword(newPassword, 'New password');
    if (!newPasswordValidation.isValid) {
      errors.newPassword = newPasswordValidation.error;
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      errors.newPassword = 'New password must be different from current password';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="flex gap-6">
            <div className="w-64 h-40 bg-gray-200 rounded"></div>
            <div className="flex-1 h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      await changePassword(currentPassword, newPassword);
      
      // Clear form and errors
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      
      if (!validateProfileForm(formData)) {
        toast({
          title: "Validation Error",
          description: "Please correct the errors and try again",
          variant: "destructive",
        });
        return;
      }

      const success = await updateProfile({
        firstName: sanitizeText(formData.get('firstName') as string),
        lastName: sanitizeText(formData.get('lastName') as string),
        phone: sanitizeText(formData.get('phone') as string) || undefined,
      });
      
      if (success) {
        toggleEditMode();
        setProfileErrors({});
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file before upload
      const fileValidation = validateFile(
        file, 
        ['image/jpeg', 'image/png', 'image/gif'], 
        5, 
        'Profile picture'
      );

      if (!fileValidation.isValid) {
        setProfileErrors(prev => ({ ...prev, profilePicture: fileValidation.error }));
        toast({
          title: "File Validation Error",
          description: fileValidation.error,
          variant: "destructive",
        });
        return;
      }

      setProfileErrors(prev => ({ ...prev, profilePicture: undefined }));

      const success = await uploadProfilePicture(file);
      if (success) {
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Personal Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
            <nav className="p-2">
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </button>
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'password'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('password')}
              >
                <Lock className="h-5 w-5 mr-3" />
                Password
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Profile Settings</h2>
                  <button
                    onClick={toggleEditMode}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {profile && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <AdminImage
                          userId={profile.id}
                          profileImageBlob={profile.profilePicture}
                          size="lg"
                          rounded="full"
                          className="bg-blue-100"
                        />
                        {isEditing && (
                          <label
                            htmlFor="profile-picture"
                            className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="file"
                              id="profile-picture"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileUpload}
                            />
                            <Upload className="w-4 h-4 text-gray-600" />
                          </label>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{`${profile.firstName} ${profile.lastName}`}</h3>
                        <p className="text-gray-500">{profile.email}</p>
                        <p className="text-gray-500 capitalize">{profile.roleName} User</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            defaultValue={profile.firstName}
                            disabled={!isEditing}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            defaultValue={profile.lastName}
                            disabled={!isEditing}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={profile.email}
                            disabled={true}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            defaultValue={profile.phone || ''}
                            disabled={!isEditing}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Role
                          </label>
                          <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                            <span className="text-gray-900 capitalize">{profile.roleName}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                            <span className={`capitalize ${profile.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                              {profile.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                          >
                            Save Profile
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Password Settings */}
            {activeTab === 'password' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Change Password</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Update your password to keep your account secure
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter new password"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 