
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
    description: 'Soft, dreamy with warm tones',
    icon: Heart
  },
  {
    value: 'cinematic' as const,
    label: 'Cinematic',
    description: 'Movie-like with dramatic transitions',
    icon: Camera
  },
  {
    value: 'documentary' as const,
    label: 'Documentary',
    description: 'Natural, authentic storytelling',
    icon: FileText
  },
  {
    value: 'energetic' as const,
    label: 'Energetic',
    description: 'Fast-paced, upbeat with dynamic cuts',
    icon: Zap
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
        <p className="text-sm text-gray-600">Choose the overall aesthetic and mood</p>
      </CardHeader>
      <CardContent>
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
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        {selectedOption && (
          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <selectedOption.icon className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-900">{selectedOption.label}</span>
            </div>
            <p className="text-sm text-purple-700">{selectedOption.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoStyleSelector;
