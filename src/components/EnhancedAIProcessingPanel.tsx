
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Bug } from 'lucide-react';
import AISettingsPanel, { WeddingAISettings } from '@/components/ai/AISettingsPanel';
import ProcessingProgressCard from '@/components/ai/ProcessingProgressCard';
import DetectedMomentsPreview from '@/components/ai/DetectedMomentsPreview';
import { useWeddingProcessing } from '@/hooks/useWeddingProcessing';
import { useVideos } from '@/hooks/useVideos';

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
  const { projectVideos } = useVideos(projectId);
  
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
    
    // Start processing with actual videos and settings
    await startProcessing(projectVideos, aiSettings);
  };

  const handleApprovePreview = () => {
    setShowPreview(false);
    // Continue with actual processing
    startProcessing(projectVideos, aiSettings);
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
    const estimatedTime = currentJob?.status === 'processing' ? 240 : undefined; // 4 minutes for live AI
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

  // Show results if completed
  if (currentJob?.status === 'completed' && currentJob.result_video_url) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">🎉 AI Processing Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-green-800">Your wedding highlight reel has been created successfully!</p>
          
          {currentJob.ai_insights && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {currentJob.ai_insights.total_people_detected}
                </div>
                <div className="text-sm text-gray-600">People Detected</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-pink-600">
                  {currentJob.ai_insights.ceremony_moments}
                </div>
                <div className="text-sm text-gray-600">Ceremony Moments</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {currentJob.ai_insights.reception_moments}
                </div>
                <div className="text-sm text-gray-600">Reception Moments</div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={() => window.open(currentJob.result_video_url, '_blank')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              View Highlight Reel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                const link = document.createElement('a');
                link.href = currentJob.result_video_url!;
                link.download = 'wedding-highlight-reel.mp4';
                link.click();
              }}
              className="flex-1"
            >
              Download Video
            </Button>
          </div>
        </CardContent>
      </Card>
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
                <p className="text-xs text-green-600">
                  🚀 Using live AI service - Processing takes 3-5 minutes
                </p>
              </div>
            </div>
            <Button
              onClick={handleStartProcessing}
              disabled={isProcessing || !projectVideos.length}
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
