
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
    const { action, projectId, fileName, fileContent } = await req.json();
    
    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const r2BucketName = Deno.env.get('CLOUDFLARE_R2_BUCKET');
    
    console.log('Environment check:', {
      hasAccountId: !!cfAccountId,
      hasApiToken: !!cfApiToken,
      hasBucketName: !!r2BucketName,
      accountIdLength: cfAccountId?.length,
      tokenLength: cfApiToken?.length,
      action,
      projectId,
      fileName
    });
    
    if (!cfAccountId || !cfApiToken || !r2BucketName) {
      const missingVars = [];
      if (!cfAccountId) missingVars.push('CLOUDFLARE_ACCOUNT_ID');
      if (!cfApiToken) missingVars.push('CLOUDFLARE_API_TOKEN');
      if (!r2BucketName) missingVars.push('CLOUDFLARE_R2_BUCKET');
      
      console.error('Missing Cloudflare credentials:', missingVars);
      throw new Error(`Missing Cloudflare credentials: ${missingVars.join(', ')}`);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (action === 'upload') {
      console.log('Processing upload for file:', fileName, 'Size:', Array.isArray(fileContent) ? fileContent.length : 'unknown');
      
      // Convert array of numbers back to Uint8Array
      const uint8Array = new Uint8Array(fileContent);
      console.log('Converted to Uint8Array, size:', uint8Array.length);
      
      // Upload to R2 - Use the correct API endpoint format
      const objectKey = `media/${projectId}/${fileName}`;
      console.log('Uploading to R2 with key:', objectKey);
      
      // Encode the object key for URL
      const encodedObjectKey = encodeURIComponent(objectKey);
      const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/r2/buckets/${r2BucketName}/objects/${encodedObjectKey}`;
      console.log('Upload URL:', uploadUrl);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/octet-stream',
          'Content-Length': uint8Array.length.toString(),
        },
        body: uint8Array
      });

      console.log('R2 upload response status:', uploadResponse.status);
      console.log('R2 upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('R2 upload failed:', uploadResponse.status, errorText);
        
        // Try to parse Cloudflare error response
        try {
          const errorData = JSON.parse(errorText);
          console.error('Cloudflare error details:', errorData);
          
          // Provide more specific error messages
          if (errorData.errors && errorData.errors.length > 0) {
            const firstError = errorData.errors[0];
            if (firstError.code === 10001) {
              throw new Error('Cloudflare authentication failed. Please check your API token and account ID.');
            } else if (firstError.code === 10006) {
              throw new Error('Cloudflare R2 bucket not found. Please check your bucket name.');
            } else {
              throw new Error(`Cloudflare error: ${firstError.message}`);
            }
          }
        } catch (parseError) {
          console.error('Could not parse error response as JSON');
        }
        
        throw new Error(`R2 upload failed: ${uploadResponse.status} ${errorText}`);
      }

      // Create public URL - R2 public URLs follow this pattern
      const publicUrl = `https://${r2BucketName}.r2.dev/${objectKey}`;
      console.log('Upload successful, public URL:', publicUrl);
      
      return new Response(JSON.stringify({
        success: true,
        objectKey,
        publicUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'get_signed_url') {
      // Generate signed URL for download
      const objectKey = `media/${projectId}/${fileName}`;
      
      // For R2, we'll return the public URL for now
      // In production, you might want to generate actual signed URLs using the R2 API
      const publicUrl = `https://${r2BucketName}.r2.dev/${objectKey}`;
      
      console.log('Generated signed URL for:', objectKey);
      
      return new Response(JSON.stringify({
        success: true,
        signedUrl: publicUrl,
        expiresIn: 3600
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cloudflare-r2-storage:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
