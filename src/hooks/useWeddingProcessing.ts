
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAIService } from '@/hooks/useAIService';
import { parseWeddingMoments, stringifyWeddingMoments, WeddingMoment } from '@/utils/typeConverters';
import { WeddingAISettings } from '@/components/ai/AISettingsPanel';
import { VideoFile } from '@/hooks/useVideos';

export interface AIInsights {
  total_people_detected: number;
  ceremony_moments: number;
  reception_moments: number;
}

export interface ProcessingJob {
  id: string;
  project_id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  detected_moments: WeddingMoment[];
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  result_video_url?: string;
  local_video_path?: string;
  ai_insights?: AIInsights;
}

// Re-export WeddingMoment for other components
export type { WeddingMoment };

export const useWeddingProcessing = (projectId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'sleeping' | 'error'>('available');
  const aiService = useAIService();

  useEffect(() => {
    if (projectId) {
      fetchCurrentJob();
      checkServiceHealth();
    }
  }, [projectId]);

  // Poll for job updates when processing
  useEffect(() => {
    if (currentJob?.status === 'processing') {
      const interval = setInterval(() => {
        pollAIStatus();
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }
  }, [currentJob?.status]);

  const checkServiceHealth = async () => {
    try {
      setServiceStatus('checking');
      const isHealthy = await aiService.checkHealth();
      setServiceStatus(isHealthy ? 'available' : 'sleeping');
    } catch (error) {
      console.error('Service health check failed:', error);
      setServiceStatus('sleeping');
    }
  };

  const parseAIInsights = (insights: any): AIInsights | undefined => {
    if (!insights) return undefined;
    
    // Handle both string and object formats
    let parsedInsights = insights;
    if (typeof insights === 'string') {
      try {
        parsedInsights = JSON.parse(insights);
      } catch {
        return undefined;
      }
    }
    
    if (parsedInsights && typeof parsedInsights === 'object') {
      return {
        total_people_detected: parsedInsights.total_people_detected || 0,
        ceremony_moments: parsedInsights.ceremony_moments || 0,
        reception_moments: parsedInsights.reception_moments || 0
      };
    }
    
    return undefined;
  };

  const fetchCurrentJob = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('processing_jobs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const typedJob: ProcessingJob = {
          ...data,
          status: data.status as ProcessingJob['status'],
          detected_moments: parseWeddingMoments(data.detected_moments),
          progress: data.progress || 0,
          ai_insights: parseAIInsights(data.ai_insights)
        };
        setCurrentJob(typedJob);
      } else {
        setCurrentJob(null);
      }
    } catch (error) {
      console.error('Error fetching processing job:', error);
    }
  };

  const pollAIStatus = async () => {
    if (!projectId || !currentJob) return;

    try {
      const status = await aiService.checkStatus(projectId);
      if (!status) return;

      // Update local job with AI status
      const updatedJob = {
        ...currentJob,
        status: status.status as ProcessingJob['status'],
        progress: status.progress || currentJob.progress
      };

      setCurrentJob(updatedJob);

      // Update database
      await supabase
        .from('processing_jobs')
        .update({
          status: status.status,
          progress: status.progress || currentJob.progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentJob.id);

      // If completed, get results
      if (status.status === 'completed') {
        const results = await aiService.getResults(projectId);
        if (results?.result) {
          // The AI service result now includes local_video_path from the edge function
          const videoUrl = results.result.local_video_path || results.result.video_url;
          
          await supabase
            .from('processing_jobs')
            .update({
              result_video_url: videoUrl,
              local_video_path: results.result.local_video_path,
              ai_insights: JSON.stringify(results.result.ai_insights),
              completed_at: new Date().toISOString()
            })
            .eq('id', currentJob.id);

          // Update project with final video URL
          await supabase
            .from('projects')
            .update({ 
              edited_video_url: videoUrl,
              local_video_path: results.result.local_video_path
            })
            .eq('id', projectId);

          toast({
            title: "AI Processing Complete!",
            description: results.message,
          });
        }
      }

    } catch (error) {
      console.error('Error polling AI status:', error);
    }
  };

  const startProcessing = async (videos: VideoFile[], settings: WeddingAISettings, customMusicUrl?: string) => {
    if (!projectId || !user) return;

    if (serviceStatus === 'sleeping') {
      toast({
        title: "AI Service Unavailable",
        description: "The AI service is currently sleeping. Please try again in a few minutes.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create processing job in database
      const { data: job, error: jobError } = await supabase
        .from('processing_jobs')
        .insert({
          project_id: projectId,
          user_id: user.id,
          status: 'pending',
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (jobError) throw jobError;

      setCurrentJob({
        ...job,
        status: 'pending' as const,
        detected_moments: [],
        progress: 0,
        ai_insights: undefined
      });

      // Start AI processing
      const result = await aiService.processProject(projectId, user.id, videos, settings, customMusicUrl);

      if (result?.success) {
        // Update job status to processing
        await supabase
          .from('processing_jobs')
          .update({
            status: 'processing',
            progress: 10
          })
          .eq('id', job.id);

        setCurrentJob(prev => prev ? { ...prev, status: 'processing', progress: 10 } : null);
      } else {
        throw new Error('Failed to start AI processing');
      }

    } catch (error) {
      console.error('Error starting processing:', error);
      
      let errorMessage = "Failed to start AI processing. Please try again.";
      
      if (error instanceof Error && (error.message?.includes('unavailable') || error.message?.includes('sleeping'))) {
        errorMessage = "AI service is currently unavailable. Please try again in a few minutes.";
        setServiceStatus('sleeping');
        setTimeout(checkServiceHealth, 30000);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      if (currentJob) {
        await supabase
          .from('processing_jobs')
          .update({ status: 'failed', error_message: errorMessage })
          .eq('id', currentJob.id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelProcessing = async () => {
    if (!currentJob) return;

    try {
      const { error } = await supabase
        .from('processing_jobs')
        .update({ status: 'failed', error_message: 'Cancelled by user' })
        .eq('id', currentJob.id);

      if (error) throw error;

      setCurrentJob(prev => prev ? { ...prev, status: 'failed' as const } : null);
      toast({
        title: "Processing Cancelled",
        description: "AI processing has been cancelled.",
      });
    } catch (error) {
      console.error('Error cancelling processing:', error);
    }
  };

  return {
    currentJob,
    isProcessing,
    serviceStatus,
    startProcessing,
    cancelProcessing,
    refetchJob: fetchCurrentJob,
    checkServiceHealth
  };
};
