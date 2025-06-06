
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import VideoStyleSelector from './VideoStyleSelector';
import DurationSelector from './DurationSelector';
import ContentFocusSelector from './ContentFocusSelector';
import MusicStyleSelector from './MusicStyleSelector';
import CustomMusicUpload from './CustomMusicUpload';
import MustIncludeToggle from './MustIncludeToggle';
import VideoQualitySettings from '../VideoQualitySettings';
import { VideoQuality } from '@/utils/projectSettings';
import { useSubscription } from '@/contexts/SubscriptionContext';

export interface WeddingAISettings {
  videoStyle: 'romantic' | 'cinematic' | 'upbeat' | 'elegant' | 'vintage' | 'modern';
  duration: '30s' | '1min' | '2min' | '3min' | '5min';
  contentFocus: 'ceremony' | 'reception' | 'balanced' | 'highlights';
  musicStyle: 'romantic' | 'upbeat' | 'classical' | 'acoustic' | 'modern' | 'cinematic';
  includeMustInclude: boolean;
  useCustomMusic: boolean;
  videoQuality: VideoQuality;
}

interface AISettingsPanelProps {
  settings: WeddingAISettings;
  onSettingsChange: (settings: WeddingAISettings) => void;
  mustIncludeCount: number;
  projectId: string;
  testPremiumMode?: boolean;
}

const AISettingsPanel = ({ 
  settings, 
  onSettingsChange, 
  mustIncludeCount, 
  projectId,
  testPremiumMode = false
}: AISettingsPanelProps) => {
  const { hasFeatureAccess } = useSubscription();

  // Override premium access check if in test mode
  const getTestableFeatureAccess = (feature: string) => {
    if (testPremiumMode) return true;
    return hasFeatureAccess(feature, projectId);
  };

  const updateSetting = <K extends keyof WeddingAISettings>(
    key: K, 
    value: WeddingAISettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleQualityChange = (quality: VideoQuality) => {
    updateSetting('videoQuality', quality);
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50/20">
        <CardHeader>
          <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            AI Video Settings
            {testPremiumMode && (
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                🧪 Test Mode
              </span>
            )}
          </CardTitle>
          <p className="text-purple-700">
            Configure how AI will create your wedding highlight reel
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Style */}
          <VideoStyleSelector 
            value={settings.videoStyle}
            onChange={(value) => updateSetting('videoStyle', value)}
          />

          {/* Duration */}
          <DurationSelector
            value={settings.duration}
            onChange={(value) => updateSetting('duration', value)}
            projectId={projectId}
            testPremiumMode={testPremiumMode}
          />

          {/* Content Focus */}
          <ContentFocusSelector
            value={settings.contentFocus}
            onChange={(value) => updateSetting('contentFocus', value)}
          />

          {/* Video Quality */}
          <VideoQualitySettings
            currentQuality={settings.videoQuality}
            onQualityChange={handleQualityChange}
            projectId={projectId}
            testPremiumMode={testPremiumMode}
          />

          {/* Music Style */}
          <MusicStyleSelector
            value={settings.musicStyle}
            onChange={(value) => updateSetting('musicStyle', value)}
            disabled={settings.useCustomMusic}
          />

          {/* Custom Music Upload */}
          <CustomMusicUpload
            checked={settings.useCustomMusic}
            onChange={(checked) => updateSetting('useCustomMusic', checked)}
            isPremium={getTestableFeatureAccess('custom_music')}
          />
        </CardContent>
      </Card>

      {/* Must Include Toggle */}
      {mustIncludeCount > 0 && (
        <MustIncludeToggle
          checked={settings.includeMustInclude}
          onChange={(checked) => updateSetting('includeMustInclude', checked)}
          count={mustIncludeCount}
        />
      )}
    </div>
  );
};

export default AISettingsPanel;
