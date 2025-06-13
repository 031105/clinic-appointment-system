'use client';

import { useState, useEffect } from 'react';
import { getProfileImageUrl, handleImageError } from '@/utils/imageUtils';
import { User } from 'lucide-react';

interface PatientImageProps {
  userId: number | string;
  className?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  profileImageBlob?: string;
}

const sizeClasses = {
  xs: 'w-8 h-8',
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
};

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full'
};

/**
 * PatientImage component for displaying patient profile images from BLOB storage
 * 
 * @example
 * // Basic usage
 * <PatientImage userId={1} />
 * 
 * // With custom styling
 * <PatientImage 
 *   userId={1} 
 *   size="lg" 
 *   rounded="full" 
 *   className="border-2 border-blue-500" 
 * />
 * 
 * // With Blob data directly
 * <PatientImage 
 *   userId={1} 
 *   profileImageBlob="data:image/jpeg;base64,/9j/4AAQSkZJRgABA..." 
 * />
 */
const PatientImage = ({
  userId,
  className = '',
  alt = 'Patient profile',
  size = 'md',
  rounded = 'lg',
  profileImageBlob = ''
}: PatientImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset states when userId or profileImageBlob changes
    setIsLoading(true);
    setHasError(false);

    // 如果直接提供了Blob数据，直接使用它
    if (profileImageBlob) {
      setImageUrl(profileImageBlob);
      setIsLoading(false);
      return;
    }
    
    if (userId) {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      setImageUrl(`${getProfileImageUrl(userId)}?t=${timestamp}`);
    } else {
      setImageUrl('');
      setIsLoading(false);
      setHasError(true);
    }
  }, [userId, profileImageBlob]);

  const onLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const onError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const sizeClass = sizeClasses[size];
  const roundedClass = roundedClasses[rounded];

  // Determine icon size based on container size
  const getIconSize = () => {
    switch (size) {
      case 'xs': return 'w-4 h-4';
      case 'sm': return 'w-6 h-6';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
      case 'xl': return 'w-16 h-16';
      default: return 'w-8 h-8';
    }
  };

  return (
    <div className={`relative overflow-hidden ${sizeClass} ${roundedClass} bg-blue-100 flex items-center justify-center ${className}`}>
      {/* Loading spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="w-1/3 h-1/3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* The actual image */}
      {!hasError && imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onLoad={onLoad}
          onError={onError}
        />
      )}

      {/* Fallback icon when no image or error */}
      {hasError && (
        <User className={`${getIconSize()} text-blue-600`} />
      )}
    </div>
  );
};

export default PatientImage; 