
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentPlan: 'free' | 'premium' | 'professional';
  requiredPlan: 'premium' | 'professional';
}

const UpgradeModal = ({ isOpen, onClose, feature, currentPlan, requiredPlan }: UpgradeModalProps) => {
  const navigate = useNavigate();

  const planDetails = {
    premium: {
      name: 'Memory Maker',
      price: '$99',
      icon: Crown,
      color: 'purple',
      features: [
        'Unlimited wedding projects',
        'Up to 3-minute highlight reels',
        '1080p HD video quality',
        'All AI styles',
        'Custom music upload',
        'Download rights',
        'No watermark'
      ]
    },
    professional: {
      name: 'Memory Master',
      price: '$199',
      icon: Zap,
      color: 'blue',
      features: [
        'Everything in Premium plus:',
        'Up to 5-minute highlight reels',
        '4K video quality',
        'Multiple video versions',
        'Custom branding',
        'Priority processing',
        'Phone support'
      ]
    }
  };

  const plan = planDetails[requiredPlan];
  const Icon = plan.icon;

  const handleUpgrade = () => {
    navigate('/subscription');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full bg-${plan.color}-100`}>
              <Icon className={`w-6 h-6 text-${plan.color}-600`} />
            </div>
          </div>
          <DialogTitle className="text-xl">
            Upgrade to {plan.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            {feature} requires {plan.name} ({plan.price} per wedding)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-purple-600">{plan.price}</div>
              <div className="text-sm text-gray-600">per wedding project</div>
            </div>
            
            <ul className="space-y-2">
              {plan.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            {plan.features.length > 4 && (
              <div className="text-center mt-3">
                <span className="text-sm text-gray-500">
                  + {plan.features.length - 4} more features
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              className={`flex-1 bg-${plan.color}-600 hover:bg-${plan.color}-700`}
            >
              <Icon className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
