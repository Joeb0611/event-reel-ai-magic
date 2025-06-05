
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { WeddingAISettings } from './AISettingsPanel';

interface ContentFocusSelectorProps {
  value: WeddingAISettings['contentFocus'];
  onChange: (value: WeddingAISettings['contentFocus']) => void;
}

const contentFocusOptions = [
  { value: 'ceremony' as const, label: 'Ceremony Focus' },
  { value: 'reception' as const, label: 'Reception Focus' },
  { value: 'balanced' as const, label: 'Balanced' },
  { value: 'emotional' as const, label: 'Emotional Moments' },
  { value: 'candid' as const, label: 'Candid Shots' }
];

const ContentFocusSelector = ({ value, onChange }: ContentFocusSelectorProps) => {
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
                <span className="font-medium">{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default ContentFocusSelector;
