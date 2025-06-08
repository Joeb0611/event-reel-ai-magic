
import { CloudflareStreamOptions, ThumbnailSizes } from './types';

export const RESPONSIVE_THUMBNAIL_SIZES: ThumbnailSizes = {
  mobile: { width: 160, height: 90 },
  tablet: { width: 240, height: 135 },
  desktop: { width: 320, height: 180 }
};

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
