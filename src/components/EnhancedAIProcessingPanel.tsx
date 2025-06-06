
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Bug } from 'lucide-react';
import AISettingsPanel, { WeddingAISettings } from '@/components/ai/AISettingsPanel';
import ProcessingProgress from '@/components/ai/ProcessingProgress';
import ProcessingProgressCard from '@/components/ai/ProcessingProgressCard';
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
  const [testPremium, setTestPremium] = useState(false);
  
  // AI Configuration State using the new interface
  const [aiSettings, setAiSettings] = useState<WeddingAISettings>({
    videoStyle: 'romantic',
    duration: '2min',
    contentFocus: 'balanced',
    musicStyle: 'romantic',
    includeMustInclude: true,
    useCustomMusic: false,
    videoQuality: 'good'
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

  // Show processing progress with navigation
  if (currentJob?.status === 'processing' || currentJob?.status === 'pending') {
    const estimatedTime = currentJob?.status === 'processing' ? 180 : undefined;
    return (
      <ProcessingProgressCard
        projectId={projectId}
        status={currentJob.status}
        progress={currentJob.progress || 0}
        estimatedTimeRemaining={estimatedTime}
        startedAt={currentJob.started_at}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Toggle for Testing Premium Features */}
      <Card className="border-dashed border-orange-300 bg-orange-50/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-orange-600" />
              <div>
                <Label htmlFor="debug-premium" className="text-sm font-medium text-orange-900">
                  Test Premium Features
                </Label>
                <p className="text-xs text-orange-700">
                  Enable this to test premium-only features during development
                </p>
              </div>
            </div>
            <Switch
              id="debug-premium"
              checked={testPremium}
              onCheckedChange={setTestPremium}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Settings Panel */}
      <AISettingsPanel
        settings={aiSettings}
        onSettingsChange={setAiSettings}
        mustIncludeCount={mustIncludeCount}
        projectId={projectId}
        testPremiumMode={testPremium}
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
                  {aiSettings.musicStyle} music • 
                  {aiSettings.videoQuality} quality
                </p>
                {aiSettings.includeMustInclude && mustIncludeCount > 0 && (
                  <p>Including {mustIncludeCount} must-have moment{mustIncludeCount !== 1 ? 's' : ''}</p>
                )}
                {testPremium && (
                  <p className="text-orange-600 font-medium">🧪 Test Premium Mode Active</p>
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
