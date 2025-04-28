import { api } from './httpClient';

// 评价类型
export interface Review {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  rating: number; // 1-5
  comment?: string;
  anonymous: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

// 创建评价请求
export interface CreateReviewRequest {
  doctorId: number;
  appointmentId?: number;
  rating: number;
  comment?: string;
  anonymous: boolean;
}

// 评价过滤参数
export interface ReviewFilterParams {
  doctorId?: number;
  patientId?: number;
  minRating?: number;
  maxRating?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

// 评价服务
export const reviewService = {
  /**
   * 获取医生的评价列表
   * @param doctorId 医生ID
   * @param params 过滤参数
   * @returns 评价列表
   */
  getDoctorReviews: async (doctorId: number, params?: Omit<ReviewFilterParams, 'doctorId'>): Promise<Review[]> => {
    return await api.get<Review[]>(`/doctors/${doctorId}/reviews`, params);
  },
  
  /**
   * 获取患者提交的评价列表
   * @param params 过滤参数
   * @returns 评价列表
   */
  getPatientReviews: async (params?: Omit<ReviewFilterParams, 'patientId'>): Promise<Review[]> => {
    return await api.get<Review[]>('/reviews/patient', params);
  },
  
  /**
   * 创建新评价
   * @param reviewData 评价数据
   * @returns 创建的评价
   */
  createReview: async (reviewData: CreateReviewRequest): Promise<Review> => {
    return await api.post<Review>('/reviews', reviewData);
  },
  
  /**
   * 更新评价
   * @param id 评价ID
   * @param reviewData 更新数据
   * @returns 更新后的评价
   */
  updateReview: async (id: number, reviewData: Partial<CreateReviewRequest>): Promise<Review> => {
    return await api.patch<Review>(`/reviews/${id}`, reviewData);
  },
  
  /**
   * 删除评价
   * @param id 评价ID
   */
  deleteReview: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
  
  /**
   * 获取评价详情
   * @param id 评价ID
   * @returns 评价详情
   */
  getReviewById: async (id: number): Promise<Review> => {
    return await api.get<Review>(`/reviews/${id}`);
  },
  
  /**
   * 获取医生的评价统计信息
   * @param doctorId 医生ID
   * @returns 统计信息
   */
  getDoctorReviewStats: async (doctorId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: string]: number };
  }> => {
    return await api.get<{
      averageRating: number;
      totalReviews: number;
      ratingDistribution: { [key: string]: number };
    }>(`/doctors/${doctorId}/review-stats`);
  },
  
  /**
   * 检查患者是否可以评价医生
   * @param doctorId 医生ID
   * @param appointmentId 预约ID
   * @returns 可否评价
   */
  canReviewDoctor: async (doctorId: number, appointmentId?: number): Promise<{ canReview: boolean; reason?: string }> => {
    return await api.get<{ canReview: boolean; reason?: string }>('/reviews/can-review', {
      doctorId,
      appointmentId
    });
  }
}; 