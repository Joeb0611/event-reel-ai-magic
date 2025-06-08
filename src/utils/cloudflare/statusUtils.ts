import { ThumbnailStatus } from './types';
import { getCloudflareStreamThumbnail } from './thumbnailUtils';

/**
 * Check if a Cloudflare Stream thumbnail is available by testing the thumbnail URL
 */
export const checkThumbnailAvailability = async (streamId: string): Promise<ThumbnailStatus> => {
  try {
    const thumbnailUrl = getCloudflareStreamThumbnail(streamId);
    
    // Use a simple fetch with a timeout to check thumbnail availability
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(thumbnailUrl, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      // Thumbnail is available
      return 'ready';
    } else if (response.status === 404) {
      // Video is still processing
      return 'processing';
    } else {
      // Other error
      return 'error';
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      // Request was aborted due to timeout - likely still processing
      return 'processing';
    }
    console.error('Error checking thumbnail availability:', error);
    return 'processing'; // Assume still processing rather than error
  }
};

/**
 * Poll for thumbnail availability with exponential backoff
 */
export const pollForThumbnail = async (
  streamId: string,
  maxAttempts: number = 10,
  initialDelay: number = 2000
): Promise<ThumbnailStatus> => {
  let attempts = 0;
  let delay = initialDelay;

  while (attempts < maxAttempts) {
    const status = await checkThumbnailAvailability(streamId);
    
    if (status === 'ready' || status === 'error') {
      return status;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, delay));
    delay = Math.min(delay * 1.5, 30000); // Cap at 30 seconds
  }

  return 'error';
};
