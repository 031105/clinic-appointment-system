import { useState, useEffect } from 'react';
import { 
  adminUsersClient, 
  AdminUser, 
  DoctorUser, 
  CreateUserRequest, 
  UpdateUserStatusRequest 
} from '@/lib/api/admin-users-client';
import { toast } from 'react-hot-toast';

export const useAdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if we have a token
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const data = await adminUsersClient.getAdminUsers();
      setAdminUsers(data);
    } catch (err: any) {
      console.error('[useAdminUsers] Error fetching admin users:', err);
      setError(err.message || 'Failed to fetch admin users');
      toast.error('Failed to fetch admin users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  return {
    adminUsers,
    loading,
    error,
    refetch: fetchAdminUsers
  };
};

export const useDoctorUsers = () => {
  const [doctorUsers, setDoctorUsers] = useState<DoctorUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if we have a token
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const data = await adminUsersClient.getDoctorUsers();
      setDoctorUsers(data);
    } catch (err: any) {
      console.error('[useDoctorUsers] Error fetching doctor users:', err);
      setError(err.message || 'Failed to fetch doctor users');
      toast.error('Failed to fetch doctor users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorUsers();
  }, []);

  return {
    doctorUsers,
    loading,
    error,
    refetch: fetchDoctorUsers
  };
};

export const useUserDetails = (id: number | null) => {
  const [user, setUser] = useState<AdminUser | DoctorUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminUsersClient.getUserById(id);
        setUser(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user details');
        toast.error('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return {
    user,
    loading,
    error
  };
};

export const useUserActions = () => {
  const [loading, setLoading] = useState(false);

  const createUser = async (request: CreateUserRequest) => {
    setLoading(true);
    try {
      const newUser = await adminUsersClient.createUser(request);
      toast.success('User created successfully');
      return newUser;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (id: number, request: UpdateUserStatusRequest) => {
    setLoading(true);
    try {
      const updatedUser = await adminUsersClient.updateUserStatus(id, request);
      toast.success('User status updated successfully');
      return updatedUser;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createUser,
    updateUserStatus,
    loading
  };
}; 