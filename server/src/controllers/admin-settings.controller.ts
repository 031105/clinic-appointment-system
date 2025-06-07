import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import dbClient from '../config/database';
import { logger } from '../utils/logger';

// Setting interfaces
interface SystemSetting {
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

interface SettingsByCategory {
  [category: string]: {
    [key: string]: any;
  };
}

interface UpdateSettingsRequest {
  settings: {
    [key: string]: any;
  };
}

export class AdminSettingsController {

  // Get all settings grouped by category
  async getAllSettings(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Getting all system settings');

      const query = `
        SELECT 
          setting_id,
          setting_key,
          setting_value,
          setting_category,
          data_type,
          description,
          is_active,
          created_at,
          updated_at
        FROM system_settings
        WHERE is_active = true
        ORDER BY setting_category, setting_key
      `;

      const result = await dbClient.query(query);
      const settings = result.rows as SystemSetting[];

      // Group settings by category and include both values and metadata
      const settingsByCategory: SettingsByCategory = {};
      const settingsMetadata: { [category: string]: { [key: string]: { dataType: string, description: string } } } = {};

      settings.forEach(setting => {
        if (!settingsByCategory[setting.setting_category]) {
          settingsByCategory[setting.setting_category] = {};
          settingsMetadata[setting.setting_category] = {};
        }

        let parsedValue: any = setting.setting_value;

        // Parse value based on data type
        switch (setting.data_type) {
          case 'boolean':
            parsedValue = setting.setting_value === 'true';
            break;
          case 'number':
            parsedValue = setting.setting_value ? Number(setting.setting_value) : 0;
            break;
          case 'json':
            try {
              parsedValue = JSON.parse(setting.setting_value || '{}');
            } catch (e) {
              parsedValue = {};
            }
            break;
          default:
            parsedValue = setting.setting_value || '';
        }

        settingsByCategory[setting.setting_category][setting.setting_key] = parsedValue;
        settingsMetadata[setting.setting_category][setting.setting_key] = {
          dataType: setting.data_type,
          description: setting.description
        };
      });

      logger.info(`Retrieved settings for ${Object.keys(settingsByCategory).length} categories`);

      res.json({
        success: true,
        data: settingsByCategory,
        metadata: settingsMetadata
      });

    } catch (error) {
      logger.error('Failed to get system settings:', error);
      next(new ApiError(500, 'Failed to get system settings'));
    }
  }

  // Get settings for a specific category
  async getSettingsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      logger.info(`Getting settings for category: ${category}`);

      const query = `
        SELECT 
          setting_id,
          setting_key,
          setting_value,
          setting_category,
          data_type,
          description,
          is_active,
          created_at,
          updated_at
        FROM system_settings
        WHERE setting_category = $1 AND is_active = true
        ORDER BY setting_key
      `;

      const result = await dbClient.query(query, [category]);
      const settings = result.rows as SystemSetting[];

      // Parse settings values
      const parsedSettings: { [key: string]: any } = {};

      settings.forEach(setting => {
        let parsedValue: any = setting.setting_value;

        switch (setting.data_type) {
          case 'boolean':
            parsedValue = setting.setting_value === 'true';
            break;
          case 'number':
            parsedValue = setting.setting_value ? Number(setting.setting_value) : 0;
            break;
          case 'json':
            try {
              parsedValue = JSON.parse(setting.setting_value || '{}');
            } catch (e) {
              parsedValue = {};
            }
            break;
          default:
            parsedValue = setting.setting_value || '';
        }

        parsedSettings[setting.setting_key] = parsedValue;
      });

      logger.info(`Retrieved ${settings.length} settings for category: ${category}`);

      res.json({
        success: true,
        data: parsedSettings,
        category: category
      });

    } catch (error) {
      logger.error(`Failed to get settings for category ${req.params.category}:`, error);
      next(new ApiError(500, 'Failed to get settings'));
    }
  }

  // Update multiple settings
  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body as UpdateSettingsRequest;
      
      if (!settings || typeof settings !== 'object') {
        throw new ApiError(400, 'Settings object is required');
      }

      logger.info('Updating system settings', { settingsCount: Object.keys(settings).length });

      const updatePromises: Promise<any>[] = [];

      for (const [settingKey, settingValue] of Object.entries(settings)) {
        // Convert value to string based on type
        let stringValue: string;
        
        if (typeof settingValue === 'boolean') {
          stringValue = settingValue.toString();
        } else if (typeof settingValue === 'number') {
          stringValue = settingValue.toString();
        } else if (typeof settingValue === 'object') {
          stringValue = JSON.stringify(settingValue);
        } else {
          stringValue = String(settingValue || '');
        }

        const updateQuery = `
          UPDATE system_settings 
          SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
          WHERE setting_key = $2 AND is_active = true
        `;

        updatePromises.push(
          dbClient.query(updateQuery, [stringValue, settingKey])
        );
      }

      await Promise.all(updatePromises);

      logger.info(`Successfully updated ${Object.keys(settings).length} settings`);

      res.json({
        success: true,
        message: 'Settings updated successfully',
        updated_count: Object.keys(settings).length
      });

    } catch (error) {
      logger.error('Failed to update settings:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to update settings'));
      }
    }
  }

  // Get a single setting by key
  async getSettingByKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      logger.info(`Getting setting: ${key}`);

      const query = `
        SELECT 
          setting_id,
          setting_key,
          setting_value,
          setting_category,
          data_type,
          description,
          is_active
        FROM system_settings
        WHERE setting_key = $1 AND is_active = true
      `;

      const result = await dbClient.query(query, [key]);

      if (result.rows.length === 0) {
        throw new ApiError(404, 'Setting not found');
      }

      const setting = result.rows[0] as SystemSetting;
      let parsedValue: any = setting.setting_value;

      // Parse value based on data type
      switch (setting.data_type) {
        case 'boolean':
          parsedValue = setting.setting_value === 'true';
          break;
        case 'number':
          parsedValue = setting.setting_value ? Number(setting.setting_value) : 0;
          break;
        case 'json':
          try {
            parsedValue = JSON.parse(setting.setting_value || '{}');
          } catch (e) {
            parsedValue = {};
          }
          break;
        default:
          parsedValue = setting.setting_value || '';
      }

      res.json({
        success: true,
        data: {
          key: setting.setting_key,
          value: parsedValue,
          category: setting.setting_category,
          data_type: setting.data_type,
          description: setting.description
        }
      });

    } catch (error) {
      logger.error(`Failed to get setting ${req.params.key}:`, error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to get setting'));
      }
    }
  }

  // Update a single setting
  async updateSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      logger.info(`Updating setting: ${key}`, { value });

      // Convert value to string
      let stringValue: string;
      
      if (typeof value === 'boolean') {
        stringValue = value.toString();
      } else if (typeof value === 'number') {
        stringValue = value.toString();
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
      } else {
        stringValue = String(value || '');
      }

      const query = `
        UPDATE system_settings 
        SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
        WHERE setting_key = $2 AND is_active = true
        RETURNING setting_id, setting_key, setting_value
      `;

      const result = await dbClient.query(query, [stringValue, key]);

      if (result.rows.length === 0) {
        throw new ApiError(404, 'Setting not found');
      }

      logger.info(`Successfully updated setting: ${key}`);

      res.json({
        success: true,
        message: 'Setting updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      logger.error(`Failed to update setting ${req.params.key}:`, error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to update setting'));
      }
    }
  }

  // Get available setting categories
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Getting setting categories');

      const query = `
        SELECT DISTINCT setting_category, COUNT(*) as setting_count
        FROM system_settings
        WHERE is_active = true
        GROUP BY setting_category
        ORDER BY setting_category
      `;

      const result = await dbClient.query(query);

      const categories = result.rows.map(row => ({
        name: row.setting_category,
        count: parseInt(row.setting_count),
        display_name: this.getCategoryDisplayName(row.setting_category)
      }));

      res.json({
        success: true,
        data: categories
      });

    } catch (error) {
      logger.error('Failed to get setting categories:', error);
      next(new ApiError(500, 'Failed to get setting categories'));
    }
  }

  // Helper method to get display names for categories
  private getCategoryDisplayName(category: string): string {
    const displayNames: { [key: string]: string } = {
      'general': 'General Settings',
      'working_hours': 'Working Hours',
      'appointments': 'Appointment Settings',
      'notifications': 'Notification Settings',
      'backup': 'Backup Settings',
      'security': 'Security Settings'
    };

    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }
}

export default new AdminSettingsController(); 