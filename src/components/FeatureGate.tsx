
import React from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';

interface FeatureGateProps {
  feature: string;
  projectId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showBadge?: boolean;
  disabled?: boolean;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  projectId,
  children,
  fallback,
  showBadge = true,
  disabled = false
}) => {
  const { hasAccess, requiredTier } = useFeatureAccess(feature, projectId);

  if (hasAccess && !disabled) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state with badge
  const Icon = requiredTier === 'professional' ? Zap : Crown;
  const tierName = requiredTier === 'professional' ? 'Professional' : 'Premium';

  return (
    <div className="relative opacity-60">
      {React.cloneElement(children as React.ReactElement, {
        disabled: true,
        className: `${(children as React.ReactElement).props.className} cursor-not-allowed`
      })}
      {showBadge && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge variant="secondary" className="text-xs bg-gray-800 text-white">
            <Lock className="w-3 h-3 mr-1" />
            {tierName}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default FeatureGate;
