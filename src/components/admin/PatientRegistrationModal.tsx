'use client';

import React, { useState } from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, Heart } from 'lucide-react';
import { CreatePatientRequest } from '@/lib/api/admin-patients-client';
import { 
  validateName, 
  validateEmail, 
  validateMalaysiaPhone, 
  validateAge,
  validateNumber,
  sanitizeText,
  validateFields
} from '@/utils/validation';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePatientRequest) => Promise<void>;
  loading?: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  bloodType: string;
  height: string;
  weight: string;
  allergies: Array<{ name: string; severity: 'mild' | 'moderate' | 'severe' }>;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  height?: string;
  weight?: string;
  allergyName?: string;
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function PatientRegistrationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false 
}: PatientRegistrationModalProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    bloodType: '',
    height: '',
    weight: '',
    allergies: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [newAllergy, setNewAllergy] = useState({ name: '', severity: 'mild' as const });

  // Clear specific error when user starts typing
  const clearError = (fieldName: keyof FormErrors) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const validationResults = {
      firstName: validateName(formData.firstName, 'First name'),
      lastName: validateName(formData.lastName, 'Last name'),
      email: validateEmail(formData.email),
      phone: validateMalaysiaPhone(formData.phone, true),
      dateOfBirth: validateAge(formData.dateOfBirth, 0, 150),
      address: formData.address ? 
        (formData.address.trim().length > 500 ? 
          { isValid: false, error: 'Address must be less than 500 characters' } : 
          { isValid: true }) : 
        { isValid: true },
      height: formData.height ? 
        validateNumber(formData.height, 30, 300, 'Height', false, true) : 
        { isValid: true },
      weight: formData.weight ? 
        validateNumber(formData.weight, 0.5, 1000, 'Weight', false, true) : 
        { isValid: true }
    };

    const { isValid, errors: validationErrors } = validateFields(validationResults);
    setErrors(validationErrors);
    return isValid;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: sanitizeText(value) }));
    clearError(field as keyof FormErrors);
  };

  const addAllergy = () => {
    const allergyName = sanitizeText(newAllergy.name);
    
    if (!allergyName) {
      setErrors(prev => ({ ...prev, allergyName: 'Allergy name is required' }));
      return;
    }

    if (allergyName.length > 100) {
      setErrors(prev => ({ ...prev, allergyName: 'Allergy name must be less than 100 characters' }));
      return;
    }

    if (formData.allergies.some(a => a.name.toLowerCase() === allergyName.toLowerCase())) {
      setErrors(prev => ({ ...prev, allergyName: 'This allergy is already added' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, { name: allergyName, severity: newAllergy.severity }]
    }));
    setNewAllergy({ name: '', severity: 'mild' });
    clearError('allergyName');
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreatePatientRequest = {
      firstName: sanitizeText(formData.firstName),
      lastName: sanitizeText(formData.lastName),
      email: sanitizeText(formData.email),
      phone: sanitizeText(formData.phone),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      address: formData.address ? sanitizeText(formData.address) : undefined,
      bloodType: formData.bloodType || undefined,
      height: formData.height ? Number(formData.height) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      allergies: formData.allergies.length > 0 ? formData.allergies : undefined
    };

    try {
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Failed to create patient:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      bloodType: '',
      height: '',
      weight: '',
      allergies: []
    });
    setErrors({});
    setNewAllergy({ name: '', severity: 'mild' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Register New Patient</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                  placeholder="patient@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="012-345 6789"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Malaysia phone number format</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                  placeholder="Enter patient's address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Medical Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Type
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Select blood type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="170"
                  min="30"
                  max="300"
                  step="0.1"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.height ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.height && (
                  <p className="text-red-500 text-sm mt-1">{errors.height}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="70"
                  min="0.5"
                  max="1000"
                  step="0.1"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.weight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
                )}
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergies</h3>
            
            {/* Add allergy */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAllergy.name}
                onChange={(e) => {
                  setNewAllergy(prev => ({ ...prev, name: e.target.value }));
                  clearError('allergyName');
                }}
                placeholder="Allergy name"
                className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.allergyName ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              <select
                value={newAllergy.severity}
                onChange={(e) => setNewAllergy(prev => ({ ...prev, severity: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
              <button
                type="button"
                onClick={addAllergy}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading || !newAllergy.name.trim()}
              >
                Add
              </button>
            </div>
            
            {errors.allergyName && (
              <p className="text-red-500 text-sm mb-3">{errors.allergyName}</p>
            )}

            {/* Allergies list */}
            {formData.allergies.length > 0 && (
              <div className="space-y-2">
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                    <span className="text-sm">
                      {allergy.name} ({allergy.severity})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAllergy(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Patient'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 