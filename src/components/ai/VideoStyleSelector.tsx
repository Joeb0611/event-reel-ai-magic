
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Camera, FileText, Zap } from 'lucide-react';
import { WeddingAISettings } from './AISettingsPanel';

interface VideoStyleSelectorProps {
  value: WeddingAISettings['videoStyle'];
  onChange: (value: WeddingAISettings['videoStyle']) => void;
}

const videoStyleOptions = [
  {
    value: 'romantic' as const,
    label: 'Romantic',
    icon: Heart,
    description: 'Soft, warm tones with gentle transitions and emotional focus'
  },
  {
    value: 'cinematic' as const,
    label: 'Cinematic',
    icon: Camera,
    description: 'Professional film-like quality with dramatic angles and lighting'
  },
  {
    value: 'documentary' as const,
    label: 'Documentary',
    icon: FileText,
    description: 'Natural, authentic storytelling with candid moments'
  },
  {
    value: 'energetic' as const,
    label: 'Energetic',
    icon: Zap,
    description: 'Dynamic cuts, vibrant colors, and upbeat pacing'
  }
];

const VideoStyleSelector = ({ value, onChange }: VideoStyleSelectorProps) => {
  const selectedOption = videoStyleOptions.find(option => option.value === value);

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          {selectedOption && <selectedOption.icon className="w-4 h-4 md:w-5 md:h-5" />}
          Video Style
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {videoStyleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">{option.label}</span>
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

export default VideoStyleSelector;
