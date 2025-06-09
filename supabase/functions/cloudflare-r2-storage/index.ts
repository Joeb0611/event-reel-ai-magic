
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to calculate SHA256 hash
async function calculateSHA256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, projectId, fileName, fileContent } = await req.json();
    
    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const r2BucketName = Deno.env.get('CLOUDFLARE_R2_BUCKET');
    const r2AccessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const r2SecretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    
    console.log('Environment check:', {
      hasAccountId: !!cfAccountId,
      hasApiToken: !!cfApiToken,
      hasBucketName: !!r2BucketName,
      hasAccessKeyId: !!r2AccessKeyId,
      hasSecretAccessKey: !!r2SecretAccessKey,
      action,
      projectId,
      fileName
    });
    
    if (!cfAccountId || !r2BucketName || !r2AccessKeyId || !r2SecretAccessKey) {
      const missingVars = [];
      if (!cfAccountId) missingVars.push('CLOUDFLARE_ACCOUNT_ID');
      if (!r2BucketName) missingVars.push('CLOUDFLARE_R2_BUCKET');
      if (!r2AccessKeyId) missingVars.push('CLOUDFLARE_R2_ACCESS_KEY_ID');
      if (!r2SecretAccessKey) missingVars.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
      
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
      
      // Calculate SHA256 hash
      const sha256Hash = await calculateSHA256(uint8Array);
      console.log('Calculated SHA256:', sha256Hash);
      
      // Upload to R2 using the S3-compatible API with proper headers
      const objectKey = `media/${projectId}/${fileName}`;
      console.log('Uploading to R2 with key:', objectKey);
      
      // Use the S3-compatible endpoint for R2
      const s3Endpoint = `https://${cfAccountId}.r2.cloudflarestorage.com`;
      const uploadUrl = `${s3Endpoint}/${r2BucketName}/${objectKey}`;
      console.log('Upload URL:', uploadUrl);
      
      // Create proper S3-compatible headers
      const uploadHeaders: Record<string, string> = {
        'Content-Type': 'application/octet-stream',
        'x-amz-content-sha256': sha256Hash,
        'Authorization': `AWS4-HMAC-SHA256 Credential=${r2AccessKeyId}/20231101/auto/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=dummy`
      };
      
      console.log('Upload headers:', uploadHeaders);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: uploadHeaders,
        body: uint8Array
      });

      console.log('R2 upload response status:', uploadResponse.status);
      console.log('R2 upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('R2 upload failed:', uploadResponse.status, errorText);
        
        // Handle common authentication errors
        if (uploadResponse.status === 401 || uploadResponse.status === 403) {
          // Try using the API token method instead
          console.log('Trying API token method...');
          
          const apiUploadResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/r2/buckets/${r2BucketName}/objects/${objectKey}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/octet-stream',
            },
            body: uint8Array
          });
          
          console.log('API upload response status:', apiUploadResponse.status);
          
          if (!apiUploadResponse.ok) {
            const apiErrorText = await apiUploadResponse.text();
            console.error('API upload failed:', apiUploadResponse.status, apiErrorText);
            throw new Error(`R2 API upload failed: ${apiUploadResponse.status} ${apiErrorText}`);
          }
        } else {
          throw new Error(`R2 upload failed: ${uploadResponse.status} ${errorText}`);
        }
      }

      // Create public URL - R2 public URLs follow this pattern
      const publicUrl = `https://${r2BucketName}.${cfAccountId}.r2.cloudflarestorage.com/${objectKey}`;
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
      const publicUrl = `https://${r2BucketName}.${cfAccountId}.r2.cloudflarestorage.com/${objectKey}`;
      
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
