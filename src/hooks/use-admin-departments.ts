import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import adminClient, { 
  Department, 
  Service, 
  DepartmentRequest, 
  ServiceRequest,
  DepartmentStats,
  DepartmentDoctor 
} from '@/lib/api/admin-client';

// Hook for department management
export const useAdminDepartments = () => {
  const queryClient = useQueryClient();

  // Get departments list
  const {
    data: departments = [],
    isLoading: isLoadingDepartments,
    error: departmentsError,
    refetch: refetchDepartments
  } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: async () => {
      const response = await adminClient.getDepartments();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create department
  const createDepartmentMutation = useMutation({
    mutationFn: (data: DepartmentRequest) => adminClient.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      toast({ title: 'Department created successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to create department', 
        description: error?.response?.data?.message || 'Please try again later',
        variant: 'destructive'
      });
    }
  });

  // Update department
  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DepartmentRequest> }) =>
      adminClient.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      toast({ title: 'Department updated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update department', 
        description: error?.response?.data?.message || 'Please try again later',
        variant: 'destructive'
      });
    }
  });

  // Delete department
  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: number) => adminClient.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      toast({ title: 'Department deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to delete department', 
        description: error?.response?.data?.message || 'Please try again later',
        variant: 'destructive'
      });
    }
  });

  return {
    // Data
    departments,
    isLoadingDepartments,
    departmentsError,
    
    // Operations
    refetchDepartments,
    createDepartment: createDepartmentMutation.mutate,
    updateDepartment: updateDepartmentMutation.mutate,
    deleteDepartment: deleteDepartmentMutation.mutate,
    
    // Status
    isCreatingDepartment: createDepartmentMutation.isPending,
    isUpdatingDepartment: updateDepartmentMutation.isPending,
    isDeletingDepartment: deleteDepartmentMutation.isPending,
  };
};

// Hook for department services management
export const useAdminDepartmentServices = (departmentId: number | null) => {
  const queryClient = useQueryClient();

  // Get department services list
  const {
    data: services = [],
    isLoading: isLoadingServices,
    error: servicesError,
    refetch: refetchServices
  } = useQuery({
    queryKey: ['admin', 'departments', departmentId, 'services'],
    queryFn: async () => {
      if (!departmentId) return [];
      const response = await adminClient.getDepartmentServices(departmentId);
      return response;
    },
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create service
  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceRequest) => {
      if (!departmentId) throw new Error('Department ID is required');
      return adminClient.createService(departmentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'departments', departmentId, 'services'] 
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      toast({ title: 'Service created successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to create service', 
        description: error?.response?.data?.message || 'Please try again later',
        variant: 'destructive'
      });
    }
  });

  // Update service
  const updateServiceMutation = useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: number; data: Partial<ServiceRequest> }) => {
      if (!departmentId) throw new Error('Department ID is required');
      console.log(`Updating service ${serviceId} in department ${departmentId}`);
      console.log('Service update data:', data);
      return adminClient.updateService(departmentId, serviceId, data);
    },
    onSuccess: (result) => {
      console.log('Service updated successfully:', result);
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'departments', departmentId, 'services'] 
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      toast({ 
        title: 'Service updated successfully',
        description: 'The service has been updated with the new information',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      console.error('Update service error:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to update service. Please try again later.';
      
      toast({ 
        title: 'Failed to update service', 
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  // Delete service
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: number) => {
      if (!departmentId) throw new Error('Department ID is required');
      return adminClient.deleteService(departmentId, serviceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'departments', departmentId, 'services'] 
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      toast({ title: 'Service deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to delete service', 
        description: error?.response?.data?.message || 'Please try again later',
        variant: 'destructive'
      });
    }
  });

  return {
    // Data
    services,
    isLoadingServices,
    servicesError,
    
    // Operations
    refetchServices,
    createService: createServiceMutation.mutate,
    updateService: updateServiceMutation.mutate,
    deleteService: deleteServiceMutation.mutate,
    
    // Status
    isCreatingService: createServiceMutation.isPending,
    isUpdatingService: updateServiceMutation.isPending,
    isDeletingService: deleteServiceMutation.isPending,
  };
};

// Hook for department statistics
export const useAdminDepartmentStats = (departmentId: number | null) => {
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin', 'departments', departmentId, 'stats'],
    queryFn: async () => {
      if (!departmentId) return null;
      const response = await adminClient.getDepartmentStats(departmentId);
      return response;
    },
    enabled: !!departmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    stats,
    isLoadingStats,
    statsError,
    refetchStats,
  };
};

// Hook for department doctors management
export const useAdminDepartmentDoctors = (departmentId: number | null) => {
  const queryClient = useQueryClient();

  // Get department doctors list
  const {
    data: doctors = [],
    isLoading: isLoadingDoctors,
    error: doctorsError,
    refetch: refetchDoctors
  } = useQuery({
    queryKey: ['admin', 'departments', departmentId, 'doctors'],
    queryFn: async () => {
      if (!departmentId) return [];
      const response = await adminClient.getDepartmentDoctors(departmentId);
      return response;
    },
    enabled: !!departmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get unassigned doctors
  const {
    data: unassignedDoctors = [],
    isLoading: isLoadingUnassigned,
    error: unassignedError,
    refetch: refetchUnassigned
  } = useQuery({
    queryKey: ['admin', 'departments', 'unassigned', 'doctors'],
    queryFn: async () => {
      const response = await adminClient.getUnassignedDoctors();
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Assign doctor to department
  const assignDoctorMutation = useMutation({
    mutationFn: ({ doctorId }: { doctorId: number }) => {
      if (!departmentId) throw new Error('Department ID is required');
      return adminClient.assignDoctorToDepartment(departmentId, doctorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'departments', departmentId, 'doctors'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'departments', 'unassigned', 'doctors'] 
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      toast({ title: 'Doctor assigned successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to assign doctor', 
        description: error?.response?.data?.message || 'Please try again later',
        variant: 'destructive'
      });
    }
  });

  // Remove doctor from department
  const removeDoctorMutation = useMutation({
    mutationFn: ({ doctorId }: { doctorId: number }) => {
      if (!departmentId) throw new Error('Department ID is required');
      console.log(`Removing doctor ${doctorId} from department ${departmentId}`);
      return adminClient.removeDoctorFromDepartment(departmentId, doctorId);
    },
    onSuccess: () => {
      console.log('Doctor removed successfully, invalidating queries...');
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'departments', departmentId, 'doctors'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'departments', 'unassigned', 'doctors'] 
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      toast({ 
        title: 'Doctor removed successfully',
        description: 'The doctor has been moved to unassigned status',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      console.error('Remove doctor error:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to remove doctor. Please try again later.';
      
      toast({ 
        title: 'Failed to remove doctor', 
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  return {
    // Data
    doctors,
    unassignedDoctors,
    isLoadingDoctors,
    isLoadingUnassigned,
    doctorsError,
    unassignedError,
    
    // Operations
    refetchDoctors,
    refetchUnassigned,
    assignDoctor: assignDoctorMutation.mutate,
    removeDoctor: removeDoctorMutation.mutate,
    
    // Status
    isAssigningDoctor: assignDoctorMutation.isPending,
    isRemovingDoctor: removeDoctorMutation.isPending,
  };
}; 