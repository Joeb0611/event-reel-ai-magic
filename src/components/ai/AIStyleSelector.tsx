
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Film, Heart, Camera, Zap, Crown } from 'lucide-react';

interface AIStyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

const styles = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Dramatic shots with smooth transitions and cinematic color grading',
    icon: Film,
    preview: 'Deep, rich colors with dramatic lighting and slow-motion moments'
  },
  {
    id: 'romantic',
    name: 'Romantic',
    description: 'Soft, warm tones focusing on intimate moments and emotions',
    icon: Heart,
    preview: 'Warm golden tones, soft focus, and tender emotional highlights'
  },
  {
    id: 'documentary',
    name: 'Documentary',
    description: 'Natural, candid style capturing authentic moments as they happen',
    icon: Camera,
    preview: 'Authentic colors, natural lighting, real moments and reactions'
  },
  {
    id: 'energetic',
    name: 'Fun/Energetic',
    description: 'Vibrant colors with upbeat pacing and dynamic transitions',
    icon: Zap,
    preview: 'Bright, vibrant colors with quick cuts and energetic music'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless elegance with traditional wedding videography style',
    icon: Crown,
    preview: 'Elegant, timeless style with classic transitions and refined editing'
  }
];

const AIStyleSelector = ({ selectedStyle, onStyleChange }: AIStyleSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI Style Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {styles.map((style) => (
            <div
              key={style.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedStyle === style.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => onStyleChange(style.id)}
            >
              <div className="flex items-start gap-3">
                <style.icon className={`w-6 h-6 mt-1 ${
                  selectedStyle === style.id ? 'text-purple-600' : 'text-gray-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{style.name}</h4>
                    {selectedStyle === style.id && (
                      <Badge variant="default" className="text-xs">Selected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{style.description}</p>
                  <p className="text-xs text-gray-500 italic">{style.preview}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIStyleSelector;
