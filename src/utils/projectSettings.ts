
export type VideoQuality = 'good' | 'better' | 'best';

export interface ProjectVideoSettings {
  video_quality: VideoQuality;
}

export const VIDEO_QUALITY_OPTIONS = [
  {
    value: 'good' as const,
    label: 'Good Quality',
    description: 'Standard streaming quality, optimized for fast playback',
    tier: 'free'
  },
  {
    value: 'better' as const,
    label: 'Better Quality', 
    description: 'Enhanced streaming quality with improved clarity',
    tier: 'premium'
  },
  {
    value: 'best' as const,
    label: 'Best Quality',
    description: 'Premium streaming quality with maximum clarity',
    tier: 'professional'
  }
] as const;
