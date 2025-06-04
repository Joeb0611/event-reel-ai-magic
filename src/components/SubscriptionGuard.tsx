
import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from './UpgradeModal';

interface SubscriptionGuardProps {
  feature: string;
  projectId?: string;
  children: React.ReactNode;
  onBlock?: () => void;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  feature,
  projectId,
  children,
  onBlock
}) => {
  const { subscription } = useSubscription();
  const { hasAccess, requiredTier } = useFeatureAccess(feature, projectId);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!hasAccess) {
      e.preventDefault();
      e.stopPropagation();
      setShowUpgradeModal(true);
      onBlock?.();
      return false;
    }
  };

  return (
    <>
      <div onClick={handleClick}>
        {children}
      </div>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={feature}
        currentPlan={subscription?.tier || 'free'}
        requiredPlan={requiredTier}
      />
    </>
  );
};

export default SubscriptionGuard;
