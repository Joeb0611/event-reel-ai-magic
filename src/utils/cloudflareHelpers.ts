
/**
 * Cloudflare Stream and R2 helper utilities
 */

export interface CloudflareStreamOptions {
  width?: number;
  height?: number;
  time?: string; // e.g., "10s", "1m30s", "25%"
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
}

/**
 * Generate a thumbnail URL for a Cloudflare Stream video
 * @param streamId - The Cloudflare Stream video ID
 * @param options - Thumbnail options (width, height, time, fit)
 * @returns The thumbnail URL
 */
export const getCloudflareStreamThumbnail = (
  streamId: string, 
  options: CloudflareStreamOptions = {}
): string => {
  const {
    width = 320,
    height = 180,
    time = '1s',
    fit = 'scale-down'
  } = options;

  // Clean the stream ID to ensure it's valid
  const cleanStreamId = streamId.replace(/[^a-zA-Z0-9]/g, '');
  
  const params = new URLSearchParams({
    time,
    width: width.toString(),
    height: height.toString(),
    fit
  });

  return `https://videodelivery.net/${cleanStreamId}/thumbnails/thumbnail.jpg?${params}`;
};

/**
 * Extract Stream ID from various Cloudflare Stream URL formats
 * @param input - Stream ID, file path, or URL
 * @returns Clean stream ID
 */
export const extractStreamId = (input: string): string => {
  if (!input) return '';
  
  // Handle stream:// prefix
  if (input.startsWith('stream://')) {
    return input.replace('stream://', '');
  }
  
  // Handle iframe URLs
  if (input.includes('iframe.videodelivery.net')) {
    const match = input.match(/iframe\.videodelivery\.net\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  }
  
  // Handle videodelivery.net URLs
  if (input.includes('videodelivery.net')) {
    const match = input.match(/videodelivery\.net\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  }
  
  // Assume it's already a clean stream ID - extract only alphanumeric characters
  return input.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Check if a file path or URL is a Cloudflare Stream video
 * @param filePath - The file path or URL to check
 * @returns True if it's a Cloudflare Stream video
 */
export const isCloudflareStream = (filePath: string): boolean => {
  if (!filePath) return false;
  
  return filePath.startsWith('stream://') || 
         filePath.includes('videodelivery.net') || 
         filePath.includes('iframe.videodelivery.net');
};

/**
 * Check if a file path is a Cloudflare R2 object
 * @param filePath - The file path to check
 * @returns True if it's a Cloudflare R2 object
 */
export const isCloudflareR2 = (filePath: string): boolean => {
  if (!filePath) return false;
  return filePath.startsWith('r2://');
};

/**
 * Generate different thumbnail sizes for responsive display
 * @param streamId - The Cloudflare Stream video ID
 * @returns Object with different thumbnail sizes
 */
export const getCloudflareStreamThumbnails = (streamId: string) => {
  return {
    small: getCloudflareStreamThumbnail(streamId, { width: 160, height: 90 }),
    medium: getCloudflareStreamThumbnail(streamId, { width: 320, height: 180 }),
    large: getCloudflareStreamThumbnail(streamId, { width: 640, height: 360 }),
    original: getCloudflareStreamThumbnail(streamId, { width: 1280, height: 720 })
  };
};
