
/**
 * Main Cloudflare R2 helper utilities
 * Re-exports from smaller, focused modules
 */

// Re-export types
export type { MediaOptions, ThumbnailSizes, MediaStatus } from './cloudflare/types';

// Re-export thumbnail utilities
export {
  RESPONSIVE_THUMBNAIL_SIZES,
  getResponsiveThumbnailSize,
  getR2ImageThumbnail,
  getR2ImageThumbnails
} from './cloudflare/thumbnailUtils';

// Re-export file utilities
export {
  extractFileId,
  isCloudflareR2,
  isImageFile,
  isVideoFile
} from './cloudflare/streamUtils';

// Re-export status utilities
export {
  checkFileAvailability,
  pollForFile
} from './cloudflare/statusUtils';

// Re-export cache utilities
export {
  createThumbnailCacheKey,
  thumbnailCache
} from './cloudflare/cache';

// Legacy exports for backward compatibility - these will be removed
export const isCloudflareStream = () => false;
export const extractStreamId = () => '';
export const getCloudflareStreamThumbnail = () => '';
