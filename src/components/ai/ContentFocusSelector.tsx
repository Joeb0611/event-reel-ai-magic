
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
  return (
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
          value={value}
          onValueChange={onChange}
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
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ContentFocusSelector;
