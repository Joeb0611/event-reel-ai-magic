
/**
 * Main Cloudflare Stream and R2 helper utilities
 * Re-exports from smaller, focused modules
 */

// Re-export types
export type { CloudflareStreamOptions, ThumbnailSizes, ThumbnailStatus } from './cloudflare/types';

// Re-export thumbnail utilities
export {
  RESPONSIVE_THUMBNAIL_SIZES,
  getResponsiveThumbnailSize,
  getCloudflareStreamThumbnail,
  getCloudflareStreamThumbnails
} from './cloudflare/thumbnailUtils';

// Re-export stream utilities
export {
  extractStreamId,
  isCloudflareStream,
  isCloudflareR2
} from './cloudflare/streamUtils';

// Re-export status utilities
export {
  checkThumbnailAvailability,
  pollForThumbnail
} from './cloudflare/statusUtils';

// Re-export cache utilities
export {
  createThumbnailCacheKey,
  thumbnailCache
} from './cloudflare/cache';
