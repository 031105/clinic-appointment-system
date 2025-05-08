import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

// HTTP响应类型
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

// 创建默认axios实例
const createHttpClient = (options: AxiosRequestConfig = {}): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 默认超时30秒
    ...options
  });

  // 请求拦截器添加认证token
  client.interceptors.request.use(
    (config) => {
      // 从localStorage获取token (仅在客户端)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器处理常见错误
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // 如果是401错误，且还没有尝试过刷新token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // 尝试刷新token
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            throw new Error('无刷新令牌');
          }
          
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
            { refreshToken }
          );
          
          // 保存新token
          if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            // 更新原始请求的Authorization头
            originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
            
            // 重试原始请求
            return client(originalRequest);
          }
        } catch (refreshError) {
          // 刷新token失败，可能需要重新登录
          console.error('Token刷新失败:', refreshError);
          
          // 清除token
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // 导航到登录页
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      }
      
      // 处理网络错误
      if (!error.response) {
        console.error('网络错误，请检查您的网络连接');
      }
      
      // 服务器错误
      if (error.response?.status >= 500) {
        console.error('服务器错误，请稍后再试');
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// 创建一个默认客户端实例导出
const defaultClient = createHttpClient();

// 工具方法：处理响应数据
export const handleApiResponse = <T>(response: AxiosResponse): T => {
  // 如果API遵循标准响应格式 { success, message, data }
  if (response.data && typeof response.data === 'object') {
    if ('data' in response.data) {
      return response.data.data as T;
    }
  }
  
  // 如果API直接返回数据
  return response.data as T;
};

export { defaultClient, createHttpClient };

// 提供便捷方法来创建自定义的HTTP客户端
export default {
  create: createHttpClient,
  get: defaultClient.get,
  post: defaultClient.post,
  put: defaultClient.put,
  delete: defaultClient.delete,
  patch: defaultClient.patch
}; 