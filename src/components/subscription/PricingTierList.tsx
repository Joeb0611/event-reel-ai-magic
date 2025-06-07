
import React from 'react';
import PricingTier from './PricingTier';
import { PricingTier as PricingTierType } from '@/data/PricingData';

interface PricingTierListProps {
  tiers: PricingTierType[];
  currentPlan: string;
  loading: string | null;
  onUpgrade: (tierId: string) => void;
}

const PricingTierList: React.FC<PricingTierListProps> = ({ 
  tiers, 
  currentPlan, 
  loading, 
  onUpgrade 
}) => {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {tiers.map((tier) => (
        <PricingTier
          key={tier.id}
          {...tier}
          isCurrentPlan={tier.id === currentPlan}
          isLoading={loading}
          onUpgrade={onUpgrade}
        />
      ))}
    </div>
  );
};

export default PricingTierList;
