import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import AISettingsPanel, { WeddingAISettings } from '@/components/ai/AISettingsPanel';
import ProcessingProgress from '@/components/ai/ProcessingProgress';
import DetectedMomentsPreview from '@/components/ai/DetectedMomentsPreview';
import { useWeddingProcessing } from '@/hooks/useWeddingProcessing';

interface EnhancedAIProcessingPanelProps {
  projectId: string;
  hasVideos: boolean;
  mustIncludeCount?: number;
  onProcessingComplete?: () => void;
}

const EnhancedAIProcessingPanel = ({ 
  projectId, 
  hasVideos,
  mustIncludeCount = 0,
  onProcessingComplete 
}: EnhancedAIProcessingPanelProps) => {
  const { currentJob, isProcessing, startProcessing, cancelProcessing } = useWeddingProcessing(projectId);
  
  const [showPreview, setShowPreview] = useState(false);
  
  // AI Configuration State using the new interface
  const [aiSettings, setAiSettings] = useState<WeddingAISettings>({
    videoStyle: 'romantic',
    duration: '2min',
    contentFocus: 'balanced',
    musicStyle: 'romantic',
    includeMustInclude: true,
    useCustomMusic: false
  });

  // Mock processing progress state
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'analyzing' | 'detecting' | 'moments' | 'creating' | 'completed' | 'failed'>('idle');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStats, setProcessingStats] = useState({
    photosAnalyzed: 0,
    videosProcessed: 0,
    momentsDetected: 0,
    facesFound: 0
  });

  const handleStartProcessing = async () => {
    console.log('Starting AI processing with settings:', aiSettings);
    
    // If preview mode is enabled and we have detected moments, show preview first
    if (currentJob?.detected_moments?.length) {
      setShowPreview(true);
      return;
    }
    
    await startProcessing();
  };

  const handleApprovePreview = () => {
    setShowPreview(false);
    // Continue with actual processing
    startProcessing();
  };

  const handleRejectPreview = () => {
    setShowPreview(false);
    // Allow user to adjust settings
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

  // Show preview of detected moments
  if (showPreview && currentJob?.detected_moments?.length) {
    return (
      <DetectedMomentsPreview
        moments={currentJob.detected_moments}
        onApprove={handleApprovePreview}
        onReject={handleRejectPreview}
      />
    );
  }

  // Show processing progress
  if (currentJob?.status === 'processing' || currentJob?.status === 'pending' || processingStatus !== 'idle') {
    return (
      <ProcessingProgress
        status={processingStatus}
        progress={processingProgress}
        stats={processingStats}
        estimatedTime={180} // 3 minutes estimate
        onCancel={cancelProcessing}
        onRetry={handleStartProcessing}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Settings Panel */}
      <AISettingsPanel
        settings={aiSettings}
        onSettingsChange={setAiSettings}
        mustIncludeCount={mustIncludeCount}
      />

      {/* Start Processing Button */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-green-900 mb-1">
                Ready to Create Your Highlight Reel
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  {aiSettings.duration} {aiSettings.videoStyle} style • 
                  {aiSettings.contentFocus} focus • 
                  {aiSettings.musicStyle} music
                </p>
                {aiSettings.includeMustInclude && mustIncludeCount > 0 && (
                  <p>Including {mustIncludeCount} must-have moment{mustIncludeCount !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
            <Button
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              size="lg"
            >
              <Brain className="w-5 h-5 mr-2" />
              {isProcessing ? 'Starting...' : 'Start AI Processing'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAIProcessingPanel;
