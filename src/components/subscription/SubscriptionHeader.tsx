
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionHeaderProps {
  currentTier?: string;
  projectId?: string | null;
}

const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({ currentTier, projectId }) => {
  const navigate = useNavigate();

  return (
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
          {projectId && <span className="ml-2 text-sm text-purple-600">(Project upgrade)</span>}
          {currentTier && (
            <span className="ml-2 text-sm text-purple-600 font-medium">
              (Current: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)})
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default SubscriptionHeader;
