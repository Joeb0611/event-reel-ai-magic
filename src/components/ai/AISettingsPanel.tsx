import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import VideoStyleSelector from './VideoStyleSelector';
import DurationSelector from './DurationSelector';
import ContentFocusSelector from './ContentFocusSelector';
import MusicStyleSelector from './MusicStyleSelector';
import MustIncludeToggle from './MustIncludeToggle';
import CustomMusicUpload from './CustomMusicUpload';
import VideoQualitySettings from '@/components/VideoQualitySettings';
import FeatureGate from '@/components/FeatureGate';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { VideoQuality } from '@/utils/projectSettings';

export interface WeddingAISettings {
  videoStyle: 'romantic' | 'cinematic' | 'documentary' | 'energetic';
  duration: '30s' | '1min' | '2min' | '3min' | '5min';
  contentFocus: 'ceremony' | 'reception' | 'balanced' | 'emotional' | 'candid';
  musicStyle: 'romantic' | 'upbeat' | 'classical' | 'acoustic' | 'modern' | 'cinematic';
  includeMustInclude: boolean;
  useCustomMusic: boolean;
  videoQuality: VideoQuality;
}

interface AISettingsPanelProps {
  settings: WeddingAISettings;
  onSettingsChange: (settings: WeddingAISettings) => void;
  mustIncludeCount?: number;
  projectId?: string;
}

const AISettingsPanel = ({ settings, onSettingsChange, mustIncludeCount = 0, projectId }: AISettingsPanelProps) => {
  const { getProjectTier, hasFeatureAccess } = useSubscription();
  
  const updateSetting = <K extends keyof WeddingAISettings>(
    key: K,
    value: WeddingAISettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const currentTier = projectId ? getProjectTier(projectId) : 'free';
  const isPremium = currentTier === 'premium' || currentTier === 'professional';

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
            <Star className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            Wedding AI Settings
          </CardTitle>
          <p className="text-sm md:text-base text-gray-600">
            Customize how AI will create your perfect wedding highlight reel
          </p>
        </CardHeader>
      </Card>

      {/* Compact grid layout for mobile */}
      <div className="grid gap-4 md:gap-6">
        {/* Video Style & Quality - Combined on mobile */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <SubscriptionGuard feature="all_styles" projectId={projectId}>
            <VideoStyleSelector
              value={settings.videoStyle}
              onChange={(value) => updateSetting('videoStyle', value)}
            />
          </SubscriptionGuard>

          {projectId && (
            <VideoQualitySettings
              currentQuality={settings.videoQuality}
              onQualityChange={(quality) => updateSetting('videoQuality', quality)}
              projectId={projectId}
            />
          )}
        </div>

        {/* Duration & Content Focus - Combined row */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <DurationSelector
            value={settings.duration}
            onChange={(value) => updateSetting('duration', value)}
            projectId={projectId}
          />

          <ContentFocusSelector
            value={settings.contentFocus}
            onChange={(value) => updateSetting('contentFocus', value)}
          />
        </div>

        {/* Must Include Content */}
        <MustIncludeToggle
          checked={settings.includeMustInclude}
          onChange={(checked) => updateSetting('includeMustInclude', checked)}
          mustIncludeCount={mustIncludeCount}
        />

        {/* Music Settings - Combined row */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <MusicStyleSelector
            value={settings.musicStyle}
            onChange={(value) => updateSetting('musicStyle', value)}
            disabled={settings.useCustomMusic}
          />

          <FeatureGate feature="custom_music" projectId={projectId}>
            <CustomMusicUpload
              checked={settings.useCustomMusic}
              onChange={(checked) => updateSetting('useCustomMusic', checked)}
              isPremium={isPremium}
            />
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};

export default AISettingsPanel;
