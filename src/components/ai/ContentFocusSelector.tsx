
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { WeddingAISettings } from './AISettingsPanel';

interface ContentFocusSelectorProps {
  value: WeddingAISettings['contentFocus'];
  onChange: (value: WeddingAISettings['contentFocus']) => void;
}

const contentFocusOptions = [
  { value: 'ceremony' as const, label: 'Ceremony Focus', description: 'Highlights vows, rings, and sacred moments' },
  { value: 'reception' as const, label: 'Reception Focus', description: 'Dancing, speeches, and celebration' },
  { value: 'balanced' as const, label: 'Balanced', description: 'Equal mix of ceremony and reception' },
  { value: 'emotional' as const, label: 'Emotional Moments', description: 'Tears, laughter, and heartfelt reactions' },
  { value: 'candid' as const, label: 'Candid Shots', description: 'Natural, unposed moments' }
];

const ContentFocusSelector = ({ value, onChange }: ContentFocusSelectorProps) => {
  const selectedOption = contentFocusOptions.find(option => option.value === value);

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Users className="w-4 h-4 md:w-5 md:h-5" />
          Content Focus
        </CardTitle>
        <p className="text-sm text-gray-600">What should the AI prioritize in your video?</p>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {contentFocusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedOption && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">{selectedOption.label}</span>
            </div>
            <p className="text-sm text-blue-700">{selectedOption.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentFocusSelector;
