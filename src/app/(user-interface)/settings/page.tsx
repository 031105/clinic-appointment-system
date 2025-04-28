'use client';

import React, { useState } from 'react';
import { ChevronRightIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/use-toast';
import Card from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { z } from "zod";

// Form validation schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data: { newPassword: string; confirmPassword: string; }) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  helperText, 
  error, 
  className = "", 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input
        className={`w-full ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {helperText && <p className="text-sm text-gray-500">{helperText}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
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
  const [editingAllergyId, setEditingAllergyId] = useState<number | null>(null);
  
  // Emergency contact state
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'Jane Doe', relationship: 'Spouse', phone: '+1 (555) 987-6543' }
  ]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [qrCode, setQrCode] = useState('/qr-placeholder.png');
  
  const handleProfileSave = async () => {
    try {
      const result = profileSchema.safeParse({
        name,
        email,
        phone,
        address,
      });

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error.issues[0].message,
          variant: "destructive",
        });
        return;
      }

      // TODO: API call to save profile
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };
  
  const handlePasswordChange = async () => {
    try {
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

      // TODO: API call to change password
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
        }
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
    toast({
      title: 'Success',
      description: 'Allergy information updated',
      variant: 'default',
    });
  };
  
  const handleAddEmergencyContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim() || !newContactRelationship.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all contact fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingContactId !== null) {
      setEmergencyContacts(contacts => contacts.map(contact =>
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
    toast({
      title: 'Success',
      description: 'Emergency contact updated',
      variant: 'default',
    });
  };
  
  const handleVerify2FA = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setTwoFactorEnabled(true);
    setShowVerificationForm(false);
    setVerificationCode('');
    toast({
      title: 'Success',
      description: 'Two-factor authentication enabled successfully',
      variant: 'default',
    });
  };

  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      toast({
        title: 'Success',
        description: 'Two-factor authentication disabled',
        variant: 'default',
      });
    } else {
      setShowVerificationForm(true);
    }
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
                    <FormInput
                      label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!editingProfile}
                    />
                    <FormInput
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!editingProfile}
                    />
                    <FormInput
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!editingProfile}
                    />
                    <FormInput
                      label="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!editingProfile}
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
                  <FormInput
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <FormInput
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    helperText="Password must be at least 6 characters"
                  />
                  <FormInput
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={newPassword !== confirmPassword ? "Passwords don't match" : undefined}
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
                      onClick={() => toast({
                        title: 'Success',
                        description: 'Reminder settings updated',
                        variant: 'default',
                      })}
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
                  {/* Existing allergies */}
                  <div className="space-y-4">
                    {allergies.map((allergy) => (
                      <div 
                        key={allergy.id}
                        className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100"
                      >
                        <div>
                          <div className="font-medium">{allergy.name}</div>
                          <div className="text-sm text-gray-500">Severity: {allergy.severity}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setNewAllergy(allergy.name);
                              setAllergySeverity(allergy.severity);
                              setEditingAllergyId(allergy.id);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setAllergies(allergies.filter(a => a.id !== allergy.id));
                              toast({
                                title: 'Success',
                                description: 'Allergy removed',
                                variant: 'default',
                              });
                            }}
                          >
                            <PlusIcon className="h-4 w-4 rotate-45" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add/Edit allergy form */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-base font-medium text-gray-900 mb-3">
                      {editingAllergyId !== null ? 'Edit Allergy' : 'Add New Allergy'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        placeholder="Allergy name"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                      />
                      <div>
                        <Label>Severity</Label>
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
                  {/* Existing contacts */}
                  <div className="space-y-4">
                    {emergencyContacts.map((contact) => (
                      <div 
                        key={contact.id}
                        className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100"
                      >
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.relationship}</div>
                          <div className="text-sm text-gray-500">{contact.phone}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setNewContactName(contact.name);
                              setNewContactRelationship(contact.relationship);
                              setNewContactPhone(contact.phone);
                              setEditingContactId(contact.id);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEmergencyContacts(contacts => contacts.filter(c => c.id !== contact.id));
                              toast({
                                title: 'Success',
                                description: 'Emergency contact removed',
                                variant: 'default',
                              });
                            }}
                          >
                            <PlusIcon className="h-4 w-4 rotate-45" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add/Edit contact form */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-base font-medium text-gray-900 mb-3">
                      {editingContactId !== null ? 'Edit Contact' : 'Add New Emergency Contact'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        placeholder="Full Name"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                      />
                      <FormInput
                        placeholder="Relationship"
                        value={newContactRelationship}
                        onChange={(e) => setNewContactRelationship(e.target.value)}
                      />
                    </div>
                    <div className="mt-4">
                      <FormInput
                        placeholder="Phone Number"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                      />
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="primary"
                        onClick={handleAddEmergencyContact}
                        disabled={!newContactName.trim() || !newContactPhone.trim() || !newContactRelationship.trim()}
                      >
                        {editingContactId !== null ? 'Update Contact' : 'Add Contact'}
                      </Button>
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
                        <FormInput
                          label="Verification Code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
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
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;