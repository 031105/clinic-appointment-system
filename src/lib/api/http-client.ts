import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

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
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 缩短超时时间为10秒，提高响应速度
    ...options
  });

  // 请求拦截器添加认证token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 如果传入了options中的headers.Authorization，优先使用它
      // 这样允许从会话中获取的token覆盖localStorage的token
      if (config.headers?.Authorization) {
        return config;
      }
      
      // 从localStorage获取token (仅在客户端) - 作为备选方案
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器处理常见错误
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      // 如果是401错误，清除token并重定向到登录页
      if (error.response?.status === 401) {
        console.error('认证失败:', error.response?.data);
        
        // 清除token
        localStorage.removeItem('accessToken');
        
        // 导航到登录页
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
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

// 添加一个缓存层以减少重复API调用
const apiCache = new Map();

// 带缓存的GET请求
export const cachedGet = async <T>(url: string, config?: AxiosRequestConfig, cacheTime = 60000): Promise<T> => {
  const cacheKey = `${url}-${JSON.stringify(config || {})}`;
  
  console.log(`[API DEBUG] cachedGet request for ${url} with cacheTime ${cacheTime}ms`);
  
  // 检查是否有缓存数据且未过期
  const cachedItem = apiCache.get(cacheKey);
  if (cachedItem && (Date.now() - cachedItem.timestamp < cacheTime)) {
    console.log(`[API DEBUG] Cache HIT for ${url} (age: ${(Date.now() - cachedItem.timestamp)/1000}s)`);
    return cachedItem.data as T;
  }
  
  console.log(`[API DEBUG] Cache MISS for ${url}, fetching from server`);
  
  try {
    // 无缓存或已过期，发起API请求
    console.log(`[API DEBUG] Making API call to ${url}`);
    const response = await defaultClient.get(url, config);
    console.log(`[API DEBUG] API response received for ${url}, status: ${response.status}`);
    
    const data = handleApiResponse<T>(response);
    console.log(`[API DEBUG] Data processed for ${url}`, 
      typeof data === 'object' ? 'object received' : 'non-object data');
    
    // 存入缓存
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    console.log(`[API DEBUG] Data cached for ${url}`);
    
    return data;
  } catch (error: any) {
    console.error(`[API DEBUG] Error fetching ${url}:`, error);
    if (error.response) {
      console.error(`[API DEBUG] Error response status: ${error.response.status}`);
      console.error(`[API DEBUG] Error response data:`, error.response.data);
    } else if (error.request) {
      console.error(`[API DEBUG] No response received. Request details:`, {
        method: 'GET',
        url: url,
        timeout: config?.timeout || defaultClient.defaults.timeout
      });
    }
    throw error;
  }
};

export { defaultClient, createHttpClient };

// 提供便捷方法来创建自定义的HTTP客户端
export default {
  create: createHttpClient,
  get: defaultClient.get,
  post: defaultClient.post,
  put: defaultClient.put,
  delete: defaultClient.delete,
  patch: defaultClient.patch,
  cachedGet // 导出带缓存的GET方法
};

// 创建基于会话的HTTP客户端
export const createSessionHttpClient = (session: any): AxiosInstance => {
  const token = session?.user?.token;
  
  if (!token) {
    console.warn('Creating HTTP client without access token. Authentication may fail.', {
      sessionKeys: session ? Object.keys(session) : [],
      hasUser: !!session?.user,
      userKeys: session?.user ? Object.keys(session.user) : []
    });
  } else {
    console.log(`Creating HTTP client with token (prefix: ${token.substring(0, 5)}...)`);
  }
  
  return createHttpClient({
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

/**
 * 创建一个带有认证的HTTP请求
 * @param url 请求URL
 * @param options 请求选项
 * @returns 带有认证头的fetch请求
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  // 从localStorage获取token - 修正键名为accessToken
  const token = localStorage.getItem('accessToken');
  
  // 创建请求头
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // 返回fetch请求
  return fetch(url, {
    ...options,
    headers
  });
}

/**
 * 创建一个简单的HTTP客户端，用于直接API调用
 */
export const apiClient = {
  /**
   * 发送GET请求
   * @param url 请求URL
   * @param requireAuth 是否需要认证
   */
  get: async (url: string, requireAuth = true) => {
    if (requireAuth) {
      return authenticatedFetch(url);
    }
    return fetch(url);
  },
  
  /**
   * 发送POST请求
   * @param url 请求URL
   * @param data 请求数据
   * @param requireAuth 是否需要认证
   */
  post: async (url: string, data: any, requireAuth = true) => {
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    
    if (requireAuth) {
      return authenticatedFetch(url, options);
    }
    return fetch(url, options);
  },
  
  /**
   * 发送PUT请求
   * @param url 请求URL
   * @param data 请求数据
   * @param requireAuth 是否需要认证
   */
  put: async (url: string, data: any, requireAuth = true) => {
    const options: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    
    if (requireAuth) {
      return authenticatedFetch(url, options);
    }
    return fetch(url, options);
  },
  
  /**
   * 发送DELETE请求
   * @param url 请求URL
   * @param requireAuth 是否需要认证
   */
  delete: async (url: string, requireAuth = true) => {
    const options: RequestInit = {
      method: 'DELETE'
    };
    
    if (requireAuth) {
      return authenticatedFetch(url, options);
    }
    return fetch(url, options);
  }
};