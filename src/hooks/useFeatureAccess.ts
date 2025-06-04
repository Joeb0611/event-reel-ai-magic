
import { useSubscription } from '@/contexts/SubscriptionContext';

export interface FeatureAccess {
  hasAccess: boolean;
  tier: string;
  upgradeMessage: string;
  requiredTier: 'premium' | 'professional';
}

export const useFeatureAccess = (feature: string, projectId?: string): FeatureAccess => {
  const { hasFeatureAccess, getUpgradeMessage, getProjectTier } = useSubscription();
  
  const hasAccess = hasFeatureAccess(feature, projectId);
  const currentTier = projectId ? getProjectTier(projectId) : 'free';
  const upgradeMessage = getUpgradeMessage(feature);
  
  // Determine required tier based on feature
  const getRequiredTier = (feature: string): 'premium' | 'professional' => {
    const professionalFeatures = [
      'duration_5min', 
      '4k_quality', 
      'multiple_versions', 
      'custom_branding', 
      'priority_processing'
    ];
    return professionalFeatures.includes(feature) ? 'professional' : 'premium';
  };

  return {
    hasAccess,
    tier: currentTier,
    upgradeMessage,
    requiredTier: getRequiredTier(feature)
  };
};
