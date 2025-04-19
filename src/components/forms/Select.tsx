import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  variant?: 'default' | 'outline' | 'filled';
  selectSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      variant = 'default',
      selectSize = 'md',
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      outline: 'bg-transparent border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      filled: 'bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    };

    const sizes = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    const selectClasses = twMerge(
      'block w-full rounded-lg border shadow-sm transition-colors focus:outline-none focus:ring-1',
      variants[variant],
      sizes[selectSize],
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      className
    );

    return (
      <div className={twMerge('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={selectClasses}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(error || helperText) && (
          <p
            className={twMerge(
              'text-sm',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 