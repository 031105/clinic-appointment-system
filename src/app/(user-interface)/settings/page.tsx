'use client';

import React, { useState } from 'react';
import { ChevronRightIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Input from '@/components/forms/Input';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Profile state
  const [profileImage, setProfileImage] = useState('/placeholder.jpg');
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [address, setAddress] = useState('123 Main St, Anytown, USA');
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Reminder settings state
  const [emailReminders, setEmailReminders] = useState(true);
  const [smsReminders, setSmsReminders] = useState(true);
  const [reminderTiming, setReminderTiming] = useState('1-day');
  
  // Allergies state
  const [allergies, setAllergies] = useState([
    { id: 1, name: 'Penicillin', severity: 'High' },
    { id: 2, name: 'Peanuts', severity: 'Medium' }
  ]);
  const [newAllergy, setNewAllergy] = useState('');
  const [allergySeverity, setAllergySeverity] = useState('Medium');
  const [editingAllergyId, setEditingAllergyId] = useState(null);
  
  // Emergency contact state
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'Jane Doe', relationship: 'Spouse', phone: '+1 (555) 987-6543' }
  ]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [editingContactId, setEditingContactId] = useState(null);
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [qrCode, setQrCode] = useState('/qr-placeholder.png');
  
  const handleProfileSave = () => {
    setEditingProfile(false);
    showSuccessToast('Profile updated successfully!');
  };
  
  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showSuccessToast('Password changed successfully!');
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    
    if (editingAllergyId !== null) {
      setAllergies(allergies.map(allergy => 
        allergy.id === editingAllergyId 
          ? { ...allergy, name: newAllergy, severity: allergySeverity } 
          : allergy
      ));
      setEditingAllergyId(null);
    } else {
      const newId = allergies.length > 0 ? Math.max(...allergies.map(a => a.id)) + 1 : 1;
      setAllergies([...allergies, { id: newId, name: newAllergy, severity: allergySeverity }]);
    }
    
    setNewAllergy('');
    setAllergySeverity('Medium');
    showSuccessToast('Allergy information updated');
  };
  
  const handleEditAllergy = (id) => {
    const allergy = allergies.find(a => a.id === id);
    if (allergy) {
      setNewAllergy(allergy.name);
      setAllergySeverity(allergy.severity);
      setEditingAllergyId(id);
    }
  };
  
  const handleDeleteAllergy = (id) => {
    setAllergies(allergies.filter(allergy => allergy.id !== id));
    showSuccessToast('Allergy removed');
  };
  
  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    
    if (editingContactId !== null) {
      setEmergencyContacts(emergencyContacts.map(contact => 
        contact.id === editingContactId 
          ? { ...contact, name: newContactName, relationship: newContactRelationship, phone: newContactPhone } 
          : contact
      ));
      setEditingContactId(null);
    } else {
      const newId = emergencyContacts.length > 0 ? Math.max(...emergencyContacts.map(c => c.id)) + 1 : 1;
      setEmergencyContacts([...emergencyContacts, { 
        id: newId, 
        name: newContactName, 
        relationship: newContactRelationship, 
        phone: newContactPhone 
      }]);
    }
    
    setNewContactName('');
    setNewContactRelationship('');
    setNewContactPhone('');
    showSuccessToast('Emergency contact updated');
  };
  
  const handleEditContact = (id) => {
    const contact = emergencyContacts.find(c => c.id === id);
    if (contact) {
      setNewContactName(contact.name);
      setNewContactRelationship(contact.relationship);
      setNewContactPhone(contact.phone);
      setEditingContactId(id);
    }
  };
  
  const handleDeleteContact = (id) => {
    setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id));
    showSuccessToast('Emergency contact removed');
  };
  
  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      // Here you would typically generate a QR code from the backend
      setShowVerificationForm(true);
    } else {
      setTwoFactorEnabled(false);
      showSuccessToast('Two-factor authentication disabled');
    }
  };
  
  const handleVerify2FA = () => {
    // Here you would normally verify the code with the backend
    if (verificationCode === '123456') { // Simulated correct code
      setTwoFactorEnabled(true);
      setShowVerificationForm(false);
      setVerificationCode('');
      showSuccessToast('Two-factor authentication enabled');
    } else {
      showErrorToast('Invalid verification code');
    }
  };
  
  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const showErrorToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar navigation */}
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <nav className="flex flex-col">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center justify-between px-4 py-3 text-left ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span>Profile Information</span>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex items-center justify-between px-4 py-3 text-left ${
                  activeTab === 'password'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span>Password</span>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`flex items-center justify-between px-4 py-3 text-left ${
                  activeTab === 'reminders'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span>Reminder Settings</span>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('allergies')}
                className={`flex items-center justify-between px-4 py-3 text-left ${
                  activeTab === 'allergies'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span>Allergies</span>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('emergency')}
                className={`flex items-center justify-between px-4 py-3 text-left ${
                  activeTab === 'emergency'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span>Emergency Contacts</span>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('2fa')}
                className={`flex items-center justify-between px-4 py-3 text-left ${
                  activeTab === '2fa'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span>Two-Factor Authentication</span>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </nav>
          </Card>
        </div>

        {/* Main content area */}
        <div className="md:col-span-3">
          {/* Profile Information */}
          {activeTab === 'profile' && (
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <Button
                    variant={editingProfile ? "primary" : "outline"}
                    onClick={() => {
                      if (editingProfile) {
                        handleProfileSave();
                      } else {
                        setEditingProfile(true);
                      }
                    }}
                  >
                    {editingProfile ? "Save Changes" : "Edit Profile"}
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-full md:w-auto flex flex-col items-center gap-2">
                    <div className="relative group">
                      <Avatar 
                        src={profileImage}
                        alt={name}
                        size="lg"
                        className="w-32 h-32"
                      />
                      {editingProfile && (
                        <label 
                          htmlFor="profile-upload" 
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                        >
                          <PencilIcon className="h-6 w-6" />
                          <input 
                            id="profile-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileUpload}
                          />
                        </label>
                      )}
                    </div>
                    {editingProfile && (
                      <p className="text-sm text-gray-500">Click to change</p>
                    )}
                  </div>

                  <div className="w-full space-y-4">
                    <Input
                      label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!editingProfile}
                      fullWidth
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!editingProfile}
                      fullWidth
                    />
                    <Input
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!editingProfile}
                      fullWidth
                    />
                    <Input
                      label="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!editingProfile}
                      fullWidth
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Password */}
          {activeTab === 'password' && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    fullWidth
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    helperText="Password must be at least 8 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    error={newPassword !== confirmPassword ? "Passwords don't match" : ""}
                  />
                  <div className="pt-2">
                    <Button 
                      variant="primary"
                      onClick={handlePasswordChange}
                      disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Reminder Settings */}
          {activeTab === 'reminders' && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Reminder Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-3">Notification Methods</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={emailReminders}
                          onChange={() => setEmailReminders(!emailReminders)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">Email Reminders</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={smsReminders}
                          onChange={() => setSmsReminders(!smsReminders)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">SMS Reminders</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-3">Reminder Timing</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reminderTiming"
                          value="1-hour"
                          checked={reminderTiming === '1-hour'}
                          onChange={() => setReminderTiming('1-hour')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">1 Hour Before</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reminderTiming"
                          value="3-hours"
                          checked={reminderTiming === '3-hours'}
                          onChange={() => setReminderTiming('3-hours')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">3 Hours Before</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reminderTiming"
                          value="1-day"
                          checked={reminderTiming === '1-day'}
                          onChange={() => setReminderTiming('1-day')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">1 Day Before</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="primary"
                      onClick={() => showSuccessToast('Reminder settings updated')}
                    >
                      Save Reminder Settings
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Allergies */}
          {activeTab === 'allergies' && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Allergies</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    {allergies.length > 0 ? (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                          {allergies.map((allergy) => (
                            <li key={allergy.id} className="flex items-center justify-between p-4">
                              <div>
                                <h3 className="font-medium text-gray-900">{allergy.name}</h3>
                                <div className="flex items-center mt-1">
                                  <span className="text-sm text-gray-500">Severity:</span>
                                  <span className={`ml-2 text-sm font-medium px-2 py-0.5 rounded-full ${
                                    allergy.severity === 'High' 
                                      ? 'bg-red-100 text-red-800' 
                                      : allergy.severity === 'Medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                  }`}>
                                    {allergy.severity}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleEditAllergy(allergy.id)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAllergy(allergy.id)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No allergies added yet</p>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-base font-medium text-gray-900 mb-3">
                        {editingAllergyId !== null ? 'Edit Allergy' : 'Add New Allergy'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Allergy name"
                          value={newAllergy}
                          onChange={(e) => setNewAllergy(e.target.value)}
                          fullWidth
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Severity
                          </label>
                          <select
                            value={allergySeverity}
                            onChange={(e) => setAllergySeverity(e.target.value)}
                            className="block w-full px-3 py-2 text-base rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="primary"
                          onClick={handleAddAllergy}
                          disabled={!newAllergy.trim()}
                        >
                          {editingAllergyId !== null ? 'Update Allergy' : 'Add Allergy'}
                        </Button>
                        {editingAllergyId !== null && (
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setEditingAllergyId(null);
                              setNewAllergy('');
                              setAllergySeverity('Medium');
                            }}
                            className="ml-2"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Emergency Contacts */}
          {activeTab === 'emergency' && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Emergency Contacts</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    {emergencyContacts.length > 0 ? (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                          {emergencyContacts.map((contact) => (
                            <li key={contact.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4">
                              <div>
                                <h3 className="font-medium text-gray-900">{contact.name}</h3>
                                <p className="text-sm text-gray-500">{contact.relationship}</p>
                                <p className="text-sm text-gray-600 mt-1">{contact.phone}</p>
                              </div>
                              <div className="flex gap-2 mt-2 sm:mt-0">
                                <button 
                                  onClick={() => handleEditContact(contact.id)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteContact(contact.id)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No emergency contacts added yet</p>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-base font-medium text-gray-900 mb-3">
                        {editingContactId !== null ? 'Edit Contact' : 'Add New Emergency Contact'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Full Name"
                          value={newContactName}
                          onChange={(e) => setNewContactName(e.target.value)}
                          fullWidth
                        />
                        <Input
                          placeholder="Relationship"
                          value={newContactRelationship}
                          onChange={(e) => setNewContactRelationship(e.target.value)}
                          fullWidth
                        />
                      </div>
                      <div className="mt-4">
                        <Input
                          placeholder="Phone Number"
                          value={newContactPhone}
                          onChange={(e) => setNewContactPhone(e.target.value)}
                          fullWidth
                        />
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="primary"
                          onClick={handleAddContact}
                          disabled={!newContactName.trim() || !newContactPhone.trim()}
                        >
                          {editingContactId !== null ? 'Update Contact' : 'Add Contact'}
                        </Button>
                        {editingContactId !== null && (
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setEditingContactId(null);
                              setNewContactName('');
                              setNewContactRelationship('');
                              setNewContactPhone('');
                            }}
                            className="ml-2"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Two-Factor Authentication */}
          {activeTab === '2fa' && (
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
                  <div className="flex items-center">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm font-medium">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                    <p className="text-gray-600">
                        Two-factor authentication adds an extra layer of security to your account. When enabled, you will need to provide a verification code in addition to your password when signing in.
                    </p>
                    
                    {showVerificationForm ? (
                        <div className="bg-gray-50 p-4 rounded-lg mt-4">
                        <div className="mb-4 text-center">
                            <p className="text-sm text-gray-600 mb-4">Scan this QR code with your authenticator app, then enter the verification code below.</p>
                            <div className="inline-block border border-gray-200 p-2 bg-white">
                            <img 
                                src={qrCode}
                                alt="2FA QR Code"
                                className="h-48 w-48 object-contain"
                            />
                            </div>
                        </div>
                        
                        <div className="max-w-xs mx-auto">
                            <Input
                            label="Verification Code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            fullWidth
                            />
                            <div className="mt-4 flex justify-center gap-2">
                            <Button 
                                variant="primary"
                                onClick={handleVerify2FA}
                                disabled={!verificationCode}
                            >
                                Verify Code
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => {
                                setShowVerificationForm(false);
                                setVerificationCode('');
                                }}
                            >
                                Cancel
                            </Button>
                            </div>
                        </div>
                        </div>
                    ) : (
                        <Button 
                        variant={twoFactorEnabled ? "outline" : "primary"}
                        onClick={handleToggle2FA}
                        className={twoFactorEnabled ? "border-red-500 text-red-600 hover:bg-red-50" : ""}
                        >
                        {twoFactorEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
                        </Button>
                    )}
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Account Deletion */}
              {activeTab === 'delete-account' && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Delete Account</h2>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Warning: Account Deletion is Permanent</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>
                              This action cannot be undone. Once you delete your account, all of your data, including medical history, appointments, and personal information will be permanently removed from our system.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Input
                        label="Confirm your password"
                        type="password"
                        placeholder="Enter your current password"
                        fullWidth
                      />
                      
                      <div className="flex items-center">
                        <input
                          id="confirm-delete"
                          type="checkbox"
                          className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor="confirm-delete" className="ml-2 block text-sm text-gray-700">
                          I understand that this action is permanent and cannot be undone
                        </label>
                      </div>
                      
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() => showErrorToast('Account deletion is not available in the demo')}
                      >
                        Delete My Account
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
    
          {showToast && (
            <Toast
              message={toastMessage}
              type={toastMessage.toLowerCase().includes('error') ? 'error' : 'success'}
              onClose={() => setShowToast(false)}
            />
        )}
    </div>
  );
};
    
export default SettingsPage;