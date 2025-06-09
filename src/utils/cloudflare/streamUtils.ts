
/**
 * Extract file ID from various URL formats (focusing on R2 now)
 */
export const extractFileId = (input: string): string => {
  if (!input) return '';
  
  // Handle r2:// prefix
  if (input.startsWith('r2://')) {
    return input.replace('r2://', '');
  }
  
  // Extract from R2 public URLs
  if (input.includes('r2.cloudflarestorage.com')) {
    const match = input.match(/r2\.cloudflarestorage\.com\/[^\/]+\/(.+)/);
    return match ? match[1] : '';
  }
  
  // Assume it's already a clean file path
  return input;
};

/**
 * Check if a file path is a Cloudflare R2 object
 */
export const isCloudflareR2 = (filePath: string): boolean => {
  if (!filePath) return false;
  return filePath.startsWith('r2://') || filePath.includes('r2.cloudflarestorage.com');
};

/**
 * Check if file is an image based on extension
 */
export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

/**
 * Check if file is a video based on extension
 */
export const isVideoFile = (fileName: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
  return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};
