
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, fileName, fileSize, guestName, guestMessage } = await req.json();
    
    // Get Cloudflare credentials from environment
    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    
    if (!cfAccountId || !cfApiToken) {
      throw new Error('Cloudflare credentials not configured');
    }

    // Create upload URL from Cloudflare Stream
    const streamResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600,
          metadata: {
            name: fileName,
            projectId,
            guestName: guestName || 'Anonymous',
            uploadedAt: new Date().toISOString()
          }
        })
      }
    );

    if (!streamResponse.ok) {
      throw new Error(`Cloudflare Stream API error: ${streamResponse.status}`);
    }

    const streamData = await streamResponse.json();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store video record in database without stream_status column
    const { data: video, error: dbError } = await supabase
      .from('videos')
      .insert({
        name: fileName,
        file_path: `stream://${streamData.result.uid}`,
        stream_video_id: streamData.result.uid,
        project_id: projectId,
        user_id: projectId, // Will be updated with actual user context
        size: fileSize || 0,
        guest_name: guestName,
        guest_message: guestMessage,
        uploaded_by_guest: !!guestName
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store video record');
    }

    // Send notification
    await supabase
      .from('storage_notifications')
      .insert({
        project_id: projectId,
        user_id: video.user_id,
        notification_type: 'upload_confirmation'
      });

    return new Response(JSON.stringify({
      success: true,
      uploadUrl: streamData.result.uploadURL,
      videoId: streamData.result.uid,
      databaseId: video.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cloudflare-stream-upload:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
