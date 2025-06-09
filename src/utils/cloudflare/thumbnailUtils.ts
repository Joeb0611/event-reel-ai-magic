
import { MediaOptions, ThumbnailSizes } from './types';

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
 * Generate a thumbnail URL for R2 images (using Cloudflare Image Resizing if available)
 */
export const getR2ImageThumbnail = (
  r2Url: string, 
  options: MediaOptions = {}
): string => {
  if (!r2Url) return '';
  
  const responsiveSize = getResponsiveThumbnailSize();
  const {
    width = responsiveSize.width,
    height = responsiveSize.height,
    quality = 85,
    format = 'auto'
  } = options;

  // For now, return the original R2 URL since we're not using Cloudflare Images transform
  // In the future, this could be enhanced with Cloudflare Images transforms
  return r2Url;
};

/**
 * Generate different thumbnail sizes for responsive display
 */
export const getR2ImageThumbnails = (r2Url: string) => {
  return {
    mobile: getR2ImageThumbnail(r2Url, RESPONSIVE_THUMBNAIL_SIZES.mobile),
    tablet: getR2ImageThumbnail(r2Url, RESPONSIVE_THUMBNAIL_SIZES.tablet),
    desktop: getR2ImageThumbnail(r2Url, RESPONSIVE_THUMBNAIL_SIZES.desktop),
    original: r2Url
  };
};
