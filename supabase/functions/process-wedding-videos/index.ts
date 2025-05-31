
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_SERVICE_URL = 'https://wedding-ai-service.onrender.com';

interface WeddingMoment {
  type: 'ceremony' | 'reception' | 'emotional' | 'group';
  subtype: string;
  timestamp: number;
  duration: number;
  confidence: number;
  description: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { projectId, userId } = await req.json();

    if (!projectId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing projectId or userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create processing job
    const { data: job, error: jobError } = await supabaseClient
      .from('processing_jobs')
      .insert({
        project_id: projectId,
        user_id: userId,
        status: 'pending',
        progress: 0,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      throw jobError;
    }

    // Start processing with external AI service
    EdgeRuntime.waitUntil(processWithExternalService(supabaseClient, job.id, projectId));

    return new Response(
      JSON.stringify({ jobId: job.id, status: 'pending' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-wedding-videos:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processWithExternalService(supabase: any, jobId: string, projectId: string) {
  try {
    // First check if the AI service is healthy
    const healthCheck = await checkServiceHealth();
    if (!healthCheck.healthy) {
      await updateJobStatus(supabase, jobId, 'failed', 0, [], healthCheck.error);
      return;
    }

    // Update job to processing status
    await updateJobStatus(supabase, jobId, 'processing', 5, []);

    // Fetch videos for the project
    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .eq('project_id', projectId);

    console.log(`Processing ${videos?.length || 0} videos for project ${projectId}`);

    // Send videos to external AI service
    const processResponse = await fetch(`${AI_SERVICE_URL}/process-wedding-videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        videos: videos || []
      })
    });

    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      throw new Error(`AI Service error: ${processResponse.status} - ${errorText}`);
    }

    const { jobId: externalJobId } = await processResponse.json();
    console.log(`External AI job started: ${externalJobId}`);

    // Poll the external service for updates
    await pollExternalJobStatus(supabase, jobId, externalJobId);

  } catch (error) {
    console.error('Error in external processing:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      errorMessage = 'AI service is currently unavailable. This may be due to the service sleeping on free tier. Please try again in a few minutes.';
    }
    
    await updateJobStatus(supabase, jobId, 'failed', 0, [], errorMessage);
  }
}

async function checkServiceHealth() {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      return { healthy: true };
    } else {
      return { 
        healthy: false, 
        error: 'AI service is not responding. It may be sleeping (free tier limitation). Please try again in a few minutes.' 
      };
    }
  } catch (error) {
    return { 
      healthy: false, 
      error: 'AI service is currently unavailable. This may be due to the service sleeping on free tier. Please try again in a few minutes.' 
    };
  }
}

async function pollExternalJobStatus(supabase: any, jobId: string, externalJobId: string) {
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/job-status/${externalJobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.status}`);
      }

      const jobStatus = await response.json();
      
      // Update our database with the external job status
      await updateJobStatus(
        supabase, 
        jobId, 
        jobStatus.status, 
        jobStatus.progress || 0,
        jobStatus.detected_moments || []
      );

      if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
        if (jobStatus.status === 'completed' && jobStatus.edited_video_url) {
          // Update project with edited video URL
          await supabase
            .from('projects')
            .update({ edited_video_url: jobStatus.edited_video_url })
            .eq('id', jobStatus.project_id);
        }
        break;
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    } catch (error) {
      console.error('Error polling job status:', error);
      attempts++;
      
      if (attempts >= maxAttempts) {
        await updateJobStatus(
          supabase, 
          jobId, 
          'failed', 
          0, 
          [], 
          'Timeout waiting for AI service response'
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

async function updateJobStatus(
  supabase: any, 
  jobId: string, 
  status: string, 
  progress: number, 
  detectedMoments: WeddingMoment[], 
  errorMessage?: string
) {
  const updateData: any = {
    status,
    progress,
    detected_moments: detectedMoments,
    updated_at: new Date().toISOString()
  };

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  await supabase
    .from('processing_jobs')
    .update(updateData)
    .eq('id', jobId);
}
