'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAdminSettings } from '@/hooks/admin/useAdminSettings';
import { Save, X, Edit, Settings as SettingsIcon } from 'lucide-react';
import { 
  validateNumber,
  validateJSON,
  validateTime,
  sanitizeText,
  ValidationResult
} from '@/utils/validation';

// Component for different setting input types with enhanced validation
const SettingInput = ({ 
  settingKey, 
  value, 
  dataType, 
  description, 
  onChange, 
  disabled = false 
}: {
  settingKey: string;
  value: any;
  dataType: string;
  description?: string;
  onChange: (key: string, value: any) => void;
  disabled?: boolean;
}) => {
  const [validationError, setValidationError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { type, value: inputValue } = e.target;
    let newValue: any = inputValue;
    let validationResult: ValidationResult = { isValid: true };

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (dataType === 'number') {
      const numValue = Number(inputValue) || 0;
      // Basic number validation based on setting type
      if (settingKey.includes('max_') || settingKey.includes('limit_')) {
        validationResult = validateNumber(numValue, 1, 10000, generateLabel(settingKey), false, false);
      } else if (settingKey.includes('fee') || settingKey.includes('cost')) {
        validationResult = validateNumber(numValue, 0, 100000, generateLabel(settingKey), false, true);
      } else {
        validationResult = validateNumber(numValue, 0, Number.MAX_SAFE_INTEGER, generateLabel(settingKey), false, true);
      }
      
      if (validationResult.isValid) {
        newValue = numValue;
      }
    } else if (dataType === 'json') {
      if (inputValue.trim()) {
        validationResult = validateJSON(inputValue, generateLabel(settingKey), false);
      }
      if (validationResult.isValid && inputValue.trim()) {
        try {
          newValue = JSON.parse(inputValue);
        } catch {
          newValue = inputValue; // Keep as string if JSON parsing fails
        }
      } else {
        newValue = inputValue;
      }
    } else {
      newValue = sanitizeText(inputValue);
    }

    setValidationError(validationResult.error || '');
    
    if (validationResult.isValid) {
      onChange(settingKey, newValue);
    }
  };

  const handleTimeChange = (timeType: 'start' | 'end', timeValue: string) => {
    const timeValidation = validateTime(timeValue);
    
    if (timeValidation.isValid) {
      const currentValue = typeof value === 'object' ? value : {};
      const newValue = { ...currentValue, [timeType]: timeValue };
      
      // Validate that start time is before end time
      if (newValue.start && newValue.end && newValue.start >= newValue.end) {
        setValidationError('Start time must be before end time');
        return;
      }
      
      setValidationError('');
      onChange(settingKey, newValue);
    } else {
      setValidationError(timeValidation.error || '');
    }
  };

  // Generate readable label from setting key
  const generateLabel = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const inputId = `setting-${settingKey}`;

  // Render different input types based on dataType
  switch (dataType) {
    case 'boolean':
      return (
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={inputId}
              checked={value || false}
              onChange={handleChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
              {generateLabel(settingKey)}
            </label>
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      );

    case 'number':
      return (
        <div className="mb-4">
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {generateLabel(settingKey)}
          </label>
          <input
            type="number"
            id={inputId}
            value={value || 0}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-50"
          />
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      );

    case 'json':
      // Special handling for working hours
      if (settingKey.startsWith('working_hours_') && settingKey !== 'working_hours_holiday_mode') {
        const timeData = typeof value === 'object' ? value : {};
        const dayName = settingKey.replace('working_hours_', '');
        
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {generateLabel(settingKey)}
            </label>
            <div className="space-y-2 p-3 border border-gray-300 rounded-md bg-gray-50">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={timeData.enabled || false}
                  onChange={(e) => {
                    const newValue = { ...timeData, enabled: e.target.checked };
                    onChange(settingKey, newValue);
                  }}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Enabled</span>
              </div>
              {timeData.enabled && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={timeData.start || '09:00'}
                      onChange={(e) => {
                        const newValue = { ...timeData, start: e.target.value };
                        onChange(settingKey, newValue);
                      }}
                      disabled={disabled}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={timeData.end || '17:00'}
                      onChange={(e) => {
                        const newValue = { ...timeData, end: e.target.value };
                        onChange(settingKey, newValue);
                      }}
                      disabled={disabled}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
          </div>
        );
      }

      // Default JSON handling
      return (
        <div className="mb-4">
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {generateLabel(settingKey)}
          </label>
          <textarea
            id={inputId}
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                const parsedValue = JSON.parse(e.target.value);
                onChange(settingKey, parsedValue);
              } catch (err) {
                // If invalid JSON, store as string for now
                onChange(settingKey, e.target.value);
              }
            }}
            disabled={disabled}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-50 font-mono text-sm"
          />
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      );

    case 'file':
      return (
        <div className="mb-4">
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {generateLabel(settingKey)}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id={inputId}
              value={value || ''}
              onChange={handleChange}
              disabled={disabled}
              placeholder="File path or URL"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-50"
            />
            <button
              type="button"
              disabled={disabled}
              className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Browse
            </button>
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      );

    default: // string
      // Special handling for time inputs
      if (settingKey.includes('time') && (settingKey.includes('break') || settingKey.includes('start') || settingKey.includes('end'))) {
        return (
          <div className="mb-4">
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
              {generateLabel(settingKey)}
            </label>
            <input
              type="time"
              id={inputId}
              value={value || ''}
              onChange={handleChange}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-50"
            />
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
          </div>
        );
      }

      if (settingKey.includes('address')) {
        return (
          <div className="mb-4">
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
              {generateLabel(settingKey)}
            </label>
            <textarea
              id={inputId}
              value={value || ''}
              onChange={handleChange}
              disabled={disabled}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-50"
            />
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
          </div>
        );
      }

      return (
        <div className="mb-4">
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {generateLabel(settingKey)}
          </label>
          <input
            type="text"
            id={inputId}
            value={value || ''}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-50"
          />
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      );
  }
};

// Main SettingsConfiguration component
export default function SettingsConfiguration() {
  const {
    settings,
    metadata,
    categories,
    loading,
    updating,
    error,
    updateSettings,
    getSettingsByCategory,
    getSettingMetadata,
    getCategoryMetadata
  } = useAdminSettings();

  const [activeCategory, setActiveCategory] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState<{ [key: string]: any }>({});

  // Initialize editing state when category changes
  useEffect(() => {
    if (settings[activeCategory]) {
      setEditedSettings(settings[activeCategory]);
    }
  }, [activeCategory, settings]);

  // Generate fallback categories from settings if categories API fails
  const availableCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories;
    }
    
    // Fallback: generate categories from settings keys
    return Object.keys(settings).map(categoryName => ({
      name: categoryName,
      count: Object.keys(settings[categoryName] || {}).length,
      display_name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace(/_/g, ' ')
    }));
  }, [categories, settings]);

  // Handle setting change during editing
  const handleSettingChange = (key: string, value: any) => {
    setEditedSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Start editing mode
  const startEditing = () => {
    setEditedSettings(settings[activeCategory] || {});
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedSettings(settings[activeCategory] || {});
    setIsEditing(false);
  };

  // Save settings
  const saveSettings = async () => {
    try {
      await updateSettings(editedSettings);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Get current category display name
  const getCurrentCategoryDisplayName = () => {
    const category = availableCategories.find(cat => cat.name === activeCategory);
    return category?.display_name || activeCategory;
  };

  if (loading && Object.keys(settings).length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const currentCategorySettings = settings[activeCategory] || {};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings & Configuration</h1>
              <p className="text-gray-600 mt-1">Manage system settings and configuration</p>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={cancelEditing}
                    disabled={updating}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={saveSettings}
                    disabled={updating}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updating ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={startEditing}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Settings</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Settings
                </h3>
              </div>
              <nav className="p-2">
                {availableCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setActiveCategory(category.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                      activeCategory === category.name
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.display_name}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {getCurrentCategoryDisplayName()}
                </h2>
              </div>
              
              <div className="p-6">
                {Object.keys(currentCategorySettings).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No settings found for this category
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(currentCategorySettings).map(([key, value]) => {
                      // Skip certain system fields from display
                      if (key.includes('_id') || key.includes('created_at') || key.includes('updated_at')) {
                        return null;
                      }

                      // Get metadata for this setting
                      const settingMetadata = getSettingMetadata(activeCategory, key);

                      return (
                        <SettingInput
                          key={key}
                          settingKey={key}
                          value={isEditing ? editedSettings[key] : value}
                          dataType={settingMetadata.dataType}
                          description={settingMetadata.description}
                          onChange={handleSettingChange}
                          disabled={!isEditing}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}