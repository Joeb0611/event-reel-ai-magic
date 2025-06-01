
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Settings, BarChart3, Eye } from 'lucide-react';
import AIStyleSelector from '@/components/ai/AIStyleSelector';
import ContentPreferences from '@/components/ai/ContentPreferences';
import AdvancedSettings from '@/components/ai/AdvancedSettings';
import ProcessingProgress from '@/components/ai/ProcessingProgress';
import DetectedMomentsPreview from '@/components/ai/DetectedMomentsPreview';
import { useWeddingProcessing } from '@/hooks/useWeddingProcessing';

interface EnhancedAIProcessingPanelProps {
  projectId: string;
  hasVideos: boolean;
  onProcessingComplete?: () => void;
}

const EnhancedAIProcessingPanel = ({ 
  projectId, 
  hasVideos, 
  onProcessingComplete 
}: EnhancedAIProcessingPanelProps) => {
  const { currentJob, isProcessing, startProcessing, cancelProcessing } = useWeddingProcessing(projectId);
  
  const [activeTab, setActiveTab] = useState('style');
  const [showPreview, setShowPreview] = useState(false);
  
  // AI Configuration State
  const [selectedStyle, setSelectedStyle] = useState('romantic');
  const [contentPreferences, setContentPreferences] = useState({
    includeMustTagged: true,
    guestContentRatio: 40,
    prioritizeEmotional: true,
    includeGuestPerspective: true,
    musicPreference: 'romantic',
    highlightLength: '3',
    focusPreference: 'balanced'
  });
  const [advancedSettings, setAdvancedSettings] = useState({
    customInstructions: '',
    previewMode: true,
    excludeTimeRanges: []
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
    const config = {
      style: selectedStyle,
      preferences: contentPreferences,
      advanced: advancedSettings
    };
    
    console.log('Starting AI processing with config:', config);
    
    // If preview mode is enabled, show detected moments first
    if (advancedSettings.previewMode && currentJob?.detected_moments?.length) {
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
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Wedding Video Processing
          </CardTitle>
          <p className="text-gray-600">
            Configure your AI settings to create the perfect wedding highlight reel
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="style" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Style & Length
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-4">
          <AIStyleSelector
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <ContentPreferences
            preferences={contentPreferences}
            onPreferencesChange={setContentPreferences}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <AdvancedSettings
            settings={advancedSettings}
            onSettingsChange={setAdvancedSettings}
          />
        </TabsContent>
      </Tabs>

      {/* Start Processing Button */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-900 mb-1">
                Ready to Create Your Highlight Reel
              </h3>
              <p className="text-sm text-green-700">
                {contentPreferences.highlightLength} minute {selectedStyle} style • 
                {contentPreferences.guestContentRatio}% guest content • 
                {contentPreferences.musicPreference} music
              </p>
            </div>
            <Button
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
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
