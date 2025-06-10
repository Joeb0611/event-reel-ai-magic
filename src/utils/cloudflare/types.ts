
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

// Updated EventMoment type to match the AI service
export type EventMomentType = 'main_event' | 'celebration' | 'emotional' | 'group' | 'performance' | 'speech';

export interface EventMoment {
  type: EventMomentType;
  subtype?: string;
  description: string;
  timestamp: number;
  duration: number;
  confidence: number;
}
