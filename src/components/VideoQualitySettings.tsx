
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Crown } from 'lucide-react';
import { VideoQuality, VIDEO_QUALITY_OPTIONS } from '@/utils/projectSettings';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface VideoQualitySettingsProps {
  currentQuality: VideoQuality;
  onQualityChange: (quality: VideoQuality) => void;
  projectId: string;
}

const VideoQualitySettings = ({ currentQuality, onQualityChange, projectId }: VideoQualitySettingsProps) => {
  const { hasFeatureAccess } = useSubscription();

  const handleQualityChange = (value: VideoQuality) => {
    const option = VIDEO_QUALITY_OPTIONS.find(opt => opt.value === value);
    if (!option) return;

    // Check if user has access to this quality level
    if (option.tier === 'premium' && !hasFeatureAccess('video_quality_better', projectId)) {
      alert('Please upgrade to Premium to access better video quality');
      return;
    }
    if (option.tier === 'professional' && !hasFeatureAccess('video_quality_best', projectId)) {
      alert('Please upgrade to Professional to access the best video quality');
      return;
    }

    onQualityChange(value);
  };

  const selectedOption = VIDEO_QUALITY_OPTIONS.find(opt => opt.value === currentQuality);

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
          Video Quality
        </CardTitle>
        <p className="text-sm text-gray-600">Compression quality for all video uploads</p>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <Select value={currentQuality} onValueChange={handleQualityChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIDEO_QUALITY_OPTIONS.map((option) => {
              const hasAccess = option.tier === 'free' || 
                (option.tier === 'premium' && hasFeatureAccess('video_quality_better', projectId)) ||
                (option.tier === 'professional' && hasFeatureAccess('video_quality_best', projectId));

              return (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={!hasAccess}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.label}</span>
                    {option.tier !== 'free' && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="w-2 h-2 mr-1" />
                        {option.tier}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        {selectedOption && (
          <div className="p-2 md:p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs md:text-sm text-blue-800">
              <strong>Current:</strong> {selectedOption.label}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {selectedOption.description}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Applies to all video uploads for this project
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoQualitySettings;
