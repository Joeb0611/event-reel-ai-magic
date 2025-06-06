
import { pricingTiers } from '@/data/PricingData';
import { faqs } from '@/data/FAQData';
import { useSubscriptionLogic } from '@/hooks/useSubscriptionLogic';
import { useSearchParams } from 'react-router-dom';

// Import existing components
import SubscriptionHeader from '@/components/subscription/SubscriptionHeader';
import PricingTierList from '@/components/subscription/PricingTierList';
import FAQSection from '@/components/subscription/FAQSection';

const Subscription = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const {
    subscription,
    loading,
    handleUpgrade,
    getCurrentPlanId
  } = useSubscriptionLogic(projectId);

  // Show loading screen only if still loading and no subscription data
  if (!subscription && loading) {
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
          tiers={pricingTiers}
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
