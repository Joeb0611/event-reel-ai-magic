
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Crown, Star, Zap } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  popular?: boolean;
  features: string[];
  limitations?: string[];
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Memory Starter',
    price: 'Free',
    description: 'Perfect for trying out MemoryWeave',
    icon: Star,
    features: [
      '1 wedding project only',
      'Up to 25 guest uploads',
      'Basic photo/video collection with QR codes',
      '1-minute AI highlight reel',
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
    buttonVariant: 'outline'
  },
  {
    id: 'premium',
    name: 'Memory Maker',
    price: '$99',
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
      'No watermark',
      'Email support'
    ],
    buttonText: 'Upgrade to Premium',
    buttonVariant: 'default'
  },
  {
    id: 'professional',
    name: 'Memory Master',
    price: '$199',
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
      'Priority processing',
      'Phone support'
    ],
    buttonText: 'Upgrade to Professional',
    buttonVariant: 'secondary'
  }
];

const Subscription = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (tierId: string) => {
    if (tierId === 'free') return;
    
    setLoading(tierId);
    // TODO: Implement Stripe checkout
    console.log(`Upgrading to ${tierId}`);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-gray-600 mt-2">
              Select the perfect plan for your wedding memories
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.id}
                className={`relative ${
                  tier.popular
                    ? 'border-2 border-purple-500 shadow-xl scale-105'
                    : 'border border-gray-200'
                } bg-white`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-4 py-1 text-sm font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      tier.popular ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        tier.popular ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold text-purple-600 mt-2">
                    {tier.price}
                    {tier.price !== 'Free' && (
                      <span className="text-sm font-normal text-gray-500">
                        /wedding
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{tier.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.limitations && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                      <ul className="space-y-1">
                        {tier.limitations.map((limitation, index) => (
                          <li key={index} className="text-xs text-gray-500">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={loading === tier.id || tier.id === 'free'}
                    variant={tier.buttonVariant}
                    className={`w-full mt-6 ${
                      tier.popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : ''
                    }`}
                  >
                    {loading === tier.id ? 'Processing...' : tier.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How does per-wedding pricing work?</h3>
                <p className="text-gray-600 text-sm">
                  You pay once per wedding project. Each wedding gets its own separate pricing, 
                  so you can create multiple wedding projects and pay for each one individually.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
                <p className="text-gray-600 text-sm">
                  You can upgrade to a higher tier for any specific wedding project. 
                  Each project is priced independently, so you have full flexibility.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What happens to my videos after payment?</h3>
                <p className="text-gray-600 text-sm">
                  Once you upgrade and pay for a wedding project, you get lifetime access to 
                  download and share your videos. Premium and Professional tiers include full download rights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
