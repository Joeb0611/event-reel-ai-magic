
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Search, 
  Users, 
  Heart, 
  Video, 
  CheckCircle, 
  XCircle, 
  Clock,
  Square,
  RotateCcw
} from 'lucide-react';

interface ProcessingProgressProps {
  status: 'idle' | 'analyzing' | 'detecting' | 'moments' | 'creating' | 'completed' | 'failed';
  progress: number;
  stats: {
    photosAnalyzed: number;
    videosProcessed: number;
    momentsDetected: number;
    facesFound: number;
  };
  estimatedTime?: number;
  onCancel?: () => void;
  onRetry?: () => void;
}

const ProcessingProgress = ({ 
  status, 
  progress, 
  stats, 
  estimatedTime, 
  onCancel, 
  onRetry 
}: ProcessingProgressProps) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'analyzing':
        return {
          title: 'Analyzing Content',
          description: 'AI is reviewing all photos and videos',
          icon: Brain,
          color: 'text-blue-600'
        };
      case 'detecting':
        return {
          title: 'Detecting Faces',
          description: 'Identifying the couple and guests throughout the footage',
          icon: Users,
          color: 'text-purple-600'
        };
      case 'moments':
        return {
          title: 'Finding Key Moments',
          description: 'Discovering emotional highlights and important scenes',
          icon: Heart,
          color: 'text-pink-600'
        };
      case 'creating':
        return {
          title: 'Creating Highlight Reel',
          description: 'Assembling your personalized wedding video',
          icon: Video,
          color: 'text-green-600'
        };
      case 'completed':
        return {
          title: 'Processing Complete',
          description: 'Your wedding highlight reel is ready!',
          icon: CheckCircle,
          color: 'text-green-600'
        };
      case 'failed':
        return {
          title: 'Processing Failed',
          description: 'Something went wrong during processing',
          icon: XCircle,
          color: 'text-red-600'
        };
      default:
        return {
          title: 'Ready to Process',
          description: 'Configure your settings and start AI processing',
          icon: Clock,
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const formatTime = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
          {statusInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Description */}
        <p className="text-gray-600">{statusInfo.description}</p>

        {/* Progress Bar */}
        {(status === 'analyzing' || status === 'detecting' || status === 'moments' || status === 'creating') && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{progress}% Complete</span>
              {estimatedTime && (
                <span className="text-sm text-gray-500">
                  ~{formatTime(estimatedTime)} remaining
                </span>
              )}
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}

        {/* Processing Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-lg font-semibold text-blue-600">{stats.photosAnalyzed}</div>
            <div className="text-xs text-gray-600">Photos Analyzed</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-lg font-semibold text-purple-600">{stats.videosProcessed}</div>
            <div className="text-xs text-gray-600">Videos Processed</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-lg font-semibold text-pink-600">{stats.momentsDetected}</div>
            <div className="text-xs text-gray-600">Moments Detected</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-lg font-semibold text-green-600">{stats.facesFound}</div>
            <div className="text-xs text-gray-600">Faces Found</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {(status === 'analyzing' || status === 'detecting' || status === 'moments' || status === 'creating') && onCancel && (
              <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                Cancel Processing
              </Button>
            )}
            {status === 'failed' && onRetry && (
              <Button variant="outline" onClick={onRetry} className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Retry with Current Settings
              </Button>
            )}
          </div>
          
          {status === 'completed' && (
            <div className="flex gap-2">
              <Button variant="outline">Preview Reel</Button>
              <Button>Download Video</Button>
            </div>
          )}
        </div>

        {/* Processing Stages Indicator */}
        {status !== 'idle' && status !== 'failed' && (
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1 ${status === 'analyzing' ? 'text-blue-600 font-medium' : status === 'detecting' || status === 'moments' || status === 'creating' || status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'analyzing' ? 'bg-blue-600' : status === 'detecting' || status === 'moments' || status === 'creating' || status === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`} />
              Analyzing
            </div>
            <div className={`flex items-center gap-1 ${status === 'detecting' ? 'text-purple-600 font-medium' : status === 'moments' || status === 'creating' || status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'detecting' ? 'bg-purple-600' : status === 'moments' || status === 'creating' || status === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`} />
              Detecting
            </div>
            <div className={`flex items-center gap-1 ${status === 'moments' ? 'text-pink-600 font-medium' : status === 'creating' || status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'moments' ? 'bg-pink-600' : status === 'creating' || status === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`} />
              Moments
            </div>
            <div className={`flex items-center gap-1 ${status === 'creating' ? 'text-green-600 font-medium' : status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'creating' || status === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`} />
              Creating
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingProgress;
