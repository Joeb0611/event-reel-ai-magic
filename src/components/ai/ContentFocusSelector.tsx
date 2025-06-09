
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { EventAISettings } from './AISettingsPanel';

interface ContentFocusSelectorProps {
  value: EventAISettings['contentFocus'];
  onChange: (value: EventAISettings['contentFocus']) => void;
}

const contentFocusOptions = [
  { 
    value: 'ceremony' as const, 
    label: 'Ceremony Focus',
    description: 'Emphasizes vows, rings, and sacred moments of the ceremony'
  },
  { 
    value: 'reception' as const, 
    label: 'Reception Focus',
    description: 'Highlights dancing, speeches, and celebration moments'
  },
  { 
    value: 'balanced' as const, 
    label: 'Balanced',
    description: 'Equal mix of ceremony and reception highlights'
  },
  { 
    value: 'emotional' as const, 
    label: 'Emotional Moments',
    description: 'Focuses on tears of joy, hugs, and heartfelt reactions'
  },
  { 
    value: 'candid' as const, 
    label: 'Candid Shots',
    description: 'Natural, unposed moments and behind-the-scenes interactions'
  }
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
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {contentFocusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="font-medium">{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedOption && (
          <p className="text-sm text-gray-600">{selectedOption.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentFocusSelector;
