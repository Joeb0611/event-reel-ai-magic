
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Run the archive function
    const { error: archiveError } = await supabase.rpc('archive_expired_content');
    
    if (archiveError) {
      console.error('Archive function error:', archiveError);
      throw new Error('Failed to run archive cleanup');
    }

    // Send expiration warnings (7 days before expiration)
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + 7);

    const { data: expiringProjects } = await supabase
      .from('projects')
      .select('id, user_id, name, expires_at')
      .lte('expires_at', warningDate.toISOString())
      .is('archived_at', null);

    if (expiringProjects) {
      for (const project of expiringProjects) {
        // Check if warning already sent
        const { data: existingNotification } = await supabase
          .from('storage_notifications')
          .select('id')
          .eq('project_id', project.id)
          .eq('notification_type', 'expiration_warning')
          .single();

        if (!existingNotification) {
          await supabase
            .from('storage_notifications')
            .insert({
              project_id: project.id,
              user_id: project.user_id,
              notification_type: 'expiration_warning'
            });
        }
      }
    }

    // Send final warnings (1 day before expiration)
    const finalWarningDate = new Date();
    finalWarningDate.setDate(finalWarningDate.getDate() + 1);

    const { data: finalWarningProjects } = await supabase
      .from('projects')
      .select('id, user_id, name, expires_at')
      .lte('expires_at', finalWarningDate.toISOString())
      .is('archived_at', null);

    if (finalWarningProjects) {
      for (const project of finalWarningProjects) {
        const { data: existingNotification } = await supabase
          .from('storage_notifications')
          .select('id')
          .eq('project_id', project.id)
          .eq('notification_type', 'final_warning')
          .single();

        if (!existingNotification) {
          await supabase
            .from('storage_notifications')
            .insert({
              project_id: project.id,
              user_id: project.user_id,
              notification_type: 'final_warning'
            });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Lifecycle cleanup completed',
      archivedProjects: expiringProjects?.length || 0,
      warningsSent: (expiringProjects?.length || 0) + (finalWarningProjects?.length || 0)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in lifecycle-cleanup:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
