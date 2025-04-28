import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  disabled?: boolean;
}

/**
 * FormField - Reusable form field component
 * Used across admin interface for consistent form styling
 */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  className = '',
  options = [],
  rows = 3,
  disabled = false,
}) => {
  // Common classes for all input types
  const baseInputClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
  const inputClasses = `${baseInputClasses} ${
    error ? 'border-red-300' : 'border-gray-300'
  } ${disabled ? 'bg-gray-100 text-gray-500' : ''}`;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            name={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className={inputClasses}
            rows={rows}
            disabled={disabled}
          />
        );

      case 'select':
        return (
          <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            required={required}
            className={inputClasses}
            disabled={disabled}
          >
            <option value="" disabled>
              {placeholder || 'Select an option'}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            id={id}
            name={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className={inputClasses}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField; 