
export type VideoQuality = 'good' | 'better' | 'best';

export interface ProjectVideoSettings {
  video_quality: VideoQuality;
}

export const VIDEO_QUALITY_OPTIONS = [
  {
    value: 'good' as const,
    label: 'Good Quality',
    description: 'Standard compression, smaller file sizes',
    tier: 'free'
  },
  {
    value: 'better' as const,
    label: 'Better Quality', 
    description: 'Improved compression, balanced quality',
    tier: 'premium'
  },
  {
    value: 'best' as const,
    label: 'Best Quality',
    description: 'Minimal compression, highest quality',
    tier: 'professional'
  }
] as const;

export const getCompressionSettingsFromQuality = (quality: VideoQuality) => {
  const settings = {
    good: { quality: 0.6 },
    better: { quality: 0.8 },
    best: { quality: 0.9 }
  };
  
  return settings[quality];
};
