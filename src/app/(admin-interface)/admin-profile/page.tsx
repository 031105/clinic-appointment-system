'use client';

import React, { useState } from 'react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { User, Mail, Phone, Calendar, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AdminImage from '@/components/AdminImage';
import { 
  validateName, 
  validateMalaysiaPhone, 
  validateFile, 
  sanitizeText 
} from '@/utils/validation';

export default function AdminProfile() {
  const {
    profile,
    loading,
    error,
    isEditing,
    updateProfile,
    uploadProfilePicture,
    toggleEditMode
  } = useAdminSettings();

  // Validation state
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    profilePicture?: string;
  }>({});

  // Clear specific error when user starts typing
  const clearError = (fieldName: string) => {
    if (formErrors[fieldName as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
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

  const validateForm = (formData: FormData): boolean => {
    const errors: typeof formErrors = {};
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

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      
      // Validate form before submission
      if (!validateForm(formData)) {
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
        setFormErrors({}); // Clear any validation errors
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
        setFormErrors(prev => ({ ...prev, profilePicture: fileValidation.error }));
        toast({
          title: "File Validation Error",
          description: fileValidation.error,
          variant: "destructive",
        });
        return;
      }

      // Clear file error if validation passed
      setFormErrors(prev => ({ ...prev, profilePicture: undefined }));

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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <button
            onClick={toggleEditMode}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {profile && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-6">
              {/* Profile Picture and Basic Info */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <AdminImage
                    userId={profile.id}
                    profileImageBlob={profile.profilePicture}
                    size="xl"
                    rounded="full"
                    className="bg-blue-100"
                  />
                  {isEditing && (
                    <label
                      htmlFor="profile-picture"
                      className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-gray-50 border"
                    >
                      <input
                        type="file"
                        id="profile-picture"
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleFileUpload}
                      />
                      <Upload className="w-4 h-4 text-gray-600" />
                    </label>
                  )}
                  {/* File validation error display */}
                  {formErrors.profilePicture && (
                    <div className="absolute -bottom-8 left-0 right-0 text-center">
                      <p className="text-xs text-red-600 bg-white px-2 py-1 rounded shadow">
                        {formErrors.profilePicture}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {`${profile.firstName} ${profile.lastName}`}
                  </h3>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-1" />
                    {profile.email}
                  </p>
                  <p className="text-gray-600 flex items-center mt-1">
                    <span className="inline-block w-4 h-4 bg-blue-600 rounded mr-1"></span>
                    {profile.roleName} User
                  </p>
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-2">
                      Click the upload icon to change your profile picture.<br/>
                      Supported: JPEG, PNG, GIF (max 5MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      defaultValue={profile.firstName}
                      disabled={!isEditing}
                      onChange={() => clearError('firstName')}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                        formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      defaultValue={profile.lastName}
                      disabled={!isEditing}
                      onChange={() => clearError('lastName')}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                        formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profile.email}
                      disabled={true}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      defaultValue={profile.phone || ''}
                      disabled={!isEditing}
                      onChange={() => clearError('phone')}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                        formErrors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 012-345 6789"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Malaysia phone number format</p>
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

                {/* Account Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Account Created
                      </label>
                      <div className="mt-1 flex items-center text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Login
                      </label>
                      <div className="mt-1 flex items-center text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 