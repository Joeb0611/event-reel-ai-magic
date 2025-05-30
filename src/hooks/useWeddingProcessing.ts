
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    if (projectId) {
      fetchCurrentJob();
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
          detected_moments: (data.detected_moments as WeddingMoment[]) || [],
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

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-wedding-videos', {
        body: { projectId, userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "AI Processing Started",
        description: "Your wedding videos are being analyzed for key moments.",
      });

      // Start polling for updates
      setTimeout(fetchCurrentJob, 1000);

    } catch (error) {
      console.error('Error starting processing:', error);
      toast({
        title: "Error",
        description: "Failed to start AI processing. Please try again.",
        variant: "destructive",
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
    startProcessing,
    cancelProcessing,
    refetchJob: fetchCurrentJob
  };
};
