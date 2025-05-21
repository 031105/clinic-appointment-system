'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/use-toast';
import Card from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { z } from "zod";
import { useSession } from '@/contexts/auth/SessionContext';
import axios from 'axios';
import { getProfileImageUrl, uploadProfileImage } from '@/utils/imageUtils';

// Validation functions
const validateMalaysianPhoneNumber = (phoneNumber: string): boolean => {
  // Malaysian phone number formats:
  // Mobile: +6010xxxxxxx, +6011xxxxxxx, +6012xxxxxxx, +6013xxxxxxx, +6014xxxxxxx, +6016xxxxxxx, +6017xxxxxxx, +6018xxxxxxx, +6019xxxxxxx
  // Or without +60: 010xxxxxxx, 011xxxxxxx, etc.
  // Or with 0: 010xxxxxxx, 011xxxxxxx, etc.
  
  // Remove spaces, dashes, and other separators
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Check if it matches Malaysian formats
  const malaysianRegex = /^(?:\+?60|0)?1[0-9]{8,9}$/;
  
  return malaysianRegex.test(cleanNumber);
};

const getPhoneErrorMessage = (phoneNumber: string): string | null => {
  if (!phoneNumber.trim()) {
    return "Phone number is required";
  }
  
  if (!validateMalaysianPhoneNumber(phoneNumber)) {
    return "Please enter a valid Malaysian phone number (e.g., 01xxxxxxxxx, +6012xxxxxxxx)";
  }
  
  return null;
};

// Define interfaces for allergies and contacts
interface Allergy {
  id: number;
  allergyName: string;
  severity: string;
  patientId: number;
  diagnosedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmergencyContact {
  id: number;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  patientId: number;
  createdAt: string;
  updatedAt: string;
}

// Form validation schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .refine(phone => validateMalaysianPhoneNumber(phone), {
      message: "Please enter a valid Malaysian phone number"
    }),
  address: z.union([
    z.string().min(5, "Address must be at least 5 characters"), 
    z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional()
    }).refine(
      data => {
        // At least one address field should be filled
        return Object.values(data).some(val => val && val.length > 0);
      },
      {
        message: "At least one address field must be filled"
      }
    )
  ]),
  height: z.string().optional(),
  weight: z.string().optional(),
  bloodType: z.string().optional(),
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

// Cache utility functions
const getCachedData = (key: string) => {
  try {
    const data = sessionStorage.getItem(`settings_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error retrieving cached data:', e);
    return null;
  }
};

const setCachedData = (key: string, data: any) => {
  try {
    sessionStorage.setItem(`settings_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error caching data:', e);
  }
};

export default function SettingsPage() {
  const { data, status } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  // 个人资料状态
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  
  // 安全设置状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Phone validation errors
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [contactPhoneError, setContactPhoneError] = useState<string | null>(null);
  
  // 过敏信息状态
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [allergySeverity, setAllergySeverity] = useState('mild');
  const [editingAllergyId, setEditingAllergyId] = useState<number | null>(null);
  
  // 紧急联系人状态
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  
  // Phone validation errors for emergency contacts
  const [emergencyContactPhoneError, setEmergencyContactPhoneError] = useState<string | null>(null);
  
  // 加载用户设置
  useEffect(() => {
    async function loadSettings() {
      if (status !== 'authenticated') return;
      
      try {
        setLoading(true);
        
        // 尝试从缓存获取数据
        const cachedData = getCachedData('all');
        if (cachedData) {
          applySettingsData(cachedData);
          setLoading(false);
        }
        
        // 从API获取最新设置
        try {
          // 创建带Token的API客户端 - 更新为正确的端口
          const token = localStorage.getItem('accessToken');
          const api = axios.create({
            baseURL: 'http://localhost:3001/api/v1',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('Fetching patient profile data...');
          
          // 获取用户资料 - 使用patient-setting API endpoint
          const profileResponse = await api.get('/patient-setting/profile');
          const profileData = profileResponse.data;
          
          console.log('Raw profile data received:', profileData);
          
          // 组合数据
          const data = {
            userProfile: {
              ...profileData,
              userId: profileData.userId || profileData.id, 
              firstName: profileData.user?.firstName || '',
              lastName: profileData.user?.lastName || '',
              email: profileData.user?.email || '',
              phone: profileData.user?.phone || '',
              address: profileData.address || profileData.user?.address || '',
              height: profileData.height,
              weight: profileData.weight,
              bloodType: profileData.bloodGroup,
              profileImage: profileData.user?.profile_image_blob || '/placeholder.jpg'
            },
            allergies: profileData.allergies || [],
            emergencyContacts: profileData.emergencyContacts || []
          };
          
          // 更新界面和本地状态
          applySettingsData(data);
          
          // 缓存数据
          setCachedData('all', data);
          
        } catch (error: any) {
          console.error('Error fetching settings:', error);
          // 提供更详细的错误信息
          const errorMessage = error.response 
            ? `API Error: ${error.response.status} ${error.response.statusText}` 
            : 'Network error: Unable to connect to server';
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          
          // 如果已有缓存数据，至少可以显示这些数据
          if (!cachedData) {
            // 创建一些默认数据以便UI能够正常显示
            const defaultData = {
              userProfile: {
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo@example.com',
                phone: '123-456-7890',
                address: '123 Main St',
                profileImage: '/placeholder.jpg'
              },
              allergies: [],
              emergencyContacts: []
            };
            applySettingsData(defaultData);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadSettings();
  }, [status]);
  
  // 应用设置数据
  const applySettingsData = (data: any) => {
    // 调试输出完整数据
    console.log('Full profile data from backend:', data);
    
    // 用户资料
    if (data.userProfile) {
      setName(`${data.userProfile.firstName || ''} ${data.userProfile.lastName || ''}`);
      setEmail(data.userProfile.email || '');
      setPhone(data.userProfile.phone || '');
      
      // Validate phone number on load
      if (data.userProfile.phone) {
        setPhoneError(getPhoneErrorMessage(data.userProfile.phone));
      }
      
      // Handle address - treat as string
      const addressData = data.userProfile.address || '';
      console.log('Address data from profile:', addressData);
      setAddress(addressData);
      
      // 明确设置height、weight和bloodType，即使它们是undefined或null
      setHeight(data.userProfile.height === null || data.userProfile.height === undefined ? '' : String(data.userProfile.height));
      setWeight(data.userProfile.weight === null || data.userProfile.weight === undefined ? '' : String(data.userProfile.weight));
      setBloodType(data.userProfile.bloodType || data.userProfile.bloodGroup || '');
      
      if (data.userProfile.userId) {
        setUserId(data.userProfile.userId);
      }
    }
    
    // 过敏信息
    if (data.allergies) {
      setAllergies(data.allergies);
    }
    
    // 紧急联系人
    if (data.emergencyContacts) {
      setEmergencyContacts(data.emergencyContacts);
    }
  };
  
  // 保存个人资料
  const handleSaveChanges = async () => {
    try {
      // First check if there's a phone validation error
      if (phoneError) {
        toast({
          title: "Validation Error",
          description: phoneError,
          variant: "destructive",
        });
        return;
      }
      
      setIsSaving(true);
      
      // 验证数据
      try {
        profileSchema.parse({
          name,
          email,
          phone,
          address,
          height,
          weight,
          bloodType,
        });
      } catch (validationError) {
        console.error('Validation error:', validationError);
        if (validationError instanceof z.ZodError) {
          const errorMessage = validationError.issues.map(issue => issue.message).join(', ');
          toast({
            title: "Validation Error",
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }
        throw validationError;
      }
      
      // 解析名字为姓和名
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // 获取token
      const token = localStorage.getItem('accessToken');
      const api = axios.create({
        baseURL: 'http://localhost:3001/api/v1',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Prepare address for API - ensure it's properly formatted
      let formattedAddress;
      if (typeof address === 'string') {
        formattedAddress = address;
      } else {
        formattedAddress = ''; // Default to empty string
      }
      
      console.log('Sending address data:', formattedAddress);

      // 调用API更新用户资料
      const response = await api.put('/patient-setting/profile', {
        firstName,
        lastName,
        phone,
        address: formattedAddress,
        height: height ? String(height) : '',
        weight: weight ? String(weight) : '',
        bloodType,
        profileImage: profileImage
      });
      
      if (response.status === 200) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        
        // 更新缓存
        const cachedData = getCachedData('all') || {};
        setCachedData('all', {
          ...cachedData,
          userProfile: {
            ...cachedData.userProfile,
            firstName,
            lastName,
            phone,
            address,
            height,
            weight,
            bloodType,
            profileImage
          }
        });
        
        setEditingProfile(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // Handle different error types
      let errorMessage = "Failed to update profile. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) {
          errorMessage = error.response.data.message || "Invalid profile data";
        } else if (statusCode === 401) {
          errorMessage = "Session expired. Please log in again";
        } else if (statusCode === 500) {
          errorMessage = "Server error. Please try again later";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 更改密码
  const handlePasswordChange = async () => {
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
        setIsChangingPassword(false);
        return;
      }

      // 获取token
      const token = localStorage.getItem('accessToken');
      const api = axios.create({
        baseURL: 'http://localhost:3001/api/v1',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const response = await api.post('/patient-setting/change-password', {
        currentPassword,
        newPassword
      });
      
      // 清空表单
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Success",
        description: response.data.message || "Password updated successfully",
      });
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle different error types for better error messages
      let errorMessage = "Failed to update password. Please check your current password.";
      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) {
          errorMessage = error.response.data.message || "Current password is incorrect";
        } else if (statusCode === 401) {
          errorMessage = "Session expired. Please log in again";
        } else if (statusCode === 404) {
          errorMessage = "Password update service not available";
        } else if (statusCode === 500) {
          errorMessage = "Server error. Please try again later";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // 管理过敏信息
  const handleAddAllergy = async () => {
    try {
      if (!newAllergy.trim()) return;
      
      // 获取token
      const token = localStorage.getItem('accessToken');
      const api = axios.create({
        baseURL: 'http://localhost:3001/api/v1',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (editingAllergyId !== null) {
        // 更新现有过敏信息
        const response = await api.put(`/patients/allergies/${editingAllergyId}`, {
          allergyName: newAllergy,
          severity: allergySeverity
        });
        
        const updatedAllergy = response.data;
        setAllergies(prev => prev.map(a => a.id === editingAllergyId ? updatedAllergy : a));
        toast({
          title: "Success",
          description: "Allergy updated successfully",
        });
      } else {
        // 添加新过敏信息
        const newAllergyData = {
          allergyName: newAllergy,
          severity: allergySeverity
        };
        
        const response = await api.post('/patients/allergies', newAllergyData);
        const addedAllergy = response.data;
        setAllergies(prev => [...prev, addedAllergy]);
        toast({
          title: "Success",
          description: "Allergy added successfully",
        });
      }
      
      // 更新缓存
      const cachedData = getCachedData('all') || {};
      const updatedAllergies = editingAllergyId !== null 
        ? allergies.map(a => a.id === editingAllergyId 
          ? { ...a, allergyName: newAllergy, severity: allergySeverity } 
          : a)
        : [...allergies, { 
            id: Math.max(0, ...allergies.map(a => a.id)) + 1, 
            allergyName: newAllergy, 
            severity: allergySeverity,
            patientId: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }];
        
      setCachedData('all', {
        ...cachedData,
        allergies: updatedAllergies
      });
      
      // 重置表单
      setNewAllergy('');
      setAllergySeverity('mild');
      setEditingAllergyId(null);
      
    } catch (error) {
      console.error('Error managing allergy:', error);
      
      // Handle different error types for better error messages
      let errorMessage = "Failed to save allergy information";
      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) {
          errorMessage = error.response.data.message || "Please check your allergy information";
        } else if (statusCode === 401) {
          errorMessage = "Session expired. Please log in again";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  // 删除过敏信息
  const handleDeleteAllergy = async (id: number) => {
    try {
      // 获取token
      const token = localStorage.getItem('accessToken');
      const api = axios.create({
        baseURL: 'http://localhost:3001/api/v1',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      await api.delete(`/patients/allergies/${id}`);
      setAllergies(prev => prev.filter(a => a.id !== id));
      
      // 更新缓存
      const cachedData = getCachedData('all') || {};
      setCachedData('all', {
        ...cachedData,
        allergies: allergies.filter(a => a.id !== id)
      });
      
      toast({
        title: "Success",
        description: "Allergy removed successfully",
      });
    } catch (error) {
      console.error('Error deleting allergy:', error);
      toast({
        title: "Error",
        description: "Failed to remove allergy",
        variant: "destructive",
      });
    }
  };
  
  // 管理紧急联系人
  const handleAddContact = async () => {
    try {
      if (!newContactName.trim() || !newContactPhone.trim() || !newContactRelationship.trim()) return;
      
      // Validate phone number before submitting
      if (!validateMalaysianPhoneNumber(newContactPhone)) {
        setEmergencyContactPhoneError(getPhoneErrorMessage(newContactPhone));
        toast({
          title: "Validation Error",
          description: "Please enter a valid Malaysian phone number",
          variant: "destructive",
        });
        return;
      }
      
      setIsAddingContact(true);
      
      // 获取token
      const token = localStorage.getItem('accessToken');
      const api = axios.create({
        baseURL: 'http://localhost:3001/api/v1',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (editingContactId !== null) {
        // 更新现有联系人
        const response = await api.put(`/patient-setting/emergency-contacts/${editingContactId}`, {
          name: newContactName,
          relationship: newContactRelationship,
          phone: newContactPhone
        });
        
        const updatedContact = response.data;
        setEmergencyContacts(prev => prev.map(c => c.id === editingContactId ? updatedContact : c));
        toast({
          title: "Success",
          description: "Emergency contact updated successfully",
        });
      } else {
        // 添加新联系人
        const newContactData = {
          name: newContactName,
          relationship: newContactRelationship,
          phone: newContactPhone,
          isPrimary: emergencyContacts.length === 0 // First contact becomes primary
        };
        
        const response = await api.post('/patient-setting/emergency-contacts', newContactData);
        const addedContact = response.data;
        setEmergencyContacts(prev => [...prev, addedContact]);
        toast({
          title: "Success",
          description: "Emergency contact added successfully",
        });
      }
      
      // 更新缓存
      const cachedData = getCachedData('all') || {};
      const updatedContacts = editingContactId !== null
        ? emergencyContacts.map(c => c.id === editingContactId
          ? { ...c, name: newContactName, relationship: newContactRelationship, phone: newContactPhone }
          : c)
        : [...emergencyContacts, {
            id: Math.max(0, ...emergencyContacts.map(c => c.id)) + 1,
            name: newContactName,
            relationship: newContactRelationship,
            phone: newContactPhone,
            isPrimary: emergencyContacts.length === 0,
            patientId: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }];
          
      setCachedData('all', {
        ...cachedData,
        emergencyContacts: updatedContacts
      });
      
      // 重置表单
      setNewContactName('');
      setNewContactRelationship('');
      setNewContactPhone('');
      setEditingContactId(null);
      setEmergencyContactPhoneError(null);
      
    } catch (error) {
      console.error('Error managing emergency contact:', error);
      
      // Handle different error types for better error messages
      let errorMessage = "Failed to save emergency contact";
      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) {
          errorMessage = error.response.data.message || "Please check your contact information";
        } else if (statusCode === 401) {
          errorMessage = "Session expired. Please log in again";
        } else if (statusCode === 500) {
          errorMessage = "Server error. Please try again later";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingContact(false);
    }
  };
  
  // 删除紧急联系人
  const handleDeleteContact = async (id: number) => {
    try {
      // 获取token
      const token = localStorage.getItem('accessToken');
      const api = axios.create({
        baseURL: 'http://localhost:3001/api/v1',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      await api.delete(`/patient-setting/emergency-contacts/${id}`);
      setEmergencyContacts(prev => prev.filter(c => c.id !== id));
      
      // 更新缓存
      const cachedData = getCachedData('all') || {};
      setCachedData('all', {
        ...cachedData,
        emergencyContacts: emergencyContacts.filter(c => c.id !== id)
      });
      
      toast({
        title: "Success",
        description: "Emergency contact removed successfully",
      });
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      
      // Handle different error types for better error messages
      let errorMessage = "Failed to remove emergency contact";
      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
          errorMessage = "Contact not found or already removed";
        } else if (statusCode === 401) {
          errorMessage = "Session expired. Please log in again";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // 本地预览
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // 也可以立即上传到服务器
      if (userId) {
        try {
          const response = await uploadProfileImage(file);
          if (response && response.status === 'success') {
            toast({
              title: "Success",
              description: "Profile image uploaded successfully",
            });
            
            // 添加时间戳防止缓存
            const timestamp = new Date().getTime();
            // 触发一下刷新，确保显示最新图片
            setProfileImage(`${getProfileImageUrl(userId)}?t=${timestamp}`);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "Error",
            description: "Failed to upload profile image. Changes will not be saved until you click Save Changes.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  useEffect(() => {
    console.log('Current profile values:', { height, weight, bloodType });
  }, [height, weight, bloodType]);

  // Display loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-600">Please log in to access your settings</p>
          <Button variant="primary" onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

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
                        handleSaveChanges();
                      } else {
                        setEditingProfile(true);
                      }
                    }}
                    disabled={editingProfile && phoneError !== null}
                  >
                    {editingProfile ? "Save Changes" : "Edit Profile"}
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-full md:w-auto flex flex-col items-center gap-2">
                    <div className="relative group">
                      <div className="rounded-full overflow-hidden w-32 h-32 bg-blue-100 flex items-center justify-center">
                        {/* 用户头像 */}
                        {userId ? (
                          <img 
                            src={
                              // 优先显示从FileReader读取的本地预览图片
                              profileImage && profileImage.startsWith('data:') 
                                ? profileImage
                                // 否则从服务器获取图片
                                : getProfileImageUrl(userId)
                            }
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 图片加载失败时显示默认图标
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.setAttribute('style', 'display: block');
                            }}
                          />
                        ) : null}
                        {/* 默认头像图标 */}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className="w-1/2 h-1/2 text-blue-500"
                          style={{ display: 'none' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </div>
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
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPhone(newValue);
                        setPhoneError(getPhoneErrorMessage(newValue));
                      }}
                      error={phoneError || undefined}
                      placeholder="+60123456789 or 0123456789"
                      disabled={!editingProfile}
                      helperText="Enter a valid Malaysian phone number"
                    />
                    {!editingProfile ? (
                      <FormInput
                        label="Address"
                        value={address}
                        disabled={true}
                      />
                    ) : (
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <FormInput
                          placeholder="Full address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <FormInput
                          label="Height (cm)"
                          value={height}
                          placeholder="未设置"
                          onChange={(e) => setHeight(e.target.value)}
                          disabled={!editingProfile}
                        />
                      </div>
                      <div>
                        <FormInput
                          label="Weight (kg)"
                          value={weight}
                          placeholder="未设置"
                          onChange={(e) => setWeight(e.target.value)}
                          disabled={!editingProfile}
                        />
                      </div>
                      <div>
                        <FormInput
                          label="Blood Type"
                          value={bloodType}
                          placeholder="未设置"
                          onChange={(e) => setBloodType(e.target.value)}
                          disabled={!editingProfile}
                        />
                      </div>
                    </div>
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
                      disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span> 
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
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
                    {allergies.length === 0 ? (
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No allergies recorded</p>
                      </div>
                    ) : (
                      allergies.map((allergy) => (
                        <div 
                          key={allergy.id}
                          className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100"
                        >
                          <div>
                            <div className="font-medium">{allergy.allergyName}</div>
                            <div className="text-sm text-gray-500">Severity: {allergy.severity}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setNewAllergy(allergy.allergyName);
                                setAllergySeverity(allergy.severity);
                                setEditingAllergyId(allergy.id);
                              }}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteAllergy(allergy.id)}
                            >
                              <PlusIcon className="h-4 w-4 rotate-45" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
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
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
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
                          className="ml-2"
                          onClick={() => {
                            setNewAllergy('');
                            setAllergySeverity('mild');
                            setEditingAllergyId(null);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
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
                    {emergencyContacts.length === 0 ? (
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No emergency contacts</p>
                      </div>
                    ) : (
                      emergencyContacts.map((contact) => (
                        <div 
                          key={contact.id}
                          className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100"
                        >
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.relationship}</div>
                            <div className="text-sm text-gray-500">{contact.phone}</div>
                            {contact.isPrimary && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                Primary
                              </span>
                            )}
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
                              onClick={() => handleDeleteContact(contact.id)}
                            >
                              <PlusIcon className="h-4 w-4 rotate-45" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Add/Edit contact form */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-base font-medium text-gray-900 mb-3">
                      {editingContactId !== null ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
                    </h3>
                    <div className="space-y-4">
                      <FormInput
                        label="Name"
                        placeholder="Full name"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                      />
                      <div className="space-y-2">
                        <Label>Relationship</Label>
                        <select
                          value={newContactRelationship}
                          onChange={(e) => setNewContactRelationship(e.target.value)}
                          className="block w-full px-3 py-2 text-base rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Child">Child</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Grandparent">Grandparent</option>
                          <option value="Friend">Friend</option>
                          <option value="Caregiver">Caregiver</option>
                          <option value="Legal Guardian">Legal Guardian</option>
                          <option value="Other Relative">Other Relative</option>
                        </select>
                      </div>
                      <FormInput
                        label="Phone Number"
                        placeholder="Phone number"
                        value={newContactPhone}
                        onChange={(e) => {
                          const input = e.target.value;
                          setNewContactPhone(input);
                          
                          // Set error message if phone number is invalid
                          if (input.trim() === '') {
                            setEmergencyContactPhoneError(null);
                          } else {
                            const errorMessage = getPhoneErrorMessage(input);
                            setEmergencyContactPhoneError(errorMessage);
                          }
                        }}
                        error={emergencyContactPhoneError || undefined}
                        helperText="Enter a valid Malaysian phone number (e.g., 01X-XXX XXXX)"
                      />
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="primary"
                        onClick={handleAddContact}
                        disabled={!newContactName.trim() || !newContactPhone.trim() || !newContactRelationship.trim() || isAddingContact || emergencyContactPhoneError !== null}
                      >
                        {isAddingContact ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span> 
                            Adding...
                          </>
                        ) : (
                          editingContactId !== null ? 'Update Contact' : 'Add Contact'
                        )}
                      </Button>
                      {editingContactId !== null && (
                        <Button 
                          variant="outline"
                          className="ml-2"
                          onClick={() => {
                            setNewContactName('');
                            setNewContactRelationship('');
                            setNewContactPhone('');
                            setEditingContactId(null);
                            setEmergencyContactPhoneError(null);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}