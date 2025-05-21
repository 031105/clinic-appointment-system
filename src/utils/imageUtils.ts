/**
 * Utility functions for handling image BLOBs
 */

/**
 * Converts a user ID to an image URL
 * @param userId The user ID to get the profile image for
 * @returns A URL to the profile image directly from the backend
 */
export const getProfileImageUrl = (userId: number | string): string => {
  if (!userId) return '/images/placeholder-doctor.jpg';
  
  // 直接从后端获取图片，不再通过Next.js API路由
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  return `${backendUrl}/users/profile-image/${userId}`;
};

/**
 * Handles image loading errors by setting a fallback image
 * @param event The error event from the image
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
  const img = event.currentTarget;
  img.src = '/images/placeholder-doctor.jpg';
  img.onerror = null; // Prevent infinite loop if fallback also fails
};

/**
 * Uploads an image to the server
 * @param file The file to upload
 * @returns A promise that resolves to the API response
 */
export const uploadProfileImage = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('profileImage', file);

  try {
    // 使用完整的后端URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const response = await fetch(`${backendUrl}/users/profile-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}; 