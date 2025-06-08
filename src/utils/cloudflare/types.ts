
/**
 * Cloudflare Stream types and interfaces
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

export type ThumbnailStatus = 'loading' | 'ready' | 'processing' | 'error' | 'not-found';
