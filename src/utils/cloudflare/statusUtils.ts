
import { MediaStatus } from './types';

/**
 * Check if an R2 file is available by testing the URL
 */
export const checkFileAvailability = async (fileUrl: string): Promise<MediaStatus> => {
  if (!fileUrl) return 'not-found';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(fileUrl, { 
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return 'ready';
    } else if (response.status === 404) {
      return 'not-found';
    } else {
      return 'error';
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return 'error';
    }
    console.error('Error checking file availability:', error);
    return 'error';
  }
};

/**
 * Poll for file availability with exponential backoff
 */
export const pollForFile = async (
  fileUrl: string,
  maxAttempts: number = 5,
  initialDelay: number = 1000
): Promise<MediaStatus> => {
  let attempts = 0;
  let delay = initialDelay;

  while (attempts < maxAttempts) {
    const status = await checkFileAvailability(fileUrl);
    
    if (status === 'ready' || status === 'error' || status === 'not-found') {
      return status;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, delay));
    delay = Math.min(delay * 1.5, 10000); // Cap at 10 seconds
  }

  return 'error';
};
