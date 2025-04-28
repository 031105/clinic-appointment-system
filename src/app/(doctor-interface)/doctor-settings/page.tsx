'use client';

import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Upload } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'privacy'>('profile');
  
  // Profile form state
  const [profile, setProfile] = useState({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@clinic.com',
    phone: '+60 12-345-6789',
    department: 'Cardiology',
    specialization: 'Interventional Cardiology',
    bio: 'Board-certified cardiologist with over 10 years of experience in diagnosing and treating heart conditions.',
    qualifications: 'MD, University of Malaysia Medical School\nCardiology Fellowship, National Heart Institute',
    language: 'English, Malay, Mandarin',
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailAppointment: true,
    emailReminders: true,
    emailUpdates: false,
    smsAppointment: true,
    smsReminders: true,
    smsUpdates: false,
    inAppNotifications: true,
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showProfilePublicly: true,
    allowPatientReviews: true,
    shareDataForResearch: false,
  });
  
  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the updated profile to the server
    console.log('Updated profile:', profile);
    // Show success message
    alert('Profile updated successfully!');
  };
  
  // Handle password update
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    // In a real app, this would send the password update request to the server
    console.log('Password update request:', passwordForm);
    
    // Reset form and show success message
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    alert('Password updated successfully!');
  };
  
  // Handle notification settings update
  const handleNotificationSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the updated notification settings to the server
    console.log('Updated notification settings:', notificationSettings);
    // Show success message
    alert('Notification settings updated successfully!');
  };
  
  // Handle privacy settings update
  const handlePrivacySettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the updated privacy settings to the server
    console.log('Updated privacy settings:', privacySettings);
    // Show success message
    alert('Privacy settings updated successfully!');
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
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="h-5 w-5 mr-3" />
                Notifications
              </button>
              <button
                className={`w-full flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'privacy'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('privacy')}
              >
                <Shield className="h-5 w-5 mr-3" />
                Privacy
              </button>
            </nav>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold mb-6">Profile Settings</h2>
                
                {/* Profile Picture */}
                <div className="mb-6">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm border border-gray-200">
                        <Upload className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Profile Picture</p>
                      <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 2MB</p>
                      <button className="mt-2 text-sm text-blue-600 font-medium">Upload new image</button>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        id="department"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={profile.specialization}
                        onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                        Languages
                      </label>
                      <input
                        type="text"
                        id="language"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={profile.language}
                        onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Bio
                      </label>
                      <textarea
                        id="bio"
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-1">
                        Qualifications
                      </label>
                      <textarea
                        id="qualifications"
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={profile.qualifications}
                        onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Password Settings */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-lg font-semibold mb-6">Password Settings</h2>
                
                <form onSubmit={handlePasswordUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm text-gray-500 mb-4">
                      Password should be at least 8 characters long and include at least one uppercase letter, 
                      one lowercase letter, one number, and one special character.
                    </p>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold mb-6">Notification Settings</h2>
                
                <form onSubmit={handleNotificationSettingsUpdate}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Email Notifications</h3>
                      <div className="mt-2 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="emailAppointment"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={notificationSettings.emailAppointment}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                emailAppointment: e.target.checked
                              })}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="emailAppointment" className="font-medium text-gray-700">
                              Appointment Confirmations
                            </label>
                            <p className="text-gray-500">
                              Receive emails when appointments are scheduled, confirmed, or cancelled.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="emailReminders"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={notificationSettings.emailReminders}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                emailReminders: e.target.checked
                              })}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="emailReminders" className="font-medium text-gray-700">
                              Appointment Reminders
                            </label>
                            <p className="text-gray-500">
                              Receive email reminders before your scheduled appointments.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="emailUpdates"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={notificationSettings.emailUpdates}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                emailUpdates: e.target.checked
                              })}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="emailUpdates" className="font-medium text-gray-700">
                              System Updates
                            </label>
                            <p className="text-gray-500">
                              Receive emails about system updates, new features, and announcements.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium text-gray-900">SMS Notifications</h3>
                      <div className="mt-2 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="smsAppointment"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={notificationSettings.smsAppointment}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                smsAppointment: e.target.checked
                              })}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="smsAppointment" className="font-medium text-gray-700">
                              Appointment Confirmations
                            </label>
                            <p className="text-gray-500">
                              Receive SMS messages when appointments are scheduled, confirmed, or cancelled.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="smsReminders"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={notificationSettings.smsReminders}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                smsReminders: e.target.checked
                              })}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="smsReminders" className="font-medium text-gray-700">
                              Appointment Reminders
                            </label>
                            <p className="text-gray-500">
                              Receive SMS reminders before your scheduled appointments.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium text-gray-900">In-App Notifications</h3>
                      <div className="mt-2 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="inAppNotifications"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={notificationSettings.inAppNotifications}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                inAppNotifications: e.target.checked
                              })}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="inAppNotifications" className="font-medium text-gray-700">
                              Enable In-App Notifications
                            </label>
                            <p className="text-gray-500">
                              Receive notifications within the application for all important events.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                    >
                      Save Notification Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-lg font-semibold mb-6">Privacy Settings</h2>
                
                <form onSubmit={handlePrivacySettingsUpdate}>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="showProfilePublicly"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={privacySettings.showProfilePublicly}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            showProfilePublicly: e.target.checked
                          })}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="showProfilePublicly" className="font-medium text-gray-700">
                          Show Profile Publicly
                        </label>
                        <p className="text-gray-500">
                          Allow your profile to be displayed on the clinic's website and public doctor directory.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="allowPatientReviews"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={privacySettings.allowPatientReviews}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            allowPatientReviews: e.target.checked
                          })}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="allowPatientReviews" className="font-medium text-gray-700">
                          Allow Patient Reviews
                        </label>
                        <p className="text-gray-500">
                          Allow patients to leave reviews and ratings for your services.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="shareDataForResearch"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={privacySettings.shareDataForResearch}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            shareDataForResearch: e.target.checked
                          })}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="shareDataForResearch" className="font-medium text-gray-700">
                          Share Data for Research
                        </label>
                        <p className="text-gray-500">
                          Allow anonymized data to be used for medical research and system improvements. No personal information will be shared.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                    >
                      Save Privacy Settings
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