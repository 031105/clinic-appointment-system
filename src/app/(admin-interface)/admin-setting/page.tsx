import React, { useState } from 'react';

// Temporary settings data
const tempSettings = {
  general: {
    clinicName: 'Medical Clinic',
    clinicLogo: '/images/logo.png',
    clinicAddress: '123 Main Street, City, Country',
    clinicPhone: '+60 12-345-6789',
    clinicEmail: 'info@medicalclinic.com',
    clinicWebsite: 'www.medicalclinic.com',
    timeZone: 'Asia/Kuala_Lumpur'
  },
  workingHours: {
    monday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
    tuesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
    wednesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
    thursday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
    friday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
    saturday: { isOpen: true, startTime: '09:00', endTime: '14:00' },
    sunday: { isOpen: false, startTime: '09:00', endTime: '18:00' }
  },
  appointments: {
    defaultDuration: 30,
    timeSlotInterval: 15,
    allowSameDayBooking: true,
    maxDaysInAdvance: 30,
    requireApproval: false,
    emailNotifications: true,
    smsNotifications: false
  },
  notifications: {
    templates: {
      appointmentConfirmation: {
        subject: 'Appointment Confirmation',
        body: 'Dear {{patientName}},\n\nYour appointment with {{doctorName}} has been confirmed for {{appointmentDate}} at {{appointmentTime}}.\n\nPlease arrive 15 minutes early to complete any necessary paperwork.\n\nBest regards,\n{{clinicName}} Team'
      },
      appointmentReminder: {
        subject: 'Appointment Reminder',
        body: 'Dear {{patientName}},\n\nThis is a reminder that you have an appointment with {{doctorName}} tomorrow at {{appointmentTime}}.\n\nBest regards,\n{{clinicName}} Team'
      },
      appointmentCancellation: {
        subject: 'Appointment Cancellation',
        body: 'Dear {{patientName}},\n\nYour appointment with {{doctorName}} scheduled for {{appointmentDate}} at {{appointmentTime}} has been cancelled.\n\nPlease contact us to reschedule.\n\nBest regards,\n{{clinicName}} Team'
      }
    },
    sendReminders: {
      enabled: true,
      days: 1
    }
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '00:00',
    storageLocation: 'local',
    retentionDays: 30
  },
  security: {
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90
    },
    loginAttempts: 5,
    twoFactorAuth: false
  }
};

export default function SettingsConfiguration() {
  const [settings, setSettings] = useState(tempSettings);
  const [activeSection, setActiveSection] = useState('general');
  const [selectedTemplate, setSelectedTemplate] = useState('appointmentConfirmation');
  const [isEditing, setIsEditing] = useState(false);
  const [tempEditSettings, setTempEditSettings] = useState({});

  // Handle input change for general settings
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setTempEditSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [name]: value
      }
    }));
  };

  // Handle working hours change
  const handleWorkingHoursChange = (day, field, value) => {
    setTempEditSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: field === 'isOpen' ? value : value
        }
      }
    }));
  };

  // Handle appointments settings change
  const handleAppointmentsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempEditSettings(prev => ({
      ...prev,
      appointments: {
        ...prev.appointments,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  // Handle template change
  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setTempEditSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        templates: {
          ...prev.notifications.templates,
          [selectedTemplate]: {
            ...prev.notifications.templates[selectedTemplate],
            [name]: value
          }
        }
      }
    }));
  };

  // Handle reminder settings change
  const handleReminderChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempEditSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        sendReminders: {
          ...prev.notifications.sendReminders,
          [name]: type === 'checkbox' ? checked : parseInt(value)
        }
      }
    }));
  };

  // Handle backup settings change
  const handleBackupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempEditSettings(prev => ({
      ...prev,
      backup: {
        ...prev.backup,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  // Handle security settings change
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTempEditSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          [parent]: {
            ...prev.security[parent],
            [child]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
          }
        }
      }));
    } else {
      setTempEditSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
        }
      }));
    }
  };

  // Start editing
  const startEditing = () => {
    setTempEditSettings(settings);
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setTempEditSettings({});
    setIsEditing(false);
  };

  // Save settings
  const saveSettings = () => {
    setSettings(tempEditSettings);
    setIsEditing(false);
    setTempEditSettings({});
    // In a real app, you would save to database here
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings & Configuration</h1>
        {!isEditing ? (
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={startEditing}
          >
            Edit Settings
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              onClick={cancelEditing}
            >
              Cancel
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={saveSettings}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="md:w-64 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Settings</h2>
            <nav className="space-y-1">
              <button
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === 'general' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveSection('general')}
              >
                General
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === 'workingHours' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveSection('workingHours')}
              >
                Working Hours
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === 'appointments' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveSection('appointments')}
              >
                Appointments
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === 'notifications' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveSection('notifications')}
              >
                Notifications
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === 'backup' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveSection('backup')}
              >
                Backup
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === 'security' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveSection('security')}
              >
                Security
              </button>
            </nav>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">Clinic Name</label>
                  <input
                    type="text"
                    id="clinicName"
                    name="clinicName"
                    value={isEditing ? tempEditSettings.general.clinicName : settings.general.clinicName}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isEditing}
                  />
                  <label htmlFor="allowSameDayBooking" className="ml-2 text-sm text-gray-700">
                    Allow same day booking
                  </label>
                </div>
                <div className="flex items-center h-full pt-6">
                  <input
                    type="checkbox"
                    id="requireApproval"
                    name="requireApproval"
                    checked={isEditing ? tempEditSettings.appointments.requireApproval : settings.appointments.requireApproval}
                    onChange={handleAppointmentsChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    disabled={!isEditing}
                  />
                  <label htmlFor="requireApproval" className="ml-2 text-sm text-gray-700">
                    Require approval for appointments
                  </label>
                </div>
                <div className="flex items-center h-full">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={isEditing ? tempEditSettings.appointments.emailNotifications : settings.appointments.emailNotifications}
                    onChange={handleAppointmentsChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    disabled={!isEditing}
                  />
                  <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                    Send email notifications
                  </label>
                </div>
                <div className="flex items-center h-full">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    name="smsNotifications"
                    checked={isEditing ? tempEditSettings.appointments.smsNotifications : settings.appointments.smsNotifications}
                    onChange={handleAppointmentsChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    disabled={!isEditing}
                  />
                  <label htmlFor="smsNotifications" className="ml-2 text-sm text-gray-700">
                    Send SMS notifications
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
              
              {/* Email Notification Templates */}
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-3">Email Templates</h3>
                <div className="mb-3">
                  <label htmlFor="templateType" className="block text-sm font-medium text-gray-700">Select Template</label>
                  <select
                    id="templateType"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="appointmentConfirmation">Appointment Confirmation</option>
                    <option value="appointmentReminder">Appointment Reminder</option>
                    <option value="appointmentCancellation">Appointment Cancellation</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={isEditing 
                        ? tempEditSettings.notifications.templates[selectedTemplate].subject 
                        : settings.notifications.templates[selectedTemplate].subject}
                      onChange={handleTemplateChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700">Email Body</label>
                    <textarea
                      id="body"
                      name="body"
                      value={isEditing 
                        ? tempEditSettings.notifications.templates[selectedTemplate].body 
                        : settings.notifications.templates[selectedTemplate].body}
                      onChange={handleTemplateChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="6"
                      disabled={!isEditing}
                    ></textarea>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Available variables:</strong> {{patientName}}, {{doctorName}}, {{appointmentDate}}, {{appointmentTime}}, {{clinicName}}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Reminder Settings */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Appointment Reminders</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendReminders"
                      name="enabled"
                      checked={isEditing 
                        ? tempEditSettings.notifications.sendReminders.enabled 
                        : settings.notifications.sendReminders.enabled}
                      onChange={handleReminderChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      disabled={!isEditing}
                    />
                    <label htmlFor="sendReminders" className="ml-2 text-sm text-gray-700">
                      Send appointment reminders
                    </label>
                  </div>
                  
                  {(isEditing ? tempEditSettings.notifications.sendReminders.enabled : settings.notifications.sendReminders.enabled) && (
                    <div>
                      <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-700">Days before appointment</label>
                      <input
                        type="number"
                        id="reminderDays"
                        name="days"
                        value={isEditing 
                          ? tempEditSettings.notifications.sendReminders.days 
                          : settings.notifications.sendReminders.days}
                        onChange={handleReminderChange}
                        className="mt-1 block w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="7"
                        disabled={!isEditing}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Backup Settings */}
          {activeSection === 'backup' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup & Maintenance</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoBackup"
                    name="autoBackup"
                    checked={isEditing ? tempEditSettings.backup.autoBackup : settings.backup.autoBackup}
                    onChange={handleBackupChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    disabled={!isEditing}
                  />
                  <label htmlFor="autoBackup" className="ml-2 text-sm text-gray-700">
                    Enable automatic backups
                  </label>
                </div>
                
                {(isEditing ? tempEditSettings.backup.autoBackup : settings.backup.autoBackup) && (
                  <div className="space-y-4 ml-6">
                    <div>
                      <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700">Backup Frequency</label>
                      <select
                        id="backupFrequency"
                        name="backupFrequency"
                        value={isEditing ? tempEditSettings.backup.backupFrequency : settings.backup.backupFrequency}
                        onChange={handleBackupChange}
                        className="mt-1 block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={!isEditing}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="backupTime" className="block text-sm font-medium text-gray-700">Backup Time</label>
                      <input
                        type="time"
                        id="backupTime"
                        name="backupTime"
                        value={isEditing ? tempEditSettings.backup.backupTime : settings.backup.backupTime}
                        onChange={handleBackupChange}
                        className="mt-1 block md:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label htmlFor="retentionDays" className="block text-sm font-medium text-gray-700">Retention Period (days)</label>
                      <input
                        type="number"
                        id="retentionDays"
                        name="retentionDays"
                        value={isEditing ? tempEditSettings.backup.retentionDays : settings.backup.retentionDays}
                        onChange={handleBackupChange}
                        className="mt-1 block md:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label htmlFor="storageLocation" className="block text-sm font-medium text-gray-700">Storage Location</label>
                      <select
                        id="storageLocation"
                        name="storageLocation"
                        value={isEditing ? tempEditSettings.backup.storageLocation : settings.backup.storageLocation}
                        onChange={handleBackupChange}
                        className="mt-1 block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={!isEditing}
                      >
                        <option value="local">Local Storage</option>
                        <option value="cloud">Cloud Storage</option>
                      </select>
                    </div>
                  </div>
                )}
                
                <div className="pt-4">
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    disabled={!(!isEditing || tempEditSettings.backup.autoBackup)}
                  >
                    Backup Now
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Security Settings */}
          {activeSection === 'security' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3">Session Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        id="sessionTimeout"
                        name="sessionTimeout"
                        value={isEditing ? tempEditSettings.security.sessionTimeout : settings.security.sessionTimeout}
                        onChange={handleSecurityChange}
                        className="mt-1 block md:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="5"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label htmlFor="loginAttempts" className="block text-sm font-medium text-gray-700">Maximum Login Attempts</label>
                      <input
                        type="number"
                        id="loginAttempts"
                        name="loginAttempts"
                        value={isEditing ? tempEditSettings.security.loginAttempts : settings.security.loginAttempts}
                        onChange={handleSecurityChange}
                        className="mt-1 block md:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="twoFactorAuth"
                        name="twoFactorAuth"
                        checked={isEditing ? tempEditSettings.security.twoFactorAuth : settings.security.twoFactorAuth}
                        onChange={handleSecurityChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        disabled={!isEditing}
                      />
                      <label htmlFor="twoFactorAuth" className="ml-2 text-sm text-gray-700">
                        Enable two-factor authentication
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3">Password Policy</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="minLength" className="block text-sm font-medium text-gray-700">Minimum Password Length</label>
                      <input
                        type="number"
                        id="minLength"
                        name="passwordPolicy.minLength"
                        value={isEditing ? tempEditSettings.security.passwordPolicy.minLength : settings.security.passwordPolicy.minLength}
                        onChange={handleSecurityChange}
                        className="mt-1 block md:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="6"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireUppercase"
                        name="passwordPolicy.requireUppercase"
                        checked={isEditing ? tempEditSettings.security.passwordPolicy.requireUppercase : settings.security.passwordPolicy.requireUppercase}
                        onChange={handleSecurityChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        disabled={!isEditing}
                      />
                      <label htmlFor="requireUppercase" className="ml-2 text-sm text-gray-700">
                        Require uppercase letters
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireLowercase"
                        name="passwordPolicy.requireLowercase"
                        checked={isEditing ? tempEditSettings.security.passwordPolicy.requireLowercase : settings.security.passwordPolicy.requireLowercase}
                        onChange={handleSecurityChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        disabled={!isEditing}
                      />
                      <label htmlFor="requireLowercase" className="ml-2 text-sm text-gray-700">
                        Require lowercase letters
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireNumbers"
                        name="passwordPolicy.requireNumbers"
                        checked={isEditing ? tempEditSettings.security.passwordPolicy.requireNumbers : settings.security.passwordPolicy.requireNumbers}
                        onChange={handleSecurityChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        disabled={!isEditing}
                      />
                      <label htmlFor="requireNumbers" className="ml-2 text-sm text-gray-700">
                        Require numbers
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireSpecialChars"
                        name="passwordPolicy.requireSpecialChars"
                        checked={isEditing ? tempEditSettings.security.passwordPolicy.requireSpecialChars : settings.security.passwordPolicy.requireSpecialChars}
                        onChange={handleSecurityChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        disabled={!isEditing}
                      />
                      <label htmlFor="requireSpecialChars" className="ml-2 text-sm text-gray-700">
                        Require special characters
                      </label>
                    </div>
                    <div>
                      <label htmlFor="expiryDays" className="block text-sm font-medium text-gray-700">Password Expiry (days)</label>
                      <input
                        type="number"
                        id="expiryDays"
                        name="passwordPolicy.expiryDays"
                        value={isEditing ? tempEditSettings.security.passwordPolicy.expiryDays : settings.security.passwordPolicy.expiryDays}
                        onChange={handleSecurityChange}
                        className="mt-1 block md:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        disabled={!isEditing}
                      />
                      <p className="mt-1 text-sm text-gray-500">Set to 0 for no expiry</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// API functions to connect with backend later
export const settingsApi = {
  // Get all settings
  getSettings: async () => {
    // This will be replaced with actual API call
    // Example: return await fetch('/api/settings')
    return tempSettings; // Currently returns mock data
  },
  
  // Update settings
  updateSettings: async (settingsData) => {
    // Example:
    // return await fetch('/api/settings', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(settingsData)
    // })
    console.log('Updating settings:', settingsData);
    return { success: true }; // Mock response
  },
  
  // Perform manual backup
  performBackup: async () => {
    // Example:
    // return await fetch('/api/settings/backup', {
    //   method: 'POST'
    // })
    console.log('Performing manual backup');
    return { success: true, backupId: Date.now().toString() }; // Mock response
  }
};
                  />
                </div>
                <div>
                  <label htmlFor="clinicLogo" className="block text-sm font-medium text-gray-700">Clinic Logo</label>
                  <input
                    type="text"
                    id="clinicLogo"
                    name="clinicLogo"
                    value={isEditing ? tempEditSettings.general.clinicLogo : settings.general.clinicLogo}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor="clinicPhone" className="block text-sm font-medium text-gray-700">Clinic Phone</label>
                  <input
                    type="text"
                    id="clinicPhone"
                    name="clinicPhone"
                    value={isEditing ? tempEditSettings.general.clinicPhone : settings.general.clinicPhone}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor="clinicEmail" className="block text-sm font-medium text-gray-700">Clinic Email</label>
                  <input
                    type="email"
                    id="clinicEmail"
                    name="clinicEmail"
                    value={isEditing ? tempEditSettings.general.clinicEmail : settings.general.clinicEmail}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="clinicAddress" className="block text-sm font-medium text-gray-700">Clinic Address</label>
                  <textarea
                    id="clinicAddress"
                    name="clinicAddress"
                    value={isEditing ? tempEditSettings.general.clinicAddress : settings.general.clinicAddress}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    disabled={!isEditing}
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="clinicWebsite" className="block text-sm font-medium text-gray-700">Clinic Website</label>
                  <input
                    type="text"
                    id="clinicWebsite"
                    name="clinicWebsite"
                    value={isEditing ? tempEditSettings.general.clinicWebsite : settings.general.clinicWebsite}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">Time Zone</label>
                  <select
                    id="timeZone"
                    name="timeZone"
                    value={isEditing ? tempEditSettings.general.timeZone : settings.general.timeZone}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isEditing}
                  >
                    <option value="Asia/Kuala_Lumpur">Malaysia (UTC+8)</option>
                    <option value="Asia/Singapore">Singapore (UTC+8)</option>
                    <option value="Asia/Jakarta">Indonesia (UTC+7)</option>
                    <option value="Asia/Bangkok">Thailand (UTC+7)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Working Hours Settings */}
          {activeSection === 'workingHours' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h2>
              <div className="space-y-4">
                {Object.entries(isEditing ? tempEditSettings.workingHours : settings.workingHours).map(([day, hours]) => (
                  <div key={day} className="grid grid-cols-4 gap-4 items-center">
                    <div className="col-span-1 font-medium capitalize">{day}</div>
                    <div className="col-span-3 flex items-center gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${day}-isOpen`}
                          checked={hours.isOpen}
                          onChange={(e) => handleWorkingHoursChange(day, 'isOpen', e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          disabled={!isEditing}
                        />
                        <label htmlFor={`${day}-isOpen`} className="ml-2 text-sm text-gray-700">
                          Open
                        </label>
                      </div>
                      
                      {hours.isOpen && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={hours.startTime}
                            onChange={(e) => handleWorkingHoursChange(day, 'startTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded"
                            disabled={!isEditing}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={hours.endTime}
                            onChange={(e) => handleWorkingHoursChange(day, 'endTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded"
                            disabled={!isEditing}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Appointments Settings */}
          {activeSection === 'appointments' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="defaultDuration" className="block text-sm font-medium text-gray-700">Default Duration (minutes)</label>
                  <input
                    type="number"
                    id="defaultDuration"
                    name="defaultDuration"
                    value={isEditing ? tempEditSettings.appointments.defaultDuration : settings.appointments.defaultDuration}
                    onChange={handleAppointmentsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isEditing}
                    min="5"
                    step="5"
                  />
                </div>
                <div>
                  <label htmlFor="timeSlotInterval" className="block text-sm font-medium text-gray-700">Time Slot Interval (minutes)</label>
                  <input
                    type="number"
                    id="timeSlotInterval"
                    name="timeSlotInterval"
                    value={isEditing ? tempEditSettings.appointments.timeSlotInterval : settings.appointments.timeSlotInterval}
                    onChange={handleAppointmentsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isEditing}
                    min="5"
                    step="5"
                  />
                </div>
                <div>
                  <label htmlFor="maxDaysInAdvance" className="block text-sm font-medium text-gray-700">Maximum Days in Advance</label>
                  <input
                    type="number"
                    id="maxDaysInAdvance"
                    name="maxDaysInAdvance"
                    value={isEditing ? tempEditSettings.appointments.maxDaysInAdvance : settings.appointments.maxDaysInAdvance}
                    onChange={handleAppointmentsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isEditing}
                    min="1"
                  />
                </div>
                <div className="flex items-center h-full pt-6">
                  <input
                    type="checkbox"
                    id="allowSameDayBooking"
                    name="allowSameDayBooking"
                    checked={isEditing ? tempEditSettings.appointments.allowSameDayBooking : settings.appointments.allowSameDayBooking}
                    onChange={handleAppointmentsChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    disabled={!isEditing}