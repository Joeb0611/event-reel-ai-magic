
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
        status: 'processing',
        progress: 0,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      throw jobError;
    }

    // Start background processing
    EdgeRuntime.waitUntil(processWeddingVideos(supabaseClient, job.id, projectId));

    return new Response(
      JSON.stringify({ jobId: job.id, status: 'processing' }),
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

async function processWeddingVideos(supabase: any, jobId: string, projectId: string) {
  try {
    // Fetch all videos for the project
    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .eq('project_id', projectId);

    console.log(`Processing ${videos?.length || 0} videos for project ${projectId}`);

    // Simulate AI analysis progress
    const totalSteps = 5;
    const detectedMoments: WeddingMoment[] = [];

    for (let step = 0; step < totalSteps; step++) {
      const progress = Math.round(((step + 1) / totalSteps) * 100);
      
      // Simulate different processing steps
      switch (step) {
        case 0:
          // Video preprocessing
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
        case 1:
          // Scene detection
          detectedMoments.push({
            type: 'ceremony',
            subtype: 'processional',
            timestamp: 45,
            duration: 30,
            confidence: 0.92,
            description: 'Bride walking down the aisle'
          });
          await new Promise(resolve => setTimeout(resolve, 3000));
          break;
        case 2:
          // Audio analysis
          detectedMoments.push({
            type: 'ceremony',
            subtype: 'vows',
            timestamp: 120,
            duration: 60,
            confidence: 0.88,
            description: 'Wedding vows exchange'
          });
          await new Promise(resolve => setTimeout(resolve, 2500));
          break;
        case 3:
          // Emotion detection
          detectedMoments.push(
            {
              type: 'ceremony',
              subtype: 'kiss',
              timestamp: 280,
              duration: 15,
              confidence: 0.95,
              description: 'First kiss as married couple'
            },
            {
              type: 'reception',
              subtype: 'first_dance',
              timestamp: 450,
              duration: 90,
              confidence: 0.90,
              description: 'First dance as married couple'
            }
          );
          await new Promise(resolve => setTimeout(resolve, 3000));
          break;
        case 4:
          // Final compilation
          detectedMoments.push(
            {
              type: 'emotional',
              subtype: 'tears_of_joy',
              timestamp: 200,
              duration: 20,
              confidence: 0.85,
              description: 'Emotional moment during ceremony'
            },
            {
              type: 'reception',
              subtype: 'cake_cutting',
              timestamp: 600,
              duration: 25,
              confidence: 0.87,
              description: 'Cake cutting ceremony'
            }
          );
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
      }

      // Update progress
      await supabase
        .from('processing_jobs')
        .update({
          progress,
          detected_moments: detectedMoments,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
    }

    // Mark as completed and generate final video URL
    const editedVideoUrl = `https://example-storage.com/wedding-highlights/${projectId}-${Date.now()}.mp4`;
    
    await supabase
      .from('processing_jobs')
      .update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Update project with edited video URL
    await supabase
      .from('projects')
      .update({ edited_video_url: editedVideoUrl })
      .eq('id', projectId);

    console.log(`Processing completed for job ${jobId}`);

  } catch (error) {
    console.error('Error in background processing:', error);
    
    await supabase
      .from('processing_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}
