import { useState, useEffect, useCallback } from 'react';
import { 
  adminSettingsClient, 
  SettingsByCategory, 
  SettingCategory,
  SettingsMetadata,
  GetAllSettingsResponse
} from '@/lib/api/admin-settings-client';
import { toast } from 'react-hot-toast';

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<SettingsByCategory>({});
  const [metadata, setMetadata] = useState<SettingsMetadata>({});
  const [categories, setCategories] = useState<SettingCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: GetAllSettingsResponse = await adminSettingsClient.getAllSettings();
      setSettings(response.data);
      setMetadata(response.metadata);
    } catch (err: any) {
      console.error('[useAdminSettings] Error fetching settings:', err);
      setError(err.message || 'Failed to fetch settings');
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await adminSettingsClient.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('[useAdminSettings] Error fetching categories:', err);
      toast.error('Failed to fetch setting categories');
    }
  }, []);

  // Update multiple settings
  const updateSettings = useCallback(async (settingsToUpdate: { [key: string]: any }) => {
    setUpdating(true);
    setError(null);
    try {
      await adminSettingsClient.updateSettings(settingsToUpdate);
      
      // Update local state
      const updatedSettings = { ...settings };
      Object.entries(settingsToUpdate).forEach(([key, value]) => {
        // Find which category this setting belongs to and update it
        Object.keys(updatedSettings).forEach(category => {
          if (updatedSettings[category][key] !== undefined) {
            updatedSettings[category][key] = value;
          }
        });
      });
      setSettings(updatedSettings);
      
      toast.success('Settings updated successfully');
    } catch (err: any) {
      console.error('[useAdminSettings] Error updating settings:', err);
      setError(err.message || 'Failed to update settings');
      toast.error('Failed to update settings');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [settings]);

  // Update single setting
  const updateSetting = useCallback(async (key: string, value: any) => {
    setUpdating(true);
    setError(null);
    try {
      await adminSettingsClient.updateSetting(key, value);
      
      // Update local state
      const updatedSettings = { ...settings };
      Object.keys(updatedSettings).forEach(category => {
        if (updatedSettings[category][key] !== undefined) {
          updatedSettings[category][key] = value;
        }
      });
      setSettings(updatedSettings);
      
      toast.success('Setting updated successfully');
    } catch (err: any) {
      console.error('[useAdminSettings] Error updating setting:', err);
      setError(err.message || 'Failed to update setting');
      toast.error('Failed to update setting');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [settings]);

  // Get settings for a specific category
  const getSettingsByCategory = useCallback((category: string) => {
    return settings[category] || {};
  }, [settings]);

  // Get a specific setting value
  const getSettingValue = useCallback((key: string) => {
    for (const category of Object.keys(settings)) {
      if (settings[category][key] !== undefined) {
        return settings[category][key];
      }
    }
    return null;
  }, [settings]);

  // Get setting metadata (data type and description)
  const getSettingMetadata = useCallback((category: string, key: string) => {
    return metadata[category]?.[key] || { dataType: 'string', description: '' };
  }, [metadata]);

  // Get all metadata for a category
  const getCategoryMetadata = useCallback((category: string) => {
    return metadata[category] || {};
  }, [metadata]);

  // Initial data fetch
  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, [fetchSettings, fetchCategories]);

  return {
    settings,
    metadata,
    categories,
    loading,
    updating,
    error,
    fetchSettings,
    fetchCategories,
    updateSettings,
    updateSetting,
    getSettingsByCategory,
    getSettingValue,
    getSettingMetadata,
    getCategoryMetadata
  };
};

export const useAdminSettingsByCategory = (category: string) => {
  const [categorySettings, setCategorySettings] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings for specific category
  const fetchCategorySettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminSettingsClient.getSettingsByCategory(category);
      setCategorySettings(data);
    } catch (err: any) {
      console.error(`[useAdminSettingsByCategory] Error fetching settings for ${category}:`, err);
      setError(err.message || 'Failed to fetch settings');
      toast.error(`Failed to fetch ${category} settings`);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Update settings in this category
  const updateCategorySettings = useCallback(async (settingsToUpdate: { [key: string]: any }) => {
    setUpdating(true);
    setError(null);
    try {
      await adminSettingsClient.updateSettings(settingsToUpdate);
      
      // Update local state
      setCategorySettings(prev => ({
        ...prev,
        ...settingsToUpdate
      }));
      
      toast.success(`${category} settings updated successfully`);
    } catch (err: any) {
      console.error(`[useAdminSettingsByCategory] Error updating ${category} settings:`, err);
      setError(err.message || 'Failed to update settings');
      toast.error(`Failed to update ${category} settings`);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [category]);

  // Initial data fetch
  useEffect(() => {
    if (category) {
      fetchCategorySettings();
    }
  }, [category, fetchCategorySettings]);

  return {
    settings: categorySettings,
    loading,
    updating,
    error,
    fetchSettings: fetchCategorySettings,
    updateSettings: updateCategorySettings
  };
}; 