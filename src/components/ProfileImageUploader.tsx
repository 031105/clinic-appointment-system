'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { uploadProfileImage, getProfileImageUrl, handleImageError } from '@/utils/imageUtils';

interface ProfileImageUploaderProps {
  userId?: number | string;
  onImageUpload?: (success: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  editable?: boolean;
}

const ProfileImageUploader = ({
  userId,
  onImageUpload,
  size = 'medium',
  className = '',
  editable = true
}: ProfileImageUploaderProps) => {
  const [imageUrl, setImageUrl] = useState<string>('/placeholder-doctor.png');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Determine size class based on prop
  const sizeClass = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  }[size];
  
  useEffect(() => {
    // Only set image URL if userId exists
    if (userId) {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      setImageUrl(`${getProfileImageUrl(userId)}?t=${timestamp}`);
    }
  }, [userId]);
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Upload the image to the server
      await uploadProfileImage(file);
      
      // Update the displayed image (add timestamp to prevent caching)
      if (userId) {
        const timestamp = new Date().getTime();
        setImageUrl(`${getProfileImageUrl(userId)}?t=${timestamp}`);
      }
      
      // Notify parent component if callback provided
      if (onImageUpload) {
        onImageUpload(true);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError('Failed to upload image. Please try again.');
      if (onImageUpload) {
        onImageUpload(false);
      }
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle image loading errors
  const onImageError = () => {
    setImageUrl('/placeholder-doctor.png');
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative ${sizeClass} rounded-full overflow-hidden bg-gray-200`}>
        {/* Display the current image */}
        <img
          src={imageUrl}
          alt="Profile"
          className="w-full h-full object-cover"
          onError={onImageError}
        />
        
        {/* Overlay with loading indicator or upload button */}
        {editable && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleUploadClick}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            )}
          </div>
        )}
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
      
      {/* Helper text for editable mode */}
      {editable && (
        <div className="text-gray-500 text-sm mt-2">
          Click to change profile image
        </div>
      )}
    </div>
  );
};

export default ProfileImageUploader; 