/**
 * Cloudflare Stream and R2 helper utilities with enhanced thumbnail support
 */

export interface CloudflareStreamOptions {
  width?: number;
  height?: number;
  time?: string; // e.g., "10s", "1m30s", "25%"
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
}

export interface ThumbnailSizes {
  mobile: { width: number; height: number };
  tablet: { width: number; height: number };
  desktop: { width: number; height: number };
}

export const RESPONSIVE_THUMBNAIL_SIZES: ThumbnailSizes = {
  mobile: { width: 160, height: 90 },
  tablet: { width: 240, height: 135 },
  desktop: { width: 320, height: 180 }
};

export type ThumbnailStatus = 'loading' | 'ready' | 'processing' | 'error' | 'not-found';

/**
 * Get responsive thumbnail size based on screen size
 */
export const getResponsiveThumbnailSize = (): { width: number; height: number } => {
  if (typeof window === 'undefined') return RESPONSIVE_THUMBNAIL_SIZES.mobile;
  
  if (window.innerWidth < 768) return RESPONSIVE_THUMBNAIL_SIZES.mobile;
  if (window.innerWidth < 1024) return RESPONSIVE_THUMBNAIL_SIZES.tablet;
  return RESPONSIVE_THUMBNAIL_SIZES.desktop;
};

/**
 * Generate a thumbnail URL for a Cloudflare Stream video
 */
export const getCloudflareStreamThumbnail = (
  streamId: string, 
  options: CloudflareStreamOptions = {}
): string => {
  const responsiveSize = getResponsiveThumbnailSize();
  const {
    width = responsiveSize.width,
    height = responsiveSize.height,
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

/**
 * Generate different thumbnail sizes for responsive display
 */
export const getCloudflareStreamThumbnails = (streamId: string) => {
  return {
    mobile: getCloudflareStreamThumbnail(streamId, RESPONSIVE_THUMBNAIL_SIZES.mobile),
    tablet: getCloudflareStreamThumbnail(streamId, RESPONSIVE_THUMBNAIL_SIZES.tablet),
    desktop: getCloudflareStreamThumbnail(streamId, RESPONSIVE_THUMBNAIL_SIZES.desktop),
    original: getCloudflareStreamThumbnail(streamId, { width: 1280, height: 720 })
  };
};

/**
 * Create a thumbnail cache key
 */
export const createThumbnailCacheKey = (streamId: string, size: string): string => {
  return `thumbnail_${streamId}_${size}`;
};

/**
 * Simple in-memory thumbnail cache
 */
class ThumbnailCache {
  private cache = new Map<string, { url: string; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, url: string): void {
    this.cache.set(key, { url, timestamp: Date.now() });
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.url;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const thumbnailCache = new ThumbnailCache();
