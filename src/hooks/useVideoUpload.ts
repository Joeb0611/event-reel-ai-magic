
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VideoFile } from '@/hooks/useVideos';
import { sanitizeFileName } from '@/utils/security';
import { useCloudflareIntegration } from '@/hooks/useCloudflareIntegration';

export const useVideoUpload = (projectId: string, projectName: string) => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { initiateStreamUpload, uploadToR2 } = useCloudflareIntegration();

  const uploadFile = async (file: File): Promise<VideoFile | null> => {
    try {
      const sanitizedFileName = sanitizeFileName(file.name);

      if (file.type.startsWith('video/')) {
        // Handle video files - upload to Cloudflare Stream
        const uploadResult = await initiateStreamUpload(
          projectId,
          sanitizedFileName,
          file.size
        );

        if (!uploadResult.success || !uploadResult.uploadUrl) {
          throw new Error('Failed to get upload URL from Cloudflare Stream');
        }

        // Create FormData for multipart/form-data upload
        const formData = new FormData();
        formData.append('file', file, sanitizedFileName);

        // Upload video to Cloudflare Stream with proper form data
        const uploadResponse = await fetch(uploadResult.uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Stream upload error:', uploadResponse.status, errorText);
          throw new Error(`Video upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        // Transform to VideoFile format
        return {
          id: uploadResult.databaseId || uploadResult.videoId || '',
          name: sanitizedFileName,
          file_path: `stream://${uploadResult.videoId}`,
          size: file.size,
          uploaded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          edited: false,
          project_id: projectId,
          user_id: user!.id,
          url: `https://videodelivery.net/${uploadResult.videoId}/manifest/video.m3u8`,
          uploaded_by_guest: false
        };

      } else if (file.type.startsWith('image/')) {
        // Handle image files - upload to Cloudflare R2
        const fileContent = await file.arrayBuffer();
        const uploadResult = await uploadToR2(projectId, sanitizedFileName, fileContent);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'R2 upload failed');
        }

        // Transform to VideoFile format for consistency (even though it's an image)
        return {
          id: `img_${Date.now()}_${Math.random()}`,
          name: sanitizedFileName,
          file_path: `r2://${uploadResult.objectKey}`,
          size: file.size,
          uploaded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          edited: false,
          project_id: projectId,
          user_id: user!.id,
          url: uploadResult.publicUrl,
          uploaded_by_guest: false
        };
      } else {
        throw new Error('Unsupported file type. Please upload images or videos only.');
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const uploadFiles = async (files: File[]): Promise<VideoFile[]> => {
    if (files.length === 0 || !user) return [];

    setUploading(true);
    const uploadedFiles: VideoFile[] = [];

    try {
      for (const file of files) {
        const uploadedFile = await uploadFile(file);
        if (uploadedFile) {
          uploadedFiles.push(uploadedFile);
        }
      }

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${uploadedFiles.length} file(s) to Cloudflare`,
      });

      return uploadedFiles;

    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload files to Cloudflare",
        variant: "destructive",
      });
      return [];
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadFiles
  };
};
