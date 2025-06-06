
import { Heart, Crown, Building2 } from 'lucide-react';

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  priceAmount: number;
  description: string;
  icon: typeof Heart;
  features: string[];
  limitations?: string[];
  highlighted?: boolean;
  popular?: boolean;
  storageRetention: string;
  downloadRights: string;
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Free',
    priceAmount: 0,
    description: 'Perfect for trying out our AI wedding video editing',
    icon: Heart,
    features: [
      '1 wedding project',
      '30-day storage retention',
      'Basic AI editing (2-3 minutes)',
      'Standard quality (1080p)',
      'Email delivery',
      'Download expires after 7 days'
    ],
    limitations: [
      'Limited to 1 project',
      'Videos deleted after 30 days',
      'No raw footage retention',
      'Basic support only'
    ],
    storageRetention: '30 days',
    downloadRights: '7-day download window'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$99',
    priceAmount: 9900, // in cents
    description: 'Best for couples who want professional-quality highlights',
    icon: Crown,
    features: [
      'Unlimited wedding projects',
      '1-year storage retention',
      'Extended AI editing (up to 5 minutes)',
      'High quality (1080p)',
      'Priority processing',
      'Custom music upload',
      'Multiple download formats',
      'Unlimited downloads for 1 year',
      'Email support'
    ],
    highlighted: true,
    popular: true,
    storageRetention: '1 year',
    downloadRights: 'Unlimited downloads for 1 year'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$199',
    priceAmount: 19900, // in cents
    description: 'For photographers and videographers serving multiple clients',
    icon: Building2,
    features: [
      'Unlimited projects',
      '2-year storage retention',
      'Professional AI editing (up to 10 minutes)',
      '4K quality available',
      'Priority processing queue',
      'Custom branding options',
      'Raw footage retention',
      'Bulk project management',
      'Client delivery portal',
      'Unlimited downloads for 2 years',
      'Phone & email support',
      'Advanced analytics'
    ],
    storageRetention: '2 years + raw footage',
    downloadRights: 'Unlimited downloads for 2 years'
  }
];

export const features = [
  {
    title: 'AI-Powered Editing',
    description: 'Our AI automatically identifies the best moments from your wedding footage'
  },
  {
    title: 'Smart Storage Management',
    description: 'Clear retention policies with multiple download opportunities before expiration'
  },
  {
    title: 'Professional Quality',
    description: 'High-quality output suitable for sharing and preservation'
  },
  {
    title: 'Easy Sharing',
    description: 'Share your highlight reel with family and friends instantly'
  }
];
