
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Crown, Lock } from 'lucide-react';
import VideoStyleSelector from './VideoStyleSelector';
import DurationSelector from './DurationSelector';
import ContentFocusSelector from './ContentFocusSelector';
import CustomMusicUpload from './CustomMusicUpload';
import MustIncludeToggle from './MustIncludeToggle';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

export interface EventAISettings {
  videoStyle: 'romantic' | 'cinematic' | 'upbeat' | 'elegant' | 'vintage' | 'modern';
  duration: '30s' | '1min' | '2min' | '3min' | '5min';
  contentFocus: 'main_event' | 'celebration' | 'balanced' | 'highlights';
  includeMustInclude: boolean;
  useCustomMusic: boolean;
}

// Legacy support
export type WeddingAISettings = EventAISettings;

interface AISettingsPanelProps {
  settings: EventAISettings;
  onSettingsChange: (settings: EventAISettings) => void;
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

  const hasAIAccess = testPremiumMode || hasFeatureAccess('ai_editing', projectId);

  const updateSetting = <K extends keyof EventAISettings>(
    key: K, 
    value: EventAISettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  if (!hasAIAccess) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-gray-900">AI Video Creation</CardTitle>
          <p className="text-sm text-gray-600">
            Unlock AI-powered video creation to automatically generate beautiful highlight reels from your photos and videos.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Premium Feature</span>
            </div>
            <Button 
              onClick={() => window.open('/subscription', '_blank')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5" />
          AI Video Settings
          {testPremiumMode && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Premium
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Customize how AI creates your video from the uploaded content
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <VideoStyleSelector
          value={settings.videoStyle}
          onChange={(value) => updateSetting('videoStyle', value)}
        />

        <DurationSelector
          value={settings.duration}
          onChange={(value) => updateSetting('duration', value)}
        />

        <ContentFocusSelector
          value={settings.contentFocus}
          onChange={(value) => updateSetting('contentFocus', value)}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="custom-music" className="text-sm font-medium">
              Use Custom Music
            </Label>
            <Switch
              id="custom-music"
              checked={settings.useCustomMusic}
              onCheckedChange={(checked) => updateSetting('useCustomMusic', checked)}
            />
          </div>
          
          {settings.useCustomMusic && (
            <CustomMusicUpload
              onMusicUploaded={(url) => console.log('Music uploaded:', url)}
            />
          )}
        </div>

        <MustIncludeToggle
          isEnabled={settings.includeMustInclude}
          onToggle={(enabled) => updateSetting('includeMustInclude', enabled)}
          count={mustIncludeCount}
        />
      </CardContent>
    </Card>
  );
};

export default AISettingsPanel;
