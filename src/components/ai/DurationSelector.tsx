
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Crown } from 'lucide-react';
import { WeddingAISettings } from './AISettingsPanel';

interface DurationSelectorProps {
  value: WeddingAISettings['duration'];
  onChange: (value: WeddingAISettings['duration']) => void;
  isPremium?: boolean;
}

const durationOptions = [
  { value: '30s' as const, label: '30 seconds', isPremium: false },
  { value: '1min' as const, label: '1 minute', isPremium: true },
  { value: '2min' as const, label: '2 minutes', isPremium: true },
  { value: '3min' as const, label: '3 minutes', isPremium: true },
  { value: '5min' as const, label: '5 minutes', isPremium: true }
];

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

const DurationSelector = ({ value, onChange, isPremium = false }: DurationSelectorProps) => {
  const handleChange = (newValue: string) => {
    const option = durationOptions.find(opt => opt.value === newValue);
    if (option?.isPremium && !isPremium) {
      alert('Please upgrade to Premium to access longer durations');
      return;
    }
    onChange(newValue as WeddingAISettings['duration']);
  };

  return (
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
          value={value}
          onValueChange={handleChange}
          className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3"
        >
          {durationOptions.map((option) => (
            <div key={option.value} className="relative">
              <RadioGroupItem
                value={option.value}
                id={`duration-${option.value}`}
                className="peer sr-only"
                disabled={option.isPremium && !isPremium}
              />
              <Label
                htmlFor={`duration-${option.value}`}
                className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all 
                  peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50
                  ${option.isPremium && !isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{option.label}</span>
                  {option.isPremium && (
                    <Badge variant="secondary" className="text-xs">
                      <Crown className="w-2 h-2 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Processing Time Estimate</span>
          </div>
          <p className="text-blue-700 text-sm">
            {getProcessingEstimate(value)}
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Actual processing time may vary based on video quantity and complexity
          </p>
        </div>

        {!isPremium && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-700">
              Upgrade to Premium to access longer video durations (1-5 minutes)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DurationSelector;
