
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Crown, Star, Zap } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Import new components
import SubscriptionHeader from '@/components/subscription/SubscriptionHeader';
import PricingTierList from '@/components/subscription/PricingTierList';
import FAQSection from '@/components/subscription/FAQSection';

const Subscription = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { subscription, loading: subscriptionLoading, refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Refresh subscription data when component mounts
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  const pricingTiers = [
    {
      id: 'free',
      name: 'Memory Starter',
      price: 'Free',
      priceAmount: 0,
      description: 'Perfect for trying out MemoryWeave',
      icon: Star,
      features: [
        '1 wedding project only',
        'Up to 25 guest uploads',
        'Basic photo/video collection with QR codes',
        '30-second AI highlight reel',
        '720p video quality',
        'Romantic style only',
        'Stream only (no download)'
      ],
      limitations: [
        'MemoryWeave watermark included',
        'Limited AI styles',
        'No download rights'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline' as const
    },
    {
      id: 'premium',
      name: 'Memory Maker',
      price: '$99',
      priceAmount: 9900, // $99 in cents
      description: 'Most popular choice for wedding couples',
      icon: Crown,
      popular: true,
      features: [
        'Unlimited wedding projects',
        'Unlimited guest uploads',
        'All AI styles (romantic, cinematic, documentary, energetic)',
        'Up to 3-minute highlight reels',
        '1080p HD video quality',
        'Download + sharing rights',
        'Custom music upload',
        'Advanced AI moment detection',
        'Must-include content tagging',
        'Guest analytics',
        'No watermark'
      ],
      buttonText: 'Upgrade to Premium',
      buttonVariant: 'default' as const
    },
    {
      id: 'professional',
      name: 'Memory Master',
      price: '$199',
      priceAmount: 19900, // $199 in cents
      description: 'Professional-grade features for perfect memories',
      icon: Zap,
      features: [
        'Everything in Premium plus:',
        'Up to 5-minute highlight reels',
        '4K video quality',
        'Multiple video versions (30s, 2min, 5min)',
        'Advanced AI personality settings',
        'Custom branding',
        'Guest recognition features',
        'Raw footage download',
        'Priority processing'
      ],
      buttonText: 'Upgrade to Professional',
      buttonVariant: 'secondary' as const
    }
  ];

  const faqs = [
    {
      question: 'How does per-wedding pricing work?',
      answer: 'You pay once per wedding project. Each wedding gets its own separate pricing, so you can create multiple wedding projects and pay for each one individually.'
    },
    {
      question: 'Can I upgrade or downgrade anytime?',
      answer: 'You can upgrade to a higher tier for any specific wedding project. Each project is priced independently, so you have full flexibility.'
    },
    {
      question: 'What happens to my videos after payment?',
      answer: 'Once you upgrade and pay for a wedding project, you get lifetime access to download and share your videos. Premium and Professional tiers include full download rights.'
    }
  ];

  const handleUpgrade = async (tierId: string) => {
    if (tierId === 'free') return;
    
    const tier = pricingTiers.find(t => t.id === tierId);
    if (!tier) return;

    setLoading(tierId);
    
    try {
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
        console.error('Error creating payment session:', error);
        toast({
          title: "Payment Error",
          description: "Unable to start payment process. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error in handleUpgrade:', error);
      toast({
        title: "Upgrade Failed",
        description: "Something went wrong. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const getCurrentPlanId = () => {
    return subscription?.tier || 'free';
  };

  const updatePricingTiers = () => {
    const currentPlan = getCurrentPlanId();
    return pricingTiers.map(tier => ({
      ...tier,
      buttonText: tier.id === currentPlan ? 'Current Plan' : tier.buttonText,
      buttonVariant: tier.id === currentPlan ? 'outline' as const : tier.buttonVariant
    }));
  };

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <SubscriptionHeader 
          currentTier={subscription?.tier} 
          projectId={projectId} 
        />

        {/* Pricing Cards */}
        <PricingTierList
          tiers={updatePricingTiers()}
          currentPlan={getCurrentPlanId()}
          loading={loading}
          onUpgrade={handleUpgrade}
        />

        {/* FAQ Section */}
        <FAQSection faqs={faqs} />
      </div>
    </div>
  );
};

export default Subscription;
