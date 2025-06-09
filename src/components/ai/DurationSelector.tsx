
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Crown } from 'lucide-react';
import { EventAISettings } from './AISettingsPanel';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface DurationSelectorProps {
  value: EventAISettings['duration'];
  onChange: (value: EventAISettings['duration']) => void;
  projectId?: string;
  testPremiumMode?: boolean;
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

const DurationSelector = ({ value, onChange, projectId, testPremiumMode = false }: DurationSelectorProps) => {
  const { hasFeatureAccess } = useSubscription();
  const selectedOption = durationOptions.find(option => option.value === value);

  const getFeatureAccess = (feature: string) => {
    if (testPremiumMode) return true;
    return hasFeatureAccess(feature, projectId);
  };

  const handleChange = (newValue: string) => {
    const option = durationOptions.find(opt => opt.value === newValue);
    if (option?.isPremium && !getFeatureAccess('duration_1min')) {
      if (!testPremiumMode) {
        alert('Please upgrade to Premium to access longer durations');
        return;
      }
    }
    if (newValue === '5min' && !getFeatureAccess('duration_5min')) {
      if (!testPremiumMode) {
        alert('Please upgrade to Professional to access 5-minute videos');
        return;
      }
    }
    onChange(newValue as EventAISettings['duration']);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          Duration
          {testPremiumMode && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              Test Mode
            </span>
          )}
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
                (option.value !== '5min' && getFeatureAccess('duration_1min')) ||
                (option.value === '5min' && getFeatureAccess('duration_5min'));

              return (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={!hasAccess}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.label}</span>
                    {option.isPremium && !testPremiumMode && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="w-2 h-2 mr-1" />
                        {option.value === '5min' ? 'Professional' : 'Premium'}
                      </Badge>
                    )}
                    {option.isPremium && testPremiumMode && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        ✓ Unlocked
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
