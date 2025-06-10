import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AI_SERVICE_CONFIG, mapVideoStyleToAI, mapDurationToAI, mapContentFocusToAI } from '@/config/aiService';
import { EventAISettings } from '@/components/ai/AISettingsPanel';
import { VideoFile } from '@/hooks/useVideos';
import { AIInsights } from '@/hooks/useEventProcessing';

interface MediaFile {
  id: string;
  type: 'video' | 'image';
  path: string;
  duration?: number;
}

interface ProcessingSettings {
  style: string;
  duration: string;
  contentFocus: string;
  customMusicUrl: string | null;
  aiEnhancement: boolean;
  faceDetectionPriority: boolean;
  emotionalMoments: boolean;
}

interface AIProcessingResult {
  success: boolean;
  project_id: string;
  message: string;
  result?: {
    status: string;
    video_url: string;
    local_video_path?: string;
    highlight_duration: string;
    scenes_included: string[];
    ai_insights: AIInsights;
  };
}

interface AIStatusResponse {
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  estimated_completion?: string;
}

export const useAIService = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const { toast } = useToast();

  const checkHealth = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${AI_SERVICE_CONFIG.baseUrl}${AI_SERVICE_CONFIG.endpoints.health}`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      return response.ok;
    } catch (error) {
      console.error('AI service health check failed:', error);
      
      // Check if it's a CORS error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn('CORS error detected - AI service may need CORS configuration');
        // Return true to allow processing to continue despite CORS issues
        return true;
      }
      
      return false;
    }
  };

  const mapMediaFiles = (videos: VideoFile[]): MediaFile[] => {
    return videos.map(video => ({
      id: video.id,
      type: video.name.toLowerCase().includes('.mp4') || video.name.toLowerCase().includes('.mov') ? 'video' : 'image',
      path: video.url || '',
      duration: video.name.toLowerCase().includes('.mp4') || video.name.toLowerCase().includes('.mov') ? 120 : undefined
    }));
  };

  const mapProcessingSettings = (settings: EventAISettings, customMusicUrl?: string): ProcessingSettings => {
    return {
      style: mapVideoStyleToAI(settings.videoStyle),
      duration: mapDurationToAI(settings.duration),
      contentFocus: mapContentFocusToAI(settings.contentFocus),
      customMusicUrl: settings.useCustomMusic ? customMusicUrl || null : null,
      aiEnhancement: true,
      faceDetectionPriority: true,
      emotionalMoments: settings.contentFocus === 'highlights'
    };
  };

  const processProject = async (
    projectId: string, 
    userId: string, 
    videos: VideoFile[], 
    settings: EventAISettings,
    customMusicUrl?: string
  ): Promise<AIProcessingResult | null> => {
    setIsProcessing(true);
    setProcessingStatus('processing');

    try {
      // Check health first, but don't fail if CORS issues exist
      const isHealthy = await checkHealth();
      if (!isHealthy) {
        console.warn('AI service health check failed, but proceeding with processing attempt');
      }

      const mediaFiles = mapMediaFiles(videos);
      const processingSettings = mapProcessingSettings(settings, customMusicUrl);

      console.log('Starting AI processing with:', {
        project_id: `event_${projectId}`,
        media_files: mediaFiles,
        processing_settings: processingSettings,
        user_id: userId
      });

      const response = await fetch(`${AI_SERVICE_CONFIG.baseUrl}${AI_SERVICE_CONFIG.endpoints.processProject}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: `event_${projectId}`,
          media_files: mediaFiles,
          processing_settings: processingSettings,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`AI processing failed: ${response.status} - ${response.statusText}`);
      }

      const result: AIProcessingResult = await response.json();
      
      if (result.success) {
        setProcessingStatus('completed');
        toast({
          title: "AI Processing Started",
          description: result.message,
        });
      } else {
        throw new Error(result.message || 'AI processing failed');
      }

      return result;

    } catch (error) {
      console.error('AI processing error:', error);
      setProcessingStatus('failed');
      
      let errorMessage = 'Failed to start AI processing. Please try again.';
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to AI service. Please check CORS configuration or try again later.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "AI Processing Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const checkStatus = async (projectId: string): Promise<AIStatusResponse | null> => {
    try {
      const response = await fetch(`${AI_SERVICE_CONFIG.baseUrl}${AI_SERVICE_CONFIG.endpoints.status}/event_${projectId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      return null;
    }
  };

  const getResults = async (projectId: string): Promise<AIProcessingResult | null> => {
    try {
      const response = await fetch(`${AI_SERVICE_CONFIG.baseUrl}${AI_SERVICE_CONFIG.endpoints.results}/event_${projectId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Results fetch failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Results fetch error:', error);
      return null;
    }
  };

  const analyzeSingleMedia = async (mediaUrl: string): Promise<any> => {
    try {
      const response = await fetch(`${AI_SERVICE_CONFIG.baseUrl}${AI_SERVICE_CONFIG.endpoints.analyzeSingle}?media_url=${encodeURIComponent(mediaUrl)}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Single media analysis error:', error);
      return null;
    }
  };

  return {
    isProcessing,
    processingStatus,
    checkHealth,
    processProject,
    checkStatus,
    getResults,
    analyzeSingleMedia
  };
};
