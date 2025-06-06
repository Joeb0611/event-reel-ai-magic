
import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { pricingTiers } from '@/data/PricingData';

export const useSubscriptionLogic = (projectId: string | null) => {
  const { subscription } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpgrade = async (tierId: string) => {
    if (tierId === 'free') return;
    
    const tier = pricingTiers.find(t => t.id === tierId);
    if (!tier) return;

    setLoading(tierId);
    
    try {
      console.log('=== STARTING UPGRADE PROCESS ===');
      console.log('Tier:', tierId);
      console.log('Project ID:', projectId);
      console.log('Amount:', tier.priceAmount);

      // Get the current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication required. Please sign in again.');
      }

      if (!session) {
        console.error('No active session found');
        throw new Error('Please sign in to upgrade your plan.');
      }

      console.log('User authenticated, proceeding with payment...');
      
      // Create a Stripe checkout session for per-wedding purchase
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          tier: tierId,
          amount: tier.priceAmount,
          product_name: tier.name,
          mode: 'payment', // One-time payment for per-wedding pricing
          project_id: projectId // Pass the project ID if available
        }
      });

      if (error) {
        console.error('=== PAYMENT SESSION ERROR ===');
        console.error('Error details:', error);
        toast({
          title: "Payment Error",
          description: error.message || "Unable to start payment process. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('=== PAYMENT SESSION SUCCESS ===');
      console.log('Response data:', data);

      if (data?.url) {
        console.log('Opening Stripe checkout in new tab:', data.url);
        // Open Stripe checkout in a new tab instead of redirecting
        window.open(data.url, '_blank');
        
        // Show success message
        toast({
          title: "Redirecting to Payment",
          description: "Opening Stripe checkout in a new tab. Please complete your payment there.",
          duration: 5000
        });
      } else {
        console.error('No checkout URL in response:', data);
        throw new Error('No checkout URL received from payment service');
      }
    } catch (error) {
      console.error('=== UPGRADE ERROR ===');
      console.error('Error details:', error);
      toast({
        title: "Upgrade Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const getCurrentPlanId = () => {
    if (!subscription) return 'free';
    return subscription.tier || 'free';
  };

  return {
    subscription,
    loading,
    handleUpgrade,
    getCurrentPlanId
  };
};
