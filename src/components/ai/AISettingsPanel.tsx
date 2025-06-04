import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import VideoStyleSelector from './VideoStyleSelector';
import DurationSelector from './DurationSelector';
import ContentFocusSelector from './ContentFocusSelector';
import MusicStyleSelector from './MusicStyleSelector';
import MustIncludeToggle from './MustIncludeToggle';
import CustomMusicUpload from './CustomMusicUpload';

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
  isPremium?: boolean;
}

const AISettingsPanel = ({ settings, onSettingsChange, mustIncludeCount = 0, isPremium = false }: AISettingsPanelProps) => {
  const updateSetting = <K extends keyof WeddingAISettings>(
    key: K,
    value: WeddingAISettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

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
      <VideoStyleSelector
        value={settings.videoStyle}
        onChange={(value) => updateSetting('videoStyle', value)}
      />

      {/* Duration */}
      <DurationSelector
        value={settings.duration}
        onChange={(value) => updateSetting('duration', value)}
      />

      {/* Content Focus */}
      <ContentFocusSelector
        value={settings.contentFocus}
        onChange={(value) => updateSetting('contentFocus', value)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Music Style */}
        <MusicStyleSelector
          value={settings.musicStyle}
          onChange={(value) => updateSetting('musicStyle', value)}
          disabled={settings.useCustomMusic}
        />

        {/* Must Include Content */}
        <MustIncludeToggle
          checked={settings.includeMustInclude}
          onChange={(checked) => updateSetting('includeMustInclude', checked)}
          mustIncludeCount={mustIncludeCount}
        />
      </div>

      {/* Custom Music Upload */}
      <CustomMusicUpload
        checked={settings.useCustomMusic}
        onChange={(checked) => updateSetting('useCustomMusic', checked)}
        isPremium={isPremium}
      />
    </div>
  );
};

export default AISettingsPanel;
