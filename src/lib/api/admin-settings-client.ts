import httpClient from './http-client';

// Type definitions
export interface SystemSetting {
  setting_id: number;
  setting_key: string;
  setting_value: string;
  setting_category: string;
  data_type: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SettingsByCategory {
  [category: string]: {
    [key: string]: any;
  };
}

export interface SettingMetadata {
  dataType: string;
  description: string;
}

export interface SettingsMetadata {
  [category: string]: {
    [key: string]: SettingMetadata;
  };
}

export interface GetAllSettingsResponse {
  success: boolean;
  data: SettingsByCategory;
  metadata: SettingsMetadata;
}

export interface SettingCategory {
  name: string;
  display_name: string;
  count: number;
}

export interface UpdateSettingsRequest {
  settings: {
    [key: string]: any;
  };
}

export interface SettingValue {
  key: string;
  value: any;
  category: string;
  data_type: string;
  description: string;
}

// API client
export const adminSettingsClient = {
  // Get all settings grouped by category
  async getAllSettings(): Promise<GetAllSettingsResponse> {
    const response = await httpClient.get('/admin/settings');
    return response.data; // Return the full response including metadata
  },

  // Get settings by category
  async getSettingsByCategory(category: string): Promise<{ [key: string]: any }> {
    const response = await httpClient.get(`/admin/settings/category/${category}`);
    return response.data.data;
  },

  // Get setting categories
  async getCategories(): Promise<SettingCategory[]> {
    const response = await httpClient.get('/admin/settings/categories');
    return response.data.data;
  },

  // Get single setting by key
  async getSettingByKey(key: string): Promise<SettingValue> {
    const response = await httpClient.get(`/admin/settings/setting/${key}`);
    return response.data.data;
  },

  // Update multiple settings
  async updateSettings(settings: { [key: string]: any }): Promise<void> {
    await httpClient.put('/admin/settings', { settings });
  },

  // Update single setting
  async updateSetting(key: string, value: any): Promise<void> {
    await httpClient.put(`/admin/settings/setting/${key}`, { value });
  }
}; 