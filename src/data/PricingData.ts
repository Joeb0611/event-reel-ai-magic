
import { Crown, Star, Zap } from 'lucide-react';

export const pricingTiers = [
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
    ]
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
    ]
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
    ]
  }
];
