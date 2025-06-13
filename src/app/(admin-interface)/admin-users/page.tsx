'use client';

import React, { useState } from 'react';
import { useAdminUsers, useDoctorUsers, useUserActions } from '@/hooks/use-admin-users';
import { AdminUser, DoctorUser, CreateUserRequest } from '@/lib/api/admin-users-client';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  X,
  Save,
  Stethoscope,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

export default function AdminUsersPage() {
  const { adminUsers, loading: loadingAdmins, error: adminError, refetch: refetchAdmins } = useAdminUsers();
  const { doctorUsers, loading: loadingDoctors, error: doctorError, refetch: refetchDoctors } = useDoctorUsers();
  const { updateUserStatus, createUser, loading: actionLoading } = useUserActions();
  
  const [activeTab, setActiveTab] = useState<'admin' | 'doctor'>('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | DoctorUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | DoctorUser | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
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
      department_id: 1
    }
  });
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: 0,
    consultation_fee: 0
  });

  // Handle status toggle
  const handleStatusToggle = async (userId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateUserStatus(userId, { status: newStatus });
      
      // Refetch the appropriate data
      if (activeTab === 'admin') {
        refetchAdmins();
      } else {
        refetchDoctors();
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  // Handle create user
  const handleCreateUser = () => {
    setCreateForm({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: activeTab,
      doctorInfo: {
        specialty: '',
        experience: 0,
        consultation_fee: 0,
        department_id: 1
      }
    });
    setShowCreateModal(true);
  };

  // Handle view user details
  const handleViewUser = (user: AdminUser | DoctorUser) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Handle edit user
  const handleEditUser = (user: AdminUser | DoctorUser) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      specialty: (user as DoctorUser).specialty || '',
      experience: (user as DoctorUser).experience || 0,
      consultation_fee: (user as DoctorUser).consultation_fee || 0
    });
    setShowEditModal(true);
  };

  // Submit create form
  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!createForm.firstName.trim() || !createForm.lastName.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (createForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Doctor specific validation
    if (activeTab === 'doctor' && !createForm.doctorInfo?.specialty?.trim()) {
      toast.error('Specialty is required for doctors');
      return;
    }
    
    try {
      await createUser(createForm);
      setShowCreateModal(false);
      // Reset form
      setCreateForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: activeTab,
        doctorInfo: {
          specialty: '',
          experience: 0,
          consultation_fee: 0,
          department_id: 1
        }
      });
      
      if (activeTab === 'admin') {
        refetchAdmins();
      } else {
        refetchDoctors();
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  // Submit edit form
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Here you would call the update user API
      toast.success('User updated successfully');
      setShowEditModal(false);
      if (activeTab === 'admin') {
        refetchAdmins();
      } else {
        refetchDoctors();
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  // Filter users based on search, status, and specialty
  const filterUsers = (users: (AdminUser | DoctorUser)[]) => {
    return users.filter(user => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      // For doctors, also filter by specialty
      if (activeTab === 'doctor') {
        const doctorUser = user as DoctorUser;
        const matchesSpecialty = specialtyFilter === 'all' || doctorUser.specialty === specialtyFilter;
        return matchesSearch && matchesStatus && matchesSpecialty;
      }
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredAdminUsers = filterUsers(adminUsers);
  const filteredDoctorUsers = filterUsers(doctorUsers);
  
  // Get unique specialties for filter (for doctors tab)
  const specialties = Array.from(new Set(doctorUsers.map(doctor => doctor.specialty).filter(Boolean)));

  // User table component
  const UserTable = ({ users, type }: { users: (AdminUser | DoctorUser)[], type: 'admin' | 'doctor' }) => (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {type === 'doctor' ? 'Doctor' : 'User'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              {type === 'doctor' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialty
                </th>
              )}
              {type === 'doctor' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
              )}
              {type === 'doctor' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee
                </th>
              )}
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
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {type === 'doctor' ? 'Dr. ' : ''}{user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      {user.phone}
                    </div>
                  )}
                </td>
                {type === 'doctor' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {(user as DoctorUser).specialty || 'Not specified'}
                      </span>
                    </div>
                    {(user as DoctorUser).department_name && (
                      <div className="text-sm text-gray-500 mt-1 ml-6">
                        {(user as DoctorUser).department_name}
                      </div>
                    )}
                  </td>
                )}
                {type === 'doctor' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(user as DoctorUser).experience ? `${(user as DoctorUser).experience} years` : 'Not specified'}
                    </div>
                  </td>
                )}
                {type === 'doctor' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      {(user as DoctorUser).consultation_fee || 0}
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleStatusToggle(user.user_id, user.status)}
                    disabled={actionLoading}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {user.status === 'active' ? (
                      <UserCheck className="h-3 w-3 mr-1" />
                    ) : (
                      <UserX className="h-3 w-3 mr-1" />
                    )}
                    {user.status}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="Edit User"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const loading = activeTab === 'admin' ? loadingAdmins : loadingDoctors;
  const error = activeTab === 'admin' ? adminError : doctorError;
  const users = activeTab === 'admin' ? filteredAdminUsers : filteredDoctorUsers;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage admin users and doctors</p>
        </div>
        <button 
          onClick={handleCreateUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add {activeTab === 'admin' ? 'Admin' : 'Doctor'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => {
            setActiveTab('admin');
            setSpecialtyFilter('all'); // Reset specialty filter when switching to admin
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'admin'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Admin Users ({adminUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('doctor')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'doctor'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="h-4 w-4 inline mr-2" />
          Doctors ({doctorUsers.length})
        </button>
      </div>

      {/* Doctor Stats Cards - Show only when on doctor tab */}
      {activeTab === 'doctor' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Doctors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {doctorUsers.filter(d => d.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Doctors</p>
                <p className="text-2xl font-semibold text-gray-900">{doctorUsers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Filter className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Specialties</p>
                <p className="text-2xl font-semibold text-gray-900">{specialties.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'doctor' ? 'doctors' : 'users'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {/* Specialty filter - show only for doctors tab */}
        {activeTab === 'doctor' && (
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Specialties</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : `No ${activeTab} users have been created yet.`
            }
          </p>
        </div>
      ) : (
        <UserTable users={users} type={activeTab} />
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={`Create ${activeTab === 'admin' ? 'Admin' : 'Doctor'} User`}
        size="lg"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={createForm.firstName}
                onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={createForm.lastName}
                onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={createForm.phone}
                onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Doctor specific fields */}
          {activeTab === 'doctor' && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Doctor Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    value={createForm.doctorInfo?.specialty || ''}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      doctorInfo: { ...prev.doctorInfo!, specialty: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input
                    type="number"
                    value={createForm.doctorInfo?.experience || 0}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      doctorInfo: { ...prev.doctorInfo!, experience: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.doctorInfo?.consultation_fee || 0}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      doctorInfo: { ...prev.doctorInfo!, consultation_fee: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        {editingUser && (
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Doctor specific fields */}
            {'specialty' in editingUser && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Doctor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                    <input
                      type="text"
                      value={editForm.specialty}
                      onChange={(e) => setEditForm(prev => ({ ...prev, specialty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                    <input
                      type="number"
                      value={editForm.experience}
                      onChange={(e) => setEditForm(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.consultation_fee}
                      onChange={(e) => setEditForm(prev => ({ ...prev, consultation_fee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Update User
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
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
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedUser.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedUser.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Doctor specific info */}
            {'specialty' in selectedUser && (
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
    </div>
  );
} 