
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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

const VideoStyleSelector = ({ value, onChange }: VideoStyleSelectorProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">Video Style</CardTitle>
        <p className="text-sm text-gray-600">Choose the overall aesthetic and mood</p>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value}
          onValueChange={onChange}
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
  );
};

export default VideoStyleSelector;
