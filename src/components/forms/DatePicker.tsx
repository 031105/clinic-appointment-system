import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  variant?: 'default' | 'outline' | 'filled';
  datePickerSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      value,
      onChange,
      variant = 'default',
      datePickerSize = 'md',
      fullWidth = false,
      minDate,
      maxDate,
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);

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

    const inputClasses = twMerge(
      'block w-full rounded-lg border shadow-sm transition-colors focus:outline-none focus:ring-1',
      variants[variant],
      sizes[datePickerSize],
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      className
    );

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = new Date(e.target.value);
      onChange?.(date);
    };

    return (
      <div className={twMerge('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="date"
            value={value ? format(value, 'yyyy-MM-dd') : ''}
            onChange={handleDateChange}
            min={minDate ? format(minDate, 'yyyy-MM-dd') : undefined}
            max={maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined}
            className={inputClasses}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
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

DatePicker.displayName = 'DatePicker';

export default DatePicker; 