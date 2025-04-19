import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: 'default' | 'outline' | 'filled';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onSearch?: () => void;
  className?: string;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Search...',
      variant = 'default',
      inputSize = 'md',
      fullWidth = false,
      onSearch,
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
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    const inputClasses = twMerge(
      'block w-full rounded-lg border shadow-sm transition-colors focus:outline-none focus:ring-1 pl-10',
      variants[variant],
      sizes[inputSize],
      className
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch();
      }
    };

    return (
      <div className={twMerge('relative', fullWidth && 'w-full')}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClasses}
          {...props}
        />
        {onSearch && (
          <button
            type="button"
            onClick={onSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar; 