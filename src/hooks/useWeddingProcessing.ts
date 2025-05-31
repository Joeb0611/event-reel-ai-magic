import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AI_SERVICE_CONFIG, AIServiceError } from '@/config/aiService';

export interface WeddingMoment {
  type: 'ceremony' | 'reception' | 'emotional' | 'group';
  subtype: string;
  timestamp: number;
  duration: number;
  confidence: number;
  description: string;
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
}

export const useWeddingProcessing = (projectId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'sleeping' | 'error'>('available');

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
        fetchCurrentJob();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentJob?.status]);

  const checkServiceHealth = async () => {
    try {
      setServiceStatus('checking');
      const response = await fetch(`${AI_SERVICE_CONFIG.baseUrl}${AI_SERVICE_CONFIG.endpoints.health}`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        setServiceStatus('available');
      } else {
        setServiceStatus('sleeping');
      }
    } catch (error) {
      console.error('Service health check failed:', error);
      setServiceStatus('sleeping');
    }
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
        // Type cast the database response to match our interface
        const typedJob: ProcessingJob = {
          ...data,
          status: data.status as ProcessingJob['status'],
          detected_moments: (data.detected_moments as unknown as WeddingMoment[]) || [],
          progress: data.progress || 0
        };
        setCurrentJob(typedJob);
      } else {
        setCurrentJob(null);
      }
    } catch (error) {
      console.error('Error fetching processing job:', error);
    }
  };

  const startProcessing = async () => {
    if (!projectId || !user) return;

    // Check service health before starting
    if (serviceStatus === 'sleeping') {
      toast({
        title: "AI Service Unavailable",
        description: "The AI service is currently sleeping (free tier). Please try again in a few minutes.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-wedding-videos', {
        body: { projectId, userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "AI Processing Started",
        description: "Your wedding videos are being analyzed by our AI service.",
      });

      // Start polling for updates
      setTimeout(fetchCurrentJob, 1000);

    } catch (error) {
      console.error('Error starting processing:', error);
      
      let errorMessage = "Failed to start AI processing. Please try again.";
      let variant: "destructive" | "default" = "destructive";
      
      if (error.message?.includes('sleeping') || error.message?.includes('unavailable')) {
        errorMessage = "AI service is currently sleeping (free tier). Please try again in a few minutes.";
        setServiceStatus('sleeping');
        // Retry health check in 30 seconds
        setTimeout(checkServiceHealth, 30000);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant,
      });
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
