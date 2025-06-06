
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
  testPremiumMode?: boolean;
}

const VideoQualitySettings = ({ 
  currentQuality, 
  onQualityChange, 
  projectId, 
  testPremiumMode = false 
}: VideoQualitySettingsProps) => {
  const { hasFeatureAccess } = useSubscription();
  const selectedOption = VIDEO_QUALITY_OPTIONS.find(opt => opt.value === currentQuality);

  const getFeatureAccess = (feature: string) => {
    if (testPremiumMode) return true;
    return hasFeatureAccess(feature, projectId);
  };

  const handleQualityChange = (value: VideoQuality) => {
    const option = VIDEO_QUALITY_OPTIONS.find(opt => opt.value === value);
    if (!option) return;

    // Check if user has access to this quality level
    if (option.tier === 'premium' && !getFeatureAccess('video_quality_better')) {
      if (!testPremiumMode) {
        alert('Please upgrade to Premium to access better video quality');
        return;
      }
    }
    if (option.tier === 'professional' && !getFeatureAccess('video_quality_best')) {
      if (!testPremiumMode) {
        alert('Please upgrade to Professional to access the best video quality');
        return;
      }
    }

    onQualityChange(value);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
          Video Quality
          {testPremiumMode && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              Test Mode
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={currentQuality} onValueChange={handleQualityChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIDEO_QUALITY_OPTIONS.map((option) => {
              const hasAccess = option.tier === 'free' || 
                (option.tier === 'premium' && getFeatureAccess('video_quality_better')) ||
                (option.tier === 'professional' && getFeatureAccess('video_quality_best'));

              return (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={!hasAccess}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.label}</span>
                    {option.tier !== 'free' && !testPremiumMode && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="w-2 h-2 mr-1" />
                        {option.tier}
                      </Badge>
                    )}
                    {option.tier !== 'free' && testPremiumMode && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        ✓ Unlocked
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selectedOption && (
          <p className="text-sm text-gray-600">{selectedOption.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoQualitySettings;
