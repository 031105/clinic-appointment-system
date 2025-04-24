import React, { useState } from 'react';

// Temporary user data
const tempUsers = [
  {
    id: '1',
    username: 'admin123',
    email: 'admin@clinic.com',
    phone: '+6012345678',
    role: 'admin',
    status: 'active',
    createdAt: '2023-01-01',
    lastLogin: '2025-06-20',
    permissions: ['all']
  },
  {
    id: '2',
    username: 'reception1',
    email: 'reception@clinic.com',
    phone: '+6012345680',
    role: 'staff',
    status: 'active',
    createdAt: '2023-01-15',
    lastLogin: '2025-06-19',
    permissions: ['view_appointments', 'create_appointments', 'view_patients']
  },
  {
    id: '3',
    username: 'billing1',
    email: 'billing@clinic.com',
    phone: '+6012345681',
    role: 'staff',
    status: 'active',
    createdAt: '2023-02-01',
    lastLogin: '2025-06-18',
    permissions: ['view_invoices', 'create_invoices', 'view_patients']
  },
  {
    id: '4',
    username: 'support1',
    email: 'support@clinic.com',
    phone: '+6012345682',
    role: 'staff',
    status: 'inactive',
    createdAt: '2023-03-01',
    lastLogin: '2025-05-20',
    permissions: ['view_appointments', 'view_patients']
  },
  {
    id: '5',
    username: 'adminassist',
    email: 'assist@clinic.com',
    phone: '+6012345683',
    role: 'staff',
    status: 'active',
    createdAt: '2023-04-01',
    lastLogin: '2025-06-20',
    permissions: ['view_appointments', 'view_patients', 'view_doctors', 'view_departments']
  }
];

// User roles
const roles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'staff', name: 'Staff' }
];

// Permissions
const allPermissions = [
  { id: 'view_appointments', name: 'View Appointments', category: 'Appointments' },
  { id: 'create_appointments', name: 'Create Appointments', category: 'Appointments' },
  { id: 'edit_appointments', name: 'Edit Appointments', category: 'Appointments' },
  { id: 'delete_appointments', name: 'Delete Appointments', category: 'Appointments' },
  { id: 'view_patients', name: 'View Patients', category: 'Patients' },
  { id: 'create_patients', name: 'Create Patients', category: 'Patients' },
  { id: 'edit_patients', name: 'Edit Patients', category: 'Patients' },
  { id: 'delete_patients', name: 'Delete Patients', category: 'Patients' },
  { id: 'view_doctors', name: 'View Doctors', category: 'Doctors' },
  { id: 'create_doctors', name: 'Create Doctors', category: 'Doctors' },
  { id: 'edit_doctors', name: 'Edit Doctors', category: 'Doctors' },
  { id: 'view_departments', name: 'View Departments', category: 'Departments' },
  { id: 'manage_departments', name: 'Manage Departments', category: 'Departments' },
  { id: 'view_invoices', name: 'View Invoices', category: 'Billing' },
  { id: 'create_invoices', name: 'Create Invoices', category: 'Billing' },
  { id: 'manage_settings', name: 'Manage Settings', category: 'System' },
  { id: 'view_reports', name: 'View Reports', category: 'Reports' },
  { id: 'manage_users', name: 'Manage Users', category: 'Users' }
];

export default function UserManagement() {
  const [users, setUsers] = useState(tempUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    phone: '',
    role: 'staff',
    status: 'active',
    password: '',
    permissions: []
  });
  const [editingUser, setEditingUser] = useState(null);

  // Filter users based on search query, role and status
  const filteredUsers = users.filter(user => {
    // Role filter
    if (filterRole !== 'all' && user.role !== filterRole) {
      return false;
    }
    
    // Status filter
    if (filterStatus !== 'all' && user.status !== filterStatus) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
      );
    }
    
    return true;
  });

  // Handle user form change
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionId) => {
    setNewUser(prev => {
      if (prev.permissions.includes(permissionId)) {
        return { ...prev, permissions: prev.permissions.filter(id => id !== permissionId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permissionId] };
      }
    });
  };

  // Handle user save/update
  const handleSaveUser = () => {
    // Validate form
    if (!newUser.username || !newUser.email || !newUser.role) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUser ? { ...user, ...newUser, id: editingUser } : user
      ));
      
      // If the selected user is being edited, update it too
      if (selectedUser && selectedUser.id === editingUser) {
        setSelectedUser({ ...selectedUser, ...newUser });
      }
    } else {
      // Add new user
      const newUserObj = {
        ...newUser,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Never'
      };
      
      setUsers([...users, newUserObj]);
    }
    
    // Reset form and close modal
    setNewUser({
      username: '',
      email: '',
      phone: '',
      role: 'staff',
      status: 'active',
      password: '',
      permissions: []
    });
    setEditingUser(null);
    setShowUserModal(false);
  };

  // Handle user view
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
    setActiveTab('details');
  };

  // Handle user edit
  const handleEditUser = (user) => {
    setNewUser({
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      password: '', // Don't populate password
      permissions: user.permissions || []
    });
    setEditingUser(user.id);
    setShowUserModal(true);
  };

  // Handle user status toggle
  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
    ));
    
    // If the selected user's status is toggled, update it too
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ 
        ...selectedUser, 
        status: selectedUser.status === 'active' ? 'inactive' : 'active' 
      });
    }
  };

  // Get permissions by category
  const getPermissionsByCategory = () => {
    const categories = {};
    
    allPermissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    
    return categories;
  };

  // Get user permissions display
  const getUserPermissionsDisplay = (userPermissions) => {
    if (userPermissions.includes('all')) {
      return 'All permissions (Administrator)';
    }
    
    if (userPermissions.length === 0) {
      return 'No permissions assigned';
    }
    
    if (userPermissions.length > 3) {
      const permissionNames = userPermissions.slice(0, 3).map(id => {
        const permission = allPermissions.find(p => p.id === id);
        return permission ? permission.name : id;
      });
      
      return `${permissionNames.join(', ')} and ${userPermissions.length - 3} more`;
    }
    
    return userPermissions.map(id => {
      const permission = allPermissions.find(p => p.id === id);
      return permission ? permission.name : id;
    }).join(', ');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => {
            setNewUser({
              username: '',
              email: '',
              phone: '',
              role: 'staff',
              status: 'active',
              password: '',
              permissions: []
            });
            setEditingUser(null);
            setShowUserModal(true);
          }}
        >
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by username, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.role === 'admin' ? 'Administrator' : 'Staff'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getUserPermissionsDisplay(user.permissions)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleDateString()}
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
                      className="text-gray-500 hover:text-gray-700 mr-3"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className={`${user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      onClick={() => handleToggleStatus(user.id)}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No users found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    User Information - {selectedUser.username}
                  </h3>
                  
                  {/* Tabs */}
                  <div className="border-b border-gray-200 mt-4">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        className={`${
                          activeTab === 'details'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('details')}
                      >
                        User Details
                      </button>
                      <button
                        className={`${
                          activeTab === 'permissions'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('permissions')}
                      >
                        Permissions
                      </button>
                      <button
                        className={`${
                          activeTab === 'activity'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('activity')}
                      >
                        Activity Log
                      </button>
                    </nav>
                  </div>
                  
                  {/* Tab content */}
                  <div className="mt-4">
                    {/* User Details Tab */}
                    {activeTab === 'details' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Username</p>
                          <p className="text-base font-medium">{selectedUser.username}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-base font-medium">{selectedUser.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-base font-medium">{selectedUser.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="text-base font-medium">
                            {selectedUser.role === 'admin' ? 'Administrator' : 'Staff'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created On</p>
                          <p className="text-base font-medium">
                            {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Login</p>
                          <p className="text-base font-medium">
                            {selectedUser.lastLogin === 'Never' 
                              ? 'Never' 
                              : new Date(selectedUser.lastLogin).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Permissions Tab */}
                    {activeTab === 'permissions' && (
                      <div>
                        {selectedUser.permissions.includes('all') ? (
                          <div className="p-4 bg-blue-50 rounded-lg mb-4">
                            <p className="text-blue-700 font-medium">
                              This user has administrator permissions and can access all features of the system.
                            </p>
                          </div>
                        ) : (
                          <div>
                            {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                              <div key={category} className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                                <div className="space-y-2">
                                  {permissions.map(permission => (
                                    <div key={permission.id} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        id={`view-permission-${permission.id}`}
                                        checked={selectedUser.permissions.includes(permission.id)}
                                        readOnly
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                      />
                                      <label htmlFor={`view-permission-${permission.id}`} className="ml-2 text-sm text-gray-700">
                                        {permission.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Activity Log Tab */}
                    {activeTab === 'activity' && (
                      <div className="text-center py-4">
                        <p className="text-gray-500">User activity log would be displayed here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    handleEditUser(selectedUser);
                    setShowDetailModal(false);
                  }}
                >
                  Edit User
                </button>
                <button
                  type="button"
                  className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium ${
                    selectedUser.status === 'active' ? 'text-red-700' : 'text-green-700'
                  } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={() => {
                    handleToggleStatus(selectedUser.id);
                    setShowDetailModal(false);
                  }}
                >
                  {selectedUser.status === 'active' ? 'Deactivate User' : 'Activate User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 overflow-y-auto z-10" aria-labelledby="user-modal" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username*</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={newUser.username}
                      onChange={handleUserFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={newUser.status}
                      onChange={handleUserFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      {editingUser ? 'New Password (leave blank to keep current)' : 'Password*'}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleUserFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter password"
                      required={!editingUser}
                    />
                  </div>
                </div>
                
                {/* Permissions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">User Permissions</h4>
                  {newUser.role === 'admin' ? (
                    <div className="p-4 bg-blue-50 rounded-lg mb-4">
                      <p className="text-blue-700">
                        Administrator users automatically have access to all system features.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto px-2">
                      {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                        <div key={category} className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">{category}</h5>
                          <div className="space-y-2 ml-2">
                            {permissions.map(permission => (
                              <div key={permission.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`permission-${permission.id}`}
                                  checked={newUser.permissions.includes(permission.id)}
                                  onChange={() => handlePermissionToggle(permission.id)}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`permission-${permission.id}`} className="ml-2 text-sm text-gray-700">
                                  {permission.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSaveUser}
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setNewUser({
                      username: '',
                      email: '',
                      phone: '',
                      role: 'staff',
                      status: 'active',
                      password: '',
                      permissions: []
                    });
                    setEditingUser(null);
                    setShowUserModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// API functions to connect with backend later
export const userApi = {
  // Get all users
  getUsers: async (filters = {}) => {
    // This will be replaced with actual API call
    // Example: return await fetch('/api/users?' + new URLSearchParams(filters))
    return tempUsers; // Currently returns mock data
  },
  
  // Get a single user
  getUser: async (id) => {
    // Example: return await fetch(`/api/users/${id}`)
    return tempUsers.find(user => user.id === id);
  },
  
  // Create new user
  createUser: async (userData) => {
    // Example: 
    // return await fetch('/api/users', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // })
    console.log('Creating user:', userData);
    return { success: true, id: Date.now().toString() }; // Mock response
  },
  
  // Update user
  updateUser: async (id, userData) => {
    // Example:
    // return await fetch(`/api/users/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // })
    console.log('Updating user:', id, userData);
    return { success: true }; // Mock response
  },
  
  // Change user status
  changeStatus: async (id, status) => {
    // Example:
    // return await fetch(`/api/users/${id}/status`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status })
    // })
    console.log('Changing user status:', id, status);
    return { success: true }; // Mock response
  },
  
  // Get user permissions
  getUserPermissions: async (userId) => {
    // Example: return await fetch(`/api/users/${userId}/permissions`)
    const user = tempUsers.find(u => u.id === userId);
    return user ? user.permissions : [];
  }
}; focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email*</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleUserFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={newUser.phone}
                      onChange={handleUserFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role*</label>
                    <select
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleUserFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm