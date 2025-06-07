
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CloudflareUploadResult {
  success: boolean;
  uploadUrl?: string;
  videoId?: string;
  databaseId?: string;
  error?: string;
}

export const useCloudflareIntegration = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const initiateStreamUpload = async (
    projectId: string,
    fileName: string,
    fileSize: number,
    guestName?: string,
    guestMessage?: string
  ): Promise<CloudflareUploadResult> => {
    setIsUploading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cloudflare-stream-upload', {
        body: {
          projectId,
          fileName,
          fileSize,
          guestName,
          guestMessage
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Stream upload initiation failed:', error);
      toast({
        title: "Upload Error",
        description: "Failed to initiate video upload. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsUploading(false);
    }
  };

  const uploadToR2 = async (
    projectId: string,
    fileName: string,
    fileContent: ArrayBuffer
  ): Promise<{ success: boolean; objectKey?: string; publicUrl?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('cloudflare-r2-storage', {
        body: {
          action: 'upload',
          projectId,
          fileName,
          fileContent: Array.from(new Uint8Array(fileContent))
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('R2 upload failed:', error);
      return { success: false, error: error.message };
    }
  };

  const getSignedDownloadUrl = async (
    projectId: string,
    fileName: string
  ): Promise<{ success: boolean; signedUrl?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('cloudflare-r2-storage', {
        body: {
          action: 'get_signed_url',
          projectId,
          fileName
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    isUploading,
    initiateStreamUpload,
    uploadToR2,
    getSignedDownloadUrl
  };
};
