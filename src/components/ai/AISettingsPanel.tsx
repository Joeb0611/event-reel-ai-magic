
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Heart, Camera, FileText, Zap, Clock, Users, Music, Star } from 'lucide-react';

export interface WeddingAISettings {
  videoStyle: 'romantic' | 'cinematic' | 'documentary' | 'energetic';
  duration: '30s' | '1min' | '2min' | '3min' | '5min';
  contentFocus: 'ceremony' | 'reception' | 'balanced' | 'emotional' | 'candid';
  musicStyle: 'romantic' | 'upbeat' | 'classical' | 'acoustic' | 'modern' | 'cinematic';
  includeMustInclude: boolean;
}

interface AISettingsPanelProps {
  settings: WeddingAISettings;
  onSettingsChange: (settings: WeddingAISettings) => void;
  mustIncludeCount?: number;
}

const videoStyleOptions = [
  {
    value: 'romantic' as const,
    label: 'Romantic',
    description: 'Soft, dreamy with warm tones',
    icon: Heart,
    gradient: 'from-pink-100 to-rose-100'
  },
  {
    value: 'cinematic' as const,
    label: 'Cinematic',
    description: 'Movie-like with dramatic transitions',
    icon: Camera,
    gradient: 'from-purple-100 to-indigo-100'
  },
  {
    value: 'documentary' as const,
    label: 'Documentary',
    description: 'Natural, authentic storytelling',
    icon: FileText,
    gradient: 'from-blue-100 to-cyan-100'
  },
  {
    value: 'energetic' as const,
    label: 'Energetic',
    description: 'Fast-paced, upbeat with dynamic cuts',
    icon: Zap,
    gradient: 'from-orange-100 to-yellow-100'
  }
];

const durationOptions = [
  { value: '30s' as const, label: '30 seconds' },
  { value: '1min' as const, label: '1 minute' },
  { value: '2min' as const, label: '2 minutes' },
  { value: '3min' as const, label: '3 minutes' },
  { value: '5min' as const, label: '5 minutes' }
];

const contentFocusOptions = [
  { value: 'ceremony' as const, label: 'Ceremony Focus', description: 'Highlights vows, rings, and sacred moments' },
  { value: 'reception' as const, label: 'Reception Focus', description: 'Dancing, speeches, and celebration' },
  { value: 'balanced' as const, label: 'Balanced', description: 'Equal mix of ceremony and reception' },
  { value: 'emotional' as const, label: 'Emotional Moments', description: 'Tears, laughter, and heartfelt reactions' },
  { value: 'candid' as const, label: 'Candid Shots', description: 'Natural, unposed moments' }
];

const musicStyleOptions = [
  { value: 'romantic' as const, label: 'Romantic' },
  { value: 'upbeat' as const, label: 'Upbeat' },
  { value: 'classical' as const, label: 'Classical' },
  { value: 'acoustic' as const, label: 'Acoustic' },
  { value: 'modern' as const, label: 'Modern' },
  { value: 'cinematic' as const, label: 'Cinematic' }
];

// Function to calculate processing time estimate based on duration
const getProcessingEstimate = (duration: WeddingAISettings['duration']) => {
  const estimates = {
    '30s': 'Approximately 2-3 minutes',
    '1min': 'Approximately 3-5 minutes', 
    '2min': 'Approximately 5-8 minutes',
    '3min': 'Approximately 8-12 minutes',
    '5min': 'Approximately 12-18 minutes'
  };
  return estimates[duration];
};

const AISettingsPanel = ({ settings, onSettingsChange, mustIncludeCount = 0 }: AISettingsPanelProps) => {
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
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Video Style</CardTitle>
          <p className="text-sm text-gray-600">Choose the overall aesthetic and mood</p>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.videoStyle}
            onValueChange={(value) => updateSetting('videoStyle', value as WeddingAISettings['videoStyle'])}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {videoStyleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all bg-gradient-to-br ${option.gradient} 
                      peer-checked:border-purple-500 peer-checked:shadow-lg hover:shadow-md`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <span className="text-sm text-gray-600">{option.description}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Duration */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Duration
          </CardTitle>
          <p className="text-sm text-gray-600">Select your preferred video length</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={settings.duration}
            onValueChange={(value) => updateSetting('duration', value as WeddingAISettings['duration'])}
            className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3"
          >
            {durationOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={`duration-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`duration-${option.value}`}
                  className="flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all 
                    peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50"
                >
                  <span className="font-medium">{option.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {/* Interactive Processing Time Estimate */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Processing Time Estimate</span>
            </div>
            <p className="text-blue-700 text-sm">
              {getProcessingEstimate(settings.duration)}
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Actual processing time may vary based on video quantity and complexity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content Focus */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Content Focus
          </CardTitle>
          <p className="text-sm text-gray-600">What should the AI prioritize in your video?</p>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.contentFocus}
            onValueChange={(value) => updateSetting('contentFocus', value as WeddingAISettings['contentFocus'])}
            className="space-y-3"
          >
            {contentFocusOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={`focus-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`focus-${option.value}`}
                  className="flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all 
                    peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50"
                >
                  <div className="mt-1">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 peer-checked:border-purple-500 peer-checked:bg-purple-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Music Style */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="w-5 h-5" />
              Music Style
            </CardTitle>
            <p className="text-sm text-gray-600">Background music genre</p>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.musicStyle}
              onValueChange={(value) => updateSetting('musicStyle', value as WeddingAISettings['musicStyle'])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {musicStyleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Must Include Content */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Must-Include Content</CardTitle>
            <p className="text-sm text-gray-600">Include all tagged must-have moments</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={settings.includeMustInclude}
                  onCheckedChange={(checked) => updateSetting('includeMustInclude', checked)}
                />
                <Label className="font-medium">
                  Include must-include content
                </Label>
              </div>
              {mustIncludeCount > 0 && (
                <Badge variant="secondary">
                  {mustIncludeCount} item{mustIncludeCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            {settings.includeMustInclude && mustIncludeCount === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                No must-include items selected. Tag videos in the Media Gallery.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AISettingsPanel;
