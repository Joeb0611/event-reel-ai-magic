
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, Square, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useEventProcessing, EventMoment } from '@/hooks/useEventProcessing';
import { useVideos } from '@/hooks/useVideos';

interface AIProcessingPanelProps {
  projectId: string;
  hasVideos: boolean;
  onProcessingComplete?: () => void;
}

const AIProcessingPanel = ({ projectId, hasVideos, onProcessingComplete }: AIProcessingPanelProps) => {
  const { currentJob, isProcessing, serviceStatus, startProcessing, cancelProcessing, checkServiceHealth } = useEventProcessing(projectId);
  const { projectVideos } = useVideos(projectId);

  const getStatusIcon = () => {
    switch (currentJob?.status) {
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (currentJob?.status) {
      case 'pending':
        return 'Processing queued...';
      case 'processing':
        return `Processing... ${currentJob.progress}%`;
      case 'completed':
        return 'AI Processing Complete';
      case 'failed':
        return 'Processing Failed';
      default:
        return 'Ready to Process';
    }
  };

  const getServiceStatusIcon = () => {
    switch (serviceStatus) {
      case 'available':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'sleeping':
        return <WifiOff className="w-4 h-4 text-orange-500" />;
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getServiceStatusText = () => {
    switch (serviceStatus) {
      case 'available':
        return 'AI Service Online';
      case 'sleeping':
        return 'AI Service Sleeping';
      case 'checking':
        return 'Checking Service...';
      default:
        return 'Service Error';
    }
  };

  const getMomentTypeColor = (type: EventMoment['type']) => {
    switch (type) {
      case 'ceremony':
        return 'bg-purple-100 text-purple-700';
      case 'reception':
        return 'bg-blue-100 text-blue-700';
      case 'emotional':
        return 'bg-pink-100 text-pink-700';
      case 'group':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStartProcessing = async () => {
    const defaultSettings = {
      videoStyle: 'romantic' as const,
      duration: '2min' as const,
      contentFocus: 'balanced' as const,
      musicStyle: 'romantic' as const,
      includeMustInclude: true,
      useCustomMusic: false,
      videoQuality: 'good' as const
    };
    
    await startProcessing(projectVideos, defaultSettings);
  };

  if (!hasVideos) {
    return (
      <Card className="border-gray-200">
        <CardContent className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Upload wedding videos to start AI processing</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          AI Wedding Video Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Status */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-2">
            {getServiceStatusIcon()}
            <span className="text-sm font-medium">{getServiceStatusText()}</span>
          </div>
          <Button
            onClick={checkServiceHealth}
            variant="ghost"
            size="sm"
            className="h-8 px-2"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>

        {/* Service Sleeping Warning */}
        {serviceStatus === 'sleeping' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-700 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Service Sleeping</span>
            </div>
            <p className="text-orange-600 text-sm">
              The AI service is currently sleeping (free tier limitation). It will wake up automatically when you start processing. This may take 1-2 minutes.
            </p>
          </div>
        )}

        {/* Status Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          
          {!currentJob || currentJob.status === 'failed' ? (
            <Button
              onClick={handleStartProcessing}
              disabled={isProcessing || serviceStatus === 'checking'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isProcessing ? 'Starting...' : 'Start AI Processing'}
            </Button>
          ) : currentJob.status === 'processing' || currentJob.status === 'pending' ? (
            <Button
              onClick={cancelProcessing}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Square className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          ) : null}
        </div>

        {/* Progress Bar */}
        {(currentJob?.status === 'processing' || currentJob?.status === 'pending') && (
          <div className="space-y-2">
            <Progress value={currentJob.progress} className="h-2" />
            <p className="text-sm text-gray-600">
              {currentJob.status === 'pending' 
                ? 'Waking up AI service and preparing analysis...'
                : 'Analyzing wedding videos for key moments...'
              }
            </p>
          </div>
        )}

        {/* Error Message */}
        {currentJob?.status === 'failed' && currentJob.error_message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{currentJob.error_message}</p>
          </div>
        )}

        {/* Detected Moments */}
        {currentJob?.detected_moments && currentJob.detected_moments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Key Moments Detected</h4>
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {currentJob.detected_moments.map((moment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMomentTypeColor(moment.type)}`}>
                        {moment.type || 'unknown'}
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {(moment.subtype || 'moment').replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{moment.description || 'No description available'}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{Math.round((moment.confidence || 0) * 100)}% confidence</div>
                    <div>{moment.duration || 0}s clip</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Complete Message */}
        {currentJob?.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Wedding Highlight Reel Ready!</span>
            </div>
            <p className="text-green-600 text-sm">
              Your AI-edited wedding highlight reel has been created with {currentJob.detected_moments?.length || 0} key moments.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIProcessingPanel;
