
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProcessingProgressCardProps {
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTimeRemaining?: number;
  startedAt?: string;
}

const ProcessingProgressCard = ({ 
  projectId, 
  status, 
  progress, 
  estimatedTimeRemaining,
  startedAt 
}: ProcessingProgressCardProps) => {
  const navigate = useNavigate();

  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Brain,
          title: 'Processing Started',
          description: 'Your AI highlight reel is being prepared...',
          color: 'blue'
        };
      case 'processing':
        return {
          icon: Brain,
          title: 'AI Processing in Progress',
          description: 'Creating your perfect wedding highlight reel...',
          color: 'purple'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          title: 'Processing Complete!',
          description: 'Your wedding highlight reel is ready to view.',
          color: 'green'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          title: 'Processing Failed',
          description: 'There was an issue creating your highlight reel.',
          color: 'red'
        };
      default:
        return {
          icon: Brain,
          title: 'Processing',
          description: 'Working on your highlight reel...',
          color: 'blue'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s remaining`;
    }
    return `${remainingSeconds}s remaining`;
  };

  const getElapsedTime = () => {
    if (!startedAt) return null;
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')} elapsed`;
  };

  return (
    <Card className={`border-${statusInfo.color}-200 bg-${statusInfo.color}-50`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 text-${statusInfo.color}-600`} />
            {statusInfo.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/project/${projectId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{statusInfo.description}</p>
        
        {(status === 'processing' || status === 'pending') && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress: {progress}%</span>
              {estimatedTimeRemaining && (
                <span>{formatTimeRemaining(estimatedTimeRemaining)}</span>
              )}
            </div>
            <Progress value={progress} className="w-full" />
            {getElapsedTime() && (
              <p className="text-xs text-gray-500 text-center">{getElapsedTime()}</p>
            )}
          </div>
        )}

        {status === 'completed' && (
          <Button 
            onClick={() => navigate(`/project/${projectId}`)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            View Your Highlight Reel
          </Button>
        )}

        {status === 'failed' && (
          <Button 
            onClick={() => navigate(`/project/${projectId}`)}
            variant="outline"
            className="w-full"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingProgressCard;
