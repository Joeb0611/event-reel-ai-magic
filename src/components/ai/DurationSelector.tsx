
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Crown } from 'lucide-react';
import { WeddingAISettings } from './AISettingsPanel';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface DurationSelectorProps {
  value: WeddingAISettings['duration'];
  onChange: (value: WeddingAISettings['duration']) => void;
  projectId?: string;
}

const durationOptions = [
  { 
    value: '30s' as const, 
    label: '30 seconds', 
    isPremium: false,
    description: 'Perfect for social media sharing and quick highlights'
  },
  { 
    value: '1min' as const, 
    label: '1 minute', 
    isPremium: true,
    description: 'Ideal balance of key moments and storytelling'
  },
  { 
    value: '2min' as const, 
    label: '2 minutes', 
    isPremium: true,
    description: 'Comprehensive highlights with more detail and emotion'
  },
  { 
    value: '3min' as const, 
    label: '3 minutes', 
    isPremium: true,
    description: 'Extended storytelling with ceremony and reception focus'
  },
  { 
    value: '5min' as const, 
    label: '5 minutes', 
    isPremium: true,
    description: 'Complete wedding story from start to finish'
  }
];

const DurationSelector = ({ value, onChange, projectId }: DurationSelectorProps) => {
  const { hasFeatureAccess } = useSubscription();
  const selectedOption = durationOptions.find(option => option.value === value);

  const handleChange = (newValue: string) => {
    const option = durationOptions.find(opt => opt.value === newValue);
    if (option?.isPremium && !hasFeatureAccess('duration_1min', projectId)) {
      alert('Please upgrade to Premium to access longer durations');
      return;
    }
    if (newValue === '5min' && !hasFeatureAccess('duration_5min', projectId)) {
      alert('Please upgrade to Professional to access 5-minute videos');
      return;
    }
    onChange(newValue as WeddingAISettings['duration']);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          Duration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {durationOptions.map((option) => {
              const hasAccess = !option.isPremium || 
                (option.value !== '5min' && hasFeatureAccess('duration_1min', projectId)) ||
                (option.value === '5min' && hasFeatureAccess('duration_5min', projectId));

              return (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={!hasAccess}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.label}</span>
                    {option.isPremium && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="w-2 h-2 mr-1" />
                        {option.value === '5min' ? 'Professional' : 'Premium'}
                      </Badge>
                    )}
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

export default DurationSelector;
