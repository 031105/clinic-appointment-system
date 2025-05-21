'use client';

import React, { useState } from 'react';

interface TabProps {
  value: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ value, label, isActive, onClick }) => {
  return (
    <button
      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
        isActive 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  // Filter and clone the Tab children to pass props
  const tabs = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === Tab) {
      return React.cloneElement(child, {
        isActive: child.props.value === value,
        onClick: () => onValueChange(child.props.value)
      });
    }
    return child;
  });

  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-4">
        {tabs}
      </div>
    </div>
  );
}; 