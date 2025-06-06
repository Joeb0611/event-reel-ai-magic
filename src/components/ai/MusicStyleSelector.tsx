import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';
import { WeddingAISettings } from './AISettingsPanel';

interface MusicStyleSelectorProps {
  value: WeddingAISettings['musicStyle'];
  onChange: (value: WeddingAISettings['musicStyle']) => void;
  disabled?: boolean;
}

const musicStyleOptions = [
  { value: 'romantic' as const, label: 'Romantic' },
  { value: 'upbeat' as const, label: 'Upbeat' },
  { value: 'classical' as const, label: 'Classical' },
  { value: 'acoustic' as const, label: 'Acoustic' },
  { value: 'modern' as const, label: 'Modern' },
  { value: 'cinematic' as const, label: 'Cinematic' }
];

const MusicStyleSelector = ({ value, onChange, disabled = false }: MusicStyleSelectorProps) => {
  return (
    <Card className={`border-gray-200 ${disabled ? 'opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Music className="w-5 h-5" />
          Music Style
        </CardTitle>
        <p className="text-sm text-gray-600">Background music genre</p>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
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
        {disabled && (
          <p className="text-xs text-gray-500 mt-2">
            Disabled while using custom music
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MusicStyleSelector;
