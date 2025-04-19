import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (time: string) => void;
  variant?: 'default' | 'outline' | 'filled';
  timePickerSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  minTime?: string;
  maxTime?: string;
  step?: number;
}

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  (
    {
      label,
      error,
      helperText,
      value,
      onChange,
      variant = 'default',
      timePickerSize = 'md',
      fullWidth = false,
      minTime,
      maxTime,
      step = 1800, // 30 minutes
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

    const inputClasses = twMerge(
      'block w-full rounded-lg border shadow-sm transition-colors focus:outline-none focus:ring-1',
      variants[variant],
      sizes[timePickerSize],
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
        <div className="relative">
          <input
            ref={ref}
            type="time"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            min={minTime}
            max={maxTime}
            step={step}
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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

TimePicker.displayName = 'TimePicker';

export default TimePicker; 