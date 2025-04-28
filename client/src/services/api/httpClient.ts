import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API基础URL，通常从环境变量中获取
const API_BASE_URL = 'http://localhost:3000/api';

// 创建axios实例
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
});

// 请求拦截器：添加认证令牌
httpClient.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 响应拦截器：处理常见错误和令牌刷新
httpClient.interceptors.response.use(
  // 成功响应处理
  (response: AxiosResponse) => response,
  // 错误响应处理
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // 如果是401错误（未授权）且不是刷新令牌请求
    if (error.response?.status === 401 && 
        originalRequest && 
        !originalRequest.headers?.['x-retry'] && 
        error.config?.url !== '/auth/refresh-token') {
      
      try {
        // 标记请求已重试，防止循环
        if (originalRequest.headers) {
          originalRequest.headers['x-retry'] = 'true';
        }
        
        // 尝试刷新令牌
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // 没有刷新令牌，直接登出
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // 调用刷新令牌接口
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        // 保存新的访问令牌
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        // 使用新令牌重新发送原始请求
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return httpClient(originalRequest);
      } catch (refreshError) {
        // 刷新令牌失败，清除用户状态
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // 处理其他错误
    return Promise.reject(error);
  }
);

// 简化API请求方法，并添加baseUrl属性
interface ApiClient {
  baseUrl: string;
  get: <T>(url: string, params?: any) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  patch: <T>(url: string, data?: any) => Promise<T>;
  delete: <T>(url: string, params?: any) => Promise<T>;
}

export const api: ApiClient = {
  baseUrl: API_BASE_URL,
  
  /**
   * GET请求
   * @param url 请求路径
   * @param params 查询参数
   */
  get: async <T>(url: string, params?: any): Promise<T> => {
    const response = await httpClient.get<T>(url, { params });
    return response.data;
  },
  
  /**
   * POST请求
   * @param url 请求路径
   * @param data 请求体数据
   */
  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await httpClient.post<T>(url, data);
    return response.data;
  },
  
  /**
   * PUT请求
   * @param url 请求路径
   * @param data 请求体数据
   */
  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await httpClient.put<T>(url, data);
    return response.data;
  },
  
  /**
   * PATCH请求
   * @param url 请求路径
   * @param data 请求体数据
   */
  patch: async <T>(url: string, data?: any): Promise<T> => {
    const response = await httpClient.patch<T>(url, data);
    return response.data;
  },
  
  /**
   * DELETE请求
   * @param url 请求路径
   * @param params 查询参数
   */
  delete: async <T>(url: string, params?: any): Promise<T> => {
    const response = await httpClient.delete<T>(url, { params });
    return response.data;
  },
};

export default httpClient; 