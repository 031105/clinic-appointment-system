import React from 'react';

interface FilterOption {
  id: string;
  label: string;
}

interface SearchFilterBarProps {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  className?: string;
}

/**
 * SearchFilterBar - Reusable search and filter component
 * Used in admin pages to filter lists and tables
 */
export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterOptions,
  filterValue,
  onFilterChange,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm ${className}`}>
      <div className={`grid ${filterOptions ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} gap-4`}>
        <div className={filterOptions ? 'md:col-span-2' : 'w-full'}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {filterOptions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterValue}
              onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar; 