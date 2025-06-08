
/**
 * Extract Stream ID from various Cloudflare Stream URL formats
 */
export const extractStreamId = (input: string): string => {
  if (!input) return '';
  
  // Handle stream:// prefix
  if (input.startsWith('stream://')) {
    return input.replace('stream://', '');
  }
  
  // Handle iframe URLs (should not be used, but handle for backwards compatibility)
  if (input.includes('iframe.videodelivery.net')) {
    const match = input.match(/iframe\.videodelivery\.net\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  }
  
  // Handle videodelivery.net URLs (manifest URLs)
  if (input.includes('videodelivery.net')) {
    const match = input.match(/videodelivery\.net\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  }
  
  // Assume it's already a clean stream ID - extract only alphanumeric characters
  return input.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Check if a file path or URL is a Cloudflare Stream video
 */
export const isCloudflareStream = (filePath: string): boolean => {
  if (!filePath) return false;
  
  return filePath.startsWith('stream://') || 
         filePath.includes('videodelivery.net');
};

/**
 * Check if a file path is a Cloudflare R2 object
 */
export const isCloudflareR2 = (filePath: string): boolean => {
  if (!filePath) return false;
  return filePath.startsWith('r2://');
};
