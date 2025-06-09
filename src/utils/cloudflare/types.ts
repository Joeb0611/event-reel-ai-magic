
/**
 * Cloudflare R2 and general media types
 */

export interface MediaOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
}

export interface ThumbnailSizes {
  mobile: { width: number; height: number };
  tablet: { width: number; height: number };
  desktop: { width: number; height: number };
}

export type MediaStatus = 'loading' | 'ready' | 'processing' | 'error' | 'not-found';
