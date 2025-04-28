import { api } from './httpClient';
import { Department } from './doctorService';

// 科室服务
export const departmentService = {
  /**
   * 获取所有科室列表
   * @returns 科室列表
   */
  getAllDepartments: async (): Promise<Department[]> => {
    return await api.get<Department[]>('/departments');
  },
  
  /**
   * 根据ID获取科室详情
   * @param id 科室ID
   * @returns 科室详情
   */
  getDepartmentById: async (id: number): Promise<Department> => {
    return await api.get<Department>(`/departments/${id}`);
  },
  
  /**
   * 获取科室的医生列表
   * @param departmentId 科室ID
   * @returns 医生列表
   */
  getDepartmentDoctors: async (departmentId: number): Promise<any[]> => {
    return await api.get<any[]>(`/departments/${departmentId}/doctors`);
  },
  
  /**
   * 获取科室的统计信息
   * @param departmentId 科室ID
   * @returns 统计信息
   */
  getDepartmentStats: async (departmentId: number): Promise<{
    totalDoctors: number;
    totalAppointments: number;
    averageRating: number;
  }> => {
    return await api.get<{
      totalDoctors: number;
      totalAppointments: number;
      averageRating: number;
    }>(`/departments/${departmentId}/stats`);
  },
  
  /**
   * 搜索科室
   * @param query 搜索关键词
   * @returns 匹配的科室列表
   */
  searchDepartments: async (query: string): Promise<Department[]> => {
    return await api.get<Department[]>('/departments/search', { query });
  }
}; 