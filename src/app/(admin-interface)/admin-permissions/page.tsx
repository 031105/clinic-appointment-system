'use client';

import React, { useState } from 'react';
import { useAdminUsers, useDoctorUsers, useUserDetails, useUserActions } from '@/hooks/use-admin-users';
import { AdminUser, DoctorUser, CreateUserRequest } from '@/lib/api/admin-users-client';
import Modal from '@/components/ui/Modal';
import { FormField } from '@/components/admin/ui/FormField';
import { UserStatusBadge } from '@/components/ui/UserStatusBadge';
import { 
  validateName, 
  validateEmail, 
  validateMalaysiaPhone, 
  validatePassword,
  validateNumber,
  sanitizeText,
  validateFields,
  validateSearchQuery
} from '@/utils/validation';

export default function UserManagement() {
  const { adminUsers, loading: adminLoading, refetch: refetchAdmins } = useAdminUsers();
  const { doctorUsers, loading: doctorLoading, refetch: refetchDoctors } = useDoctorUsers();
  const { createUser, updateUserStatus, loading: actionLoading } = useUserActions();
  
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { user: selectedUser, loading: userDetailsLoading } = useUserDetails(selectedUserId);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserType, setCreateUserType] = useState<'admin' | 'doctor'>('admin');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form validation states
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    specialty?: string;
    experience?: string;
    consultation_fee?: string;
  }>({});
  
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'admin',
    doctorInfo: {
      specialty: '',
      experience: 0,
      consultation_fee: 0,
      department_id: 14
    }
  });

  // Enhanced validation using our validation tools
  const validateForm = (): boolean => {
    const validationResults = {
      firstName: validateName(newUser.firstName, 'First name'),
      lastName: validateName(newUser.lastName, 'Last name'),
      email: validateEmail(newUser.email),
      password: validatePassword(newUser.password),
      phone: validateMalaysiaPhone(newUser.phone || '', false),
      ...(createUserType === 'doctor' && newUser.doctorInfo ? {
        specialty: validateName(newUser.doctorInfo.specialty || '', 'Specialty'),
        experience: validateNumber(newUser.doctorInfo.experience || 0, 0, 70, 'Experience', false, false),
        consultation_fee: validateNumber(newUser.doctorInfo.consultation_fee || 0, 0, 10000, 'Consultation fee', false, true)
      } : {})
    };

    const { isValid, errors } = validateFields(validationResults);
    setFormErrors(errors);
    return isValid;
  };

  // Enhanced search validation
  const handleSearchChange = (query: string) => {
    const searchValidation = validateSearchQuery(query);
    if (searchValidation.isValid) {
      setSearchQuery(query);
    }
  };

  // Clear specific error when user starts typing
  const clearError = (fieldName: string) => {
    if (formErrors[fieldName as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  // Filter users based on search and status with enhanced search validation
  const filterUsers = (users: (AdminUser | DoctorUser)[] | undefined) => {
    if (!users || !Array.isArray(users)) {
      return [];
    }
    
    return users.filter(user => {
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.email.toLowerCase().includes(query) ||
          user.first_name.toLowerCase().includes(query) ||
          user.last_name.toLowerCase().includes(query) ||
          (user.phone && user.phone.includes(query))
        );
      }
      
      return true;
    });
  };

  const filteredAdminUsers = filterUsers(adminUsers);
  const filteredDoctorUsers = filterUsers(doctorUsers);

  // Handle user form changes with validation and sanitization
  const handleUserFormChange = (field: string, value: any) => {
    if (field.startsWith('doctorInfo.')) {
      const doctorField = field.replace('doctorInfo.', '');
      setNewUser(prev => ({
        ...prev,
        doctorInfo: {
          ...prev.doctorInfo,
          [doctorField]: value
        }
      }));
    } else {
      // Apply text sanitization for string fields
      const sanitizedValue = typeof value === 'string' ? sanitizeText(value) : value;
      setNewUser(prev => ({
        ...prev,
        [field]: sanitizedValue
      }));
    }
    
    // Clear error for this field
    clearError(field.replace('doctorInfo.', ''));
  };

  const handleCreateUser = async () => {
    if (!validateForm()) {
      return;
    }

    // Format user data before submission
    const formattedUserData: CreateUserRequest = {
      email: sanitizeText(newUser.email),
      password: newUser.password,
      firstName: sanitizeText(newUser.firstName),
      lastName: sanitizeText(newUser.lastName),
      phone: newUser.phone ? sanitizeText(newUser.phone) : undefined,
      role: newUser.role,
      doctorInfo: createUserType === 'doctor' && newUser.doctorInfo ? {
        specialty: sanitizeText(newUser.doctorInfo.specialty || ''),
        experience: Math.round(newUser.doctorInfo.experience || 0),
        consultation_fee: Math.round((newUser.doctorInfo.consultation_fee || 0) * 100) / 100,
        department_id: newUser.doctorInfo.department_id
      } : undefined
    };

    const success = await createUser(formattedUserData);
    
    if (success) {
      setShowCreateModal(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'admin',
        doctorInfo: {
          specialty: '',
          experience: 0,
          consultation_fee: 0,
          department_id: 14
        }
      });
      setFormErrors({});
      
      // Refresh the appropriate user list
      if (createUserType === 'admin') {
        refetchAdmins();
      } else {
        refetchDoctors();
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    // Add confirmation dialog
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }
    
    try {
      console.log(`Attempting to ${action} user ${userId} from ${currentStatus} to ${newStatus}`);
      
      await updateUserStatus(userId, { status: newStatus });
      
      // Refresh both admin and doctor users data
      refetchAdmins();
      refetchDoctors();
      
      console.log(`Successfully ${action}d user ${userId}`);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      // The error toast will be shown by the useUserActions hook
    }
  };

  // Handle view user details
  const handleViewUser = (user: AdminUser | DoctorUser) => {
    setSelectedUserId(user.user_id);
    setShowDetailModal(true);
  };

  // Open create modal
  const handleOpenCreateModal = (type: 'admin' | 'doctor') => {
    setCreateUserType(type);
    setNewUser(prev => ({ ...prev, role: type }));
    setFormErrors({}); // Clear any previous errors
    setShowCreateModal(true);
  };

  // User section component
  const UserSection = ({ 
    title, 
    users, 
    loading, 
    userType 
  }: { 
    title: string; 
    users: (AdminUser | DoctorUser)[]; 
    loading: boolean;
    userType: 'admin' | 'doctor';
  }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => handleOpenCreateModal(userType)}
          >
            Add {userType === 'admin' ? 'Admin' : 'Doctor'}
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-6 text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserStatusBadge status={user.status as 'active' | 'inactive'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleViewUser(user)}
                    >
                      View
                    </button>
                    <button 
                      className={`${user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      onClick={() => handleToggleStatus(user.user_id, user.status)}
                      disabled={actionLoading}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No users found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Management</h1>
        
        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="search"
              label="Search"
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <FormField
              id="statusFilter"
              label="Status Filter"
              type="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Admin Users Section */}
      <UserSection 
        title="Admin Users" 
        users={filteredAdminUsers}
        loading={adminLoading}
        userType="admin"
      />

      {/* Doctor Users Section */}
      <UserSection 
        title="Doctor Users" 
        users={filteredDoctorUsers}
        loading={doctorLoading}
        userType="doctor"
      />

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUserId(null);
          }}
          title="User Details"
          size="lg"
        >
          {userDetailsLoading ? (
            <div className="p-6 text-center">Loading user details...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-gray-900 capitalize">{selectedUser.role_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <UserStatusBadge status={selectedUser.status as 'active' | 'inactive'} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="text-gray-900">
                    {selectedUser.last_login_at 
                      ? new Date(selectedUser.last_login_at).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
              
              {/* Doctor specific info */}
              {selectedUser.role_name === 'doctor' && 'specialty' in selectedUser && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Doctor Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Specialty</label>
                      <p className="text-gray-900">{selectedUser.specialty || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Experience</label>
                      <p className="text-gray-900">{selectedUser.experience || 0} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Consultation Fee</label>
                      <p className="text-gray-900">${selectedUser.consultation_fee || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <p className="text-gray-900">{selectedUser.department_name || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={`Create ${createUserType === 'admin' ? 'Admin' : 'Doctor'} User`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormField
                  id="firstName"
                  label="First Name"
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => handleUserFormChange('firstName', e.target.value)}
                  required
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                )}
              </div>
              <div>
                <FormField
                  id="lastName"
                  label="Last Name"
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => handleUserFormChange('lastName', e.target.value)}
                  required
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                )}
              </div>
              <div>
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleUserFormChange('email', e.target.value)}
                  required
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
              <div>
                <FormField
                  id="phone"
                  label="Phone"
                  type="text"
                  placeholder="e.g., +1234567890 or (123) 456-7890"
                  value={newUser.phone || ''}
                  onChange={(e) => handleUserFormChange('phone', e.target.value)}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>
              <div className="col-span-2">
                <FormField
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newUser.password}
                  onChange={(e) => handleUserFormChange('password', e.target.value)}
                  required
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
            </div>
            
            {/* Doctor specific fields */}
            {createUserType === 'doctor' && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Doctor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormField
                      id="specialty"
                      label="Specialty"
                      type="text"
                      placeholder="e.g., Cardiology, Neurology"
                      value={newUser.doctorInfo?.specialty || ''}
                      onChange={(e) => handleUserFormChange('doctorInfo.specialty', e.target.value)}
                      required={createUserType === 'doctor'}
                    />
                    {formErrors.specialty && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.specialty}</p>
                    )}
                  </div>
                  <FormField
                    id="experience"
                    label="Experience (years)"
                    type="number"
                    value={newUser.doctorInfo?.experience || 0}
                    onChange={(e) => handleUserFormChange('doctorInfo.experience', parseInt(e.target.value) || 0)}
                  />
                  <FormField
                    id="consultationFee"
                    label="Consultation Fee"
                    type="number"
                    value={newUser.doctorInfo?.consultation_fee || 0}
                    onChange={(e) => handleUserFormChange('doctorInfo.consultation_fee', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleCreateUser}
                disabled={actionLoading}
              >
                {actionLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 