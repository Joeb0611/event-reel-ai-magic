
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings, Lock } from 'lucide-react';
import { VideoQuality, VIDEO_QUALITY_OPTIONS } from '@/utils/projectSettings';
import { useSubscription } from '@/contexts/SubscriptionContext';
import FeatureGate from '@/components/FeatureGate';
import { Badge } from '@/components/ui/badge';

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
      return;
    }
    if (option.tier === 'professional' && !hasFeatureAccess('video_quality_best', projectId)) {
      return;
    }

    onQualityChange(value);
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Video Quality Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Video Compression Quality</Label>
          <RadioGroup value={currentQuality} onValueChange={handleQualityChange}>
            {VIDEO_QUALITY_OPTIONS.map((option) => {
              const hasAccess = option.tier === 'free' || 
                (option.tier === 'premium' && hasFeatureAccess('video_quality_better', projectId)) ||
                (option.tier === 'professional' && hasFeatureAccess('video_quality_best', projectId));

              return (
                <div key={option.value} className="relative">
                  {hasAccess ? (
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex-1">
                        <Label htmlFor={option.value} className="cursor-pointer">
                          <div className="flex items-center gap-2 font-medium">
                            {option.label}
                            {option.tier !== 'free' && (
                              <Badge variant="secondary" className="text-xs">
                                {option.tier}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <FeatureGate 
                      feature={option.tier === 'premium' ? 'video_quality_better' : 'video_quality_best'}
                      projectId={projectId}
                      showBadge={true}
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-60 cursor-not-allowed">
                        <RadioGroupItem value={option.value} id={option.value} disabled />
                        <div className="flex-1">
                          <Label className="cursor-not-allowed">
                            <div className="flex items-center gap-2 font-medium">
                              <Lock className="w-4 h-4" />
                              {option.label}
                              <Badge variant="secondary" className="text-xs">
                                {option.tier}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                          </Label>
                        </div>
                      </div>
                    </FeatureGate>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        </div>
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Current setting:</strong> {VIDEO_QUALITY_OPTIONS.find(opt => opt.value === currentQuality)?.label}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            This setting applies to all video uploads for this project. Higher quality settings preserve more detail but result in larger file sizes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoQualitySettings;
