
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create AWS signature v4
async function createSignature(method: string, url: string, headers: Record<string, string>, payload: Uint8Array, accessKeyId: string, secretAccessKey: string, region: string = 'auto') {
  const encoder = new TextEncoder();
  
  // Create canonical request
  const urlObj = new URL(url);
  const canonicalUri = urlObj.pathname;
  const canonicalQueryString = urlObj.search.slice(1);
  
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key]}`)
    .join('\n');
    
  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';');
    
  // Hash payload
  const payloadHash = await crypto.subtle.digest('SHA-256', payload);
  const payloadHashHex = Array.from(new Uint8Array(payloadHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    '',
    signedHeaders,
    payloadHashHex
  ].join('\n');
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const dateTime = headers['x-amz-date'];
  const date = dateTime.slice(0, 8);
  const credentialScope = `${date}/${region}/s3/aws4_request`;
  
  const canonicalRequestHash = await crypto.subtle.digest('SHA-256', encoder.encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  const stringToSign = [
    algorithm,
    dateTime,
    credentialScope,
    canonicalRequestHashHex
  ].join('\n');
  
  // Calculate signature
  const kDate = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`AWS4${secretAccessKey}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const kDateResult = await crypto.subtle.sign('HMAC', kDate, encoder.encode(date));
  
  const kRegion = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(kDateResult),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const kRegionResult = await crypto.subtle.sign('HMAC', kRegion, encoder.encode(region));
  
  const kService = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(kRegionResult),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const kServiceResult = await crypto.subtle.sign('HMAC', kService, encoder.encode('s3'));
  
  const kSigning = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(kServiceResult),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', kSigning, encoder.encode(stringToSign));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return signatureHex;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, projectId, fileName, fileContent } = await req.json();
    
    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const r2BucketName = Deno.env.get('CLOUDFLARE_R2_BUCKET');
    const r2AccessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const r2SecretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    
    console.log('Environment check:', {
      hasAccountId: !!cfAccountId,
      hasAccessKeyId: !!r2AccessKeyId,
      hasSecretAccessKey: !!r2SecretAccessKey,
      hasBucketName: !!r2BucketName,
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
      
      console.error('Missing Cloudflare R2 credentials:', missingVars);
      throw new Error(`Missing Cloudflare R2 credentials: ${missingVars.join(', ')}`);
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
      
      // Upload to R2 using S3-compatible API
      const objectKey = `media/${projectId}/${fileName}`;
      console.log('Uploading to R2 with key:', objectKey);
      
      // Use R2 S3-compatible endpoint
      const uploadUrl = `https://${cfAccountId}.r2.cloudflarestorage.com/${r2BucketName}/${objectKey}`;
      console.log('Upload URL:', uploadUrl);
      
      // Prepare headers for AWS signature
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
      
      const headers: Record<string, string> = {
        'host': `${cfAccountId}.r2.cloudflarestorage.com`,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
        'content-type': 'application/octet-stream',
        'content-length': uint8Array.length.toString(),
      };
      
      console.log('Preparing to sign request with headers:', headers);
      
      // Create authorization header
      const signature = await createSignature('PUT', uploadUrl, headers, uint8Array, r2AccessKeyId, r2SecretAccessKey);
      const date = amzDate.slice(0, 8);
      const credentialScope = `${date}/auto/s3/aws4_request`;
      const credential = `${r2AccessKeyId}/${credentialScope}`;
      const signedHeaders = Object.keys(headers).sort().map(k => k.toLowerCase()).join(';');
      
      headers['authorization'] = `AWS4-HMAC-SHA256 Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
      
      console.log('Authorization header created, making upload request');
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: uint8Array
      });

      console.log('R2 upload response status:', uploadResponse.status);
      console.log('R2 upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('R2 upload failed:', uploadResponse.status, errorText);
        throw new Error(`R2 upload failed: ${uploadResponse.status} ${errorText}`);
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
