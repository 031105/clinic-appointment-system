import httpClient, { handleApiResponse, createHttpClient } from './http-client';
import authClient from './auth-client';
import patientClient from './patient-client';
import adminClient from './admin-client';
import doctorClient from './doctor-client';

// 类型导出
export type { ApiResponse } from './http-client';

// 导出HTTP客户端相关
export { httpClient, handleApiResponse, createHttpClient };

// 导出认证客户端
export { authClient };

// 导出患者客户端
export { patientClient };

// 导出管理员客户端
export { adminClient };

// 导出医生客户端
export { doctorClient };

// 默认导出所有API客户端的集合
export default {
  http: httpClient,
  auth: authClient,
  patient: patientClient,
  admin: adminClient,
  doctor: doctorClient
};
