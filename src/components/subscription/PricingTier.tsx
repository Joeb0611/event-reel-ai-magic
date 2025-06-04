import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface PricingTierProps {
  id: string;
  name: string;
  price: string;
  priceAmount: number;
  description: string;
  icon: LucideIcon;
  popular?: boolean;
  features: string[];
  limitations?: string[];
  isCurrentPlan: boolean;
  isLoading: string | null;
  onUpgrade: (tierId: string) => void;
}

const PricingTier: React.FC<PricingTierProps> = ({
  id,
  name,
  price,
  description,
  icon: Icon,
  popular = false,
  features,
  limitations,
  isCurrentPlan,
  isLoading,
  onUpgrade
}) => {
  // Determine button text based on current plan status
  const getButtonText = () => {
    if (isCurrentPlan) {
      return 'Current Plan';
    }
    if (id === 'free') {
      return 'Free Plan';
    }
    return `Upgrade to ${name}`;
  };

  // Determine button variant
  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline';
    if (popular) return 'default';
    return 'secondary';
  };

  return (
    <Card
      className={`relative ${
        popular
          ? 'border-2 border-purple-500 shadow-xl scale-105'
          : isCurrentPlan
          ? 'border-2 border-green-500 shadow-lg'
          : 'border border-gray-200'
      } bg-white`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-500 text-white px-4 py-1 text-sm font-medium">
            Most Popular
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-500 text-white px-3 py-1 text-xs font-medium">
            Active
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${
            popular ? 'bg-purple-100' : isCurrentPlan ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              popular ? 'text-purple-600' : isCurrentPlan ? 'text-green-600' : 'text-gray-600'
            }`} />
          </div>
        </div>
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <div className="text-3xl font-bold text-purple-600 mt-2">
          {price}
          {price !== 'Free' && (
            <span className="text-sm font-normal text-gray-500">
              /wedding
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mt-2">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {limitations && limitations.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-2">Limitations:</p>
            <ul className="space-y-1">
              {limitations.map((limitation, index) => (
                <li key={index} className="text-xs text-gray-500">
                  • {limitation}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={() => onUpgrade(id)}
          disabled={isLoading === id || (isCurrentPlan && id === 'free')}
          variant={getButtonVariant()}
          className={`w-full mt-6 ${
            popular
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : isCurrentPlan
              ? 'bg-green-600 text-white cursor-default'
              : ''
          }`}
        >
          {isLoading === id ? 'Processing...' : getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingTier;
