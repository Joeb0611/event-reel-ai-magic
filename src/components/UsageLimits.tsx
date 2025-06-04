
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, AlertTriangle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UsageLimitsProps {
  currentProjects: number;
  maxProjects: number;
  currentUploads: number;
  maxUploads: number;
  plan: 'free' | 'premium' | 'professional';
}

const UsageLimits = ({ 
  currentProjects, 
  maxProjects, 
  currentUploads, 
  maxUploads, 
  plan 
}: UsageLimitsProps) => {
  const navigate = useNavigate();
  
  const projectsPercentage = (currentProjects / maxProjects) * 100;
  const uploadsPercentage = (currentUploads / maxUploads) * 100;
  
  const isNearLimit = projectsPercentage >= 80 || uploadsPercentage >= 80;
  const isAtLimit = projectsPercentage >= 100 || uploadsPercentage >= 100;

  if (plan !== 'free') {
    return null; // Don't show usage limits for paid plans
  }

  return (
    <Card className={`border-l-4 ${
      isAtLimit ? 'border-l-red-500 bg-red-50' : 
      isNearLimit ? 'border-l-yellow-500 bg-yellow-50' : 
      'border-l-blue-500 bg-blue-50'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {isAtLimit ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <TrendingUp className="w-5 h-5 text-blue-600" />
            )}
            Usage Limits
          </div>
          <Badge variant="outline" className="text-xs">
            Memory Starter (Free)
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Projects Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Wedding Projects</span>
            <span className={`font-medium ${
              projectsPercentage >= 100 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {currentProjects} / {maxProjects}
            </span>
          </div>
          <Progress 
            value={projectsPercentage} 
            className={`h-2 ${
              projectsPercentage >= 100 ? '[&>div]:bg-red-500' : 
              projectsPercentage >= 80 ? '[&>div]:bg-yellow-500' : 
              '[&>div]:bg-blue-500'
            }`}
          />
        </div>

        {/* Uploads Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Guest Uploads</span>
            <span className={`font-medium ${
              uploadsPercentage >= 100 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {currentUploads} / {maxUploads}
            </span>
          </div>
          <Progress 
            value={uploadsPercentage} 
            className={`h-2 ${
              uploadsPercentage >= 100 ? '[&>div]:bg-red-500' : 
              uploadsPercentage >= 80 ? '[&>div]:bg-yellow-500' : 
              '[&>div]:bg-blue-500'
            }`}
          />
        </div>

        {/* Upgrade Prompt */}
        {(isNearLimit || isAtLimit) && (
          <div className={`p-3 rounded-lg border ${
            isAtLimit ? 'bg-red-100 border-red-200' : 'bg-yellow-100 border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              <Crown className={`w-5 h-5 mt-0.5 ${
                isAtLimit ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <div className="flex-1">
                <h4 className={`font-medium text-sm ${
                  isAtLimit ? 'text-red-900' : 'text-yellow-900'
                }`}>
                  {isAtLimit ? 'Limit Reached!' : 'Almost at your limit'}
                </h4>
                <p className={`text-xs mt-1 ${
                  isAtLimit ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {isAtLimit 
                    ? 'Upgrade to Premium ($99) for unlimited projects and uploads'
                    : 'Consider upgrading to avoid hitting your limits'
                  }
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/subscription')}
                  className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageLimits;
