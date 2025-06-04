import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import VideoStyleSelector from './VideoStyleSelector';
import DurationSelector from './DurationSelector';
import ContentFocusSelector from './ContentFocusSelector';
import MusicStyleSelector from './MusicStyleSelector';
import MustIncludeToggle from './MustIncludeToggle';
import CustomMusicUpload from './CustomMusicUpload';
import FeatureGate from '@/components/FeatureGate';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useSubscription } from '@/contexts/SubscriptionContext';

export interface WeddingAISettings {
  videoStyle: 'romantic' | 'cinematic' | 'documentary' | 'energetic';
  duration: '30s' | '1min' | '2min' | '3min' | '5min';
  contentFocus: 'ceremony' | 'reception' | 'balanced' | 'emotional' | 'candid';
  musicStyle: 'romantic' | 'upbeat' | 'classical' | 'acoustic' | 'modern' | 'cinematic';
  includeMustInclude: boolean;
  useCustomMusic: boolean;
}

interface AISettingsPanelProps {
  settings: WeddingAISettings;
  onSettingsChange: (settings: WeddingAISettings) => void;
  mustIncludeCount?: number;
  projectId?: string;
}

const AISettingsPanel = ({ settings, onSettingsChange, mustIncludeCount = 0, projectId }: AISettingsPanelProps & { projectId?: string }) => {
  const { getProjectTier } = useSubscription();
  
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
  const isProfessional = currentTier === 'professional';

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Star className="w-6 h-6 text-purple-600" />
            Wedding AI Settings
          </CardTitle>
          <p className="text-gray-600">
            Customize how AI will create your perfect wedding highlight reel
          </p>
        </CardHeader>
      </Card>

      {/* Video Style */}
      <FeatureGate feature="all_styles" projectId={projectId}>
        <VideoStyleSelector
          value={settings.videoStyle}
          onChange={(value) => updateSetting('videoStyle', value)}
        />
      </FeatureGate>

      {/* Duration */}
      <SubscriptionGuard feature="duration_1min" projectId={projectId}>
        <DurationSelector
          value={settings.duration}
          onChange={(value) => updateSetting('duration', value)}
          isPremium={isPremium}
        />
      </SubscriptionGuard>

      {/* Content Focus */}
      <ContentFocusSelector
        value={settings.contentFocus}
        onChange={(value) => updateSetting('contentFocus', value)}
      />

      {/* Must Include Content */}
      <MustIncludeToggle
        checked={settings.includeMustInclude}
        onChange={(checked) => updateSetting('includeMustInclude', checked)}
        mustIncludeCount={mustIncludeCount}
      />

      {/* Music Style */}
      <MusicStyleSelector
        value={settings.musicStyle}
        onChange={(value) => updateSetting('musicStyle', value)}
        disabled={settings.useCustomMusic}
      />

      {/* Custom Music Upload */}
      <FeatureGate feature="custom_music" projectId={projectId}>
        <CustomMusicUpload
          checked={settings.useCustomMusic}
          onChange={(checked) => updateSetting('useCustomMusic', checked)}
          isPremium={isPremium}
        />
      </FeatureGate>
    </div>
  );
};

export default AISettingsPanel;
