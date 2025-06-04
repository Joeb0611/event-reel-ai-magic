
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type SubscriptionTier = 'free' | 'premium' | 'professional';
export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'cancelled';

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  expires_at?: string;
  projects_used: number;
  projects_limit: number;
  created_at: string;
  updated_at: string;
}

export interface WeddingPurchase {
  id: string;
  user_id: string;
  project_id: string;
  tier: 'premium' | 'professional';
  stripe_payment_intent_id?: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  purchases: WeddingPurchase[];
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  getProjectTier: (projectId: string) => SubscriptionTier;
  hasFeatureAccess: (feature: string, projectId?: string) => boolean;
  canCreateProject: () => boolean;
  getUpgradeMessage: (feature: string) => string;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [purchases, setPurchases] = useState<WeddingPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setPurchases([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
        toast({
          title: "Error loading subscription",
          description: "Please try refreshing the page.",
          variant: "destructive"
        });
      } else if (subData) {
        // Type cast with validation
        const validatedSubscription: UserSubscription = {
          ...subData,
          tier: (subData.tier as SubscriptionTier) || 'free',
          status: (subData.status as SubscriptionStatus) || 'active'
        };
        setSubscription(validatedSubscription);
      }

      // Fetch wedding purchases
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('per_wedding_purchases')
        .select('*')
        .eq('user_id', user.id);

      if (purchaseError) {
        console.error('Error fetching purchases:', purchaseError);
      } else if (purchaseData) {
        // Type cast with validation
        const validatedPurchases: WeddingPurchase[] = purchaseData.map(purchase => ({
          ...purchase,
          tier: (purchase.tier === 'premium' || purchase.tier === 'professional') ? purchase.tier : 'premium',
          status: (['pending', 'paid', 'failed', 'refunded'].includes(purchase.status)) ? purchase.status as 'pending' | 'paid' | 'failed' | 'refunded' : 'pending'
        }));
        setPurchases(validatedPurchases);
      }
    } catch (error) {
      console.error('Error in refreshSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectTier = (projectId: string): SubscriptionTier => {
    // Check if there's a paid purchase for this project
    const purchase = purchases.find(p => p.project_id === projectId && p.status === 'paid');
    if (purchase) {
      return purchase.tier;
    }
    // Fall back to user's subscription tier
    return subscription?.tier || 'free';
  };

  const hasFeatureAccess = (feature: string, projectId?: string): boolean => {
    const currentTier = projectId ? getProjectTier(projectId) : subscription?.tier || 'free';
    
    // Feature mapping
    const featureRequirements: Record<string, SubscriptionTier[]> = {
      'duration_1min': ['premium', 'professional'],
      'duration_2min': ['premium', 'professional'],
      'duration_3min': ['premium', 'professional'],
      'duration_5min': ['professional'],
      'hd_quality': ['premium', 'professional'],
      '4k_quality': ['professional'],
      'custom_music': ['premium', 'professional'],
      'all_styles': ['premium', 'professional'],
      'download_rights': ['premium', 'professional'],
      'no_watermark': ['premium', 'professional'],
      'multiple_versions': ['professional'],
      'custom_branding': ['professional'],
      'priority_processing': ['professional'],
      'unlimited_projects': ['premium', 'professional']
    };

    const requiredTiers = featureRequirements[feature];
    if (!requiredTiers) return true; // Feature doesn't require premium access
    
    return requiredTiers.includes(currentTier);
  };

  const canCreateProject = (): boolean => {
    if (!subscription) return false;
    if (subscription.tier !== 'free') return true;
    return subscription.projects_used < subscription.projects_limit;
  };

  const getUpgradeMessage = (feature: string): string => {
    const messages: Record<string, string> = {
      'duration_1min': 'Upgrade to Premium for videos up to 3 minutes',
      'duration_2min': 'Upgrade to Premium for videos up to 3 minutes',
      'duration_3min': 'Upgrade to Premium for videos up to 3 minutes',
      'duration_5min': 'Upgrade to Professional for videos up to 5 minutes',
      'hd_quality': 'Upgrade to Premium for HD video quality',
      '4k_quality': 'Upgrade to Professional for 4K video quality',
      'custom_music': 'Upgrade to Premium to upload custom music',
      'all_styles': 'Upgrade to Premium for all AI video styles',
      'download_rights': 'Upgrade to Premium to download your videos',
      'no_watermark': 'Upgrade to Premium to remove watermark',
      'multiple_versions': 'Upgrade to Professional for multiple video versions',
      'custom_branding': 'Upgrade to Professional for custom branding',
      'priority_processing': 'Upgrade to Professional for priority processing',
      'unlimited_projects': 'Upgrade to Premium for unlimited projects'
    };
    return messages[feature] || 'Upgrade to access this feature';
  };

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  const value: SubscriptionContextType = {
    subscription,
    purchases,
    loading,
    refreshSubscription,
    getProjectTier,
    hasFeatureAccess,
    canCreateProject,
    getUpgradeMessage
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
