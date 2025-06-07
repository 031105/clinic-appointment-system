'use client';

import React, { useState } from 'react';
import { User, Lock, Upload } from 'lucide-react';
import { useDoctorSettings } from '@/hooks/useDoctorSettings';
import DoctorImage from '@/components/DoctorImage';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';

// Password validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export default function Settings() {
  const {
    profile,
    loading,
    error,
    isEditing,
    updateProfile,
    uploadProfilePicture,
    toggleEditMode,
    changePassword
  } = useDoctorSettings();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsChangingPassword(true);
      
      const result = passwordSchema.safeParse({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error.issues[0].message,
          variant: "destructive",
        });
        return;
      }

      await changePassword(currentPassword, newPassword);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
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
                        <DoctorImage
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
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  uploadProfilePicture(file);
                                }
                              }}
                            />
                            <Upload className="w-4 h-4 text-gray-600" />
                          </label>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{`${profile.firstName} ${profile.lastName}`}</h3>
                        <p className="text-gray-500">{profile.email}</p>
                      </div>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (isEditing) {
                          const formData = new FormData(e.currentTarget);
                          const success = await updateProfile({
                            phone: formData.get('phone') as string,
                            experienceYears: parseInt(formData.get('experienceYears') as string),
                            bio: formData.get('bio') as string,
                          });
                          if (success) {
                            toggleEditMode();
                          }
                        }
                      }}
                      className="space-y-6"
                    >
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
                            disabled={true}
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
                            disabled={true}
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
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            defaultValue={profile.phone}
                            disabled={!isEditing}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>

                        <div>
                          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                            Specialty
                          </label>
                          <input
                            type="text"
                            name="specialty"
                            id="specialty"
                            defaultValue={profile.specialty}
                            disabled={true}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>

                        <div>
                          <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            name="experienceYears"
                            id="experienceYears"
                            defaultValue={profile.experienceYears}
                            disabled={!isEditing}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>

                        <div>
                          <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                            Consultation Fee
                          </label>
                          <input
                            type="number"
                            name="consultationFee"
                            id="consultationFee"
                            defaultValue={profile.consultationFee}
                            disabled={true}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">
                            Qualifications
                          </label>
                          <textarea
                            name="qualifications"
                            id="qualifications"
                            rows={3}
                            defaultValue={profile.qualifications?.join('\n')}
                            disabled={true}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                            Professional Bio
                          </label>
                          <textarea
                            name="bio"
                            id="bio"
                            rows={4}
                            defaultValue={profile.bio}
                            disabled={!isEditing}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                          />
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
                <h2 className="text-lg font-semibold mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mt-6">
                    <p className="text-sm text-gray-500 mb-4">
                      Password should be at least 8 characters long and include at least one uppercase letter,
                      one lowercase letter, one number, and one special character.
                    </p>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
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