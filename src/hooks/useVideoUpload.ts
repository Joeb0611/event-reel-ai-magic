
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VideoFile } from '@/hooks/useVideos';
import { sanitizeFileName } from '@/utils/security';
import { compressVideo } from '@/utils/videoCompression';
import { getCompressionSettingsFromQuality } from '@/utils/projectSettings';
import { useCloudflareIntegration } from '@/hooks/useCloudflareIntegration';

export const useVideoUpload = (projectId: string, projectName: string) => {
  const [uploading, setUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<{ [key: string]: number }>({});
  const { user } = useAuth();
  const { toast } = useToast();
  const { initiateStreamUpload } = useCloudflareIntegration();

  const projectVideoQuality = 'good'; // This would come from project settings in real implementation
  const compressionSettings = getCompressionSettingsFromQuality(projectVideoQuality);

  const compressAndUploadFile = async (file: File): Promise<VideoFile | null> => {
    try {
      // Compress video automatically based on project settings
      const fileKey = file.name;
      setCompressionProgress(prev => ({ ...prev, [fileKey]: 0 }));

      const compressedFile = await compressVideo(
        file,
        compressionSettings,
        (progress) => {
          setCompressionProgress(prev => ({ ...prev, [fileKey]: progress.progress }));
        }
      );

      // Sanitize filename for security
      const sanitizedFileName = sanitizeFileName(compressedFile.name);

      // Upload to Cloudflare Stream
      const uploadResult = await initiateStreamUpload(
        projectId,
        sanitizedFileName,
        compressedFile.size
      );

      if (!uploadResult.success || !uploadResult.uploadUrl) {
        throw new Error('Failed to get upload URL from Cloudflare');
      }

      // Upload compressed file directly to Cloudflare Stream
      const uploadResponse = await fetch(uploadResult.uploadUrl, {
        method: 'POST',
        body: compressedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Transform to VideoFile format
      return {
        id: uploadResult.databaseId || uploadResult.videoId || '',
        name: sanitizedFileName,
        file_path: `stream://${uploadResult.videoId}`,
        size: compressedFile.size,
        uploaded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        edited: false,
        project_id: projectId,
        user_id: user!.id,
        url: `https://videodelivery.net/${uploadResult.videoId}/manifest/video.m3u8`,
        uploaded_by_guest: false
      };

    } catch (error) {
      console.error('Error compressing and uploading video:', error);
      setCompressionProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
      throw error;
    }
  };

  const uploadFiles = async (files: File[]): Promise<VideoFile[]> => {
    if (files.length === 0 || !user) return [];

    setUploading(true);
    const uploadedVideos: VideoFile[] = [];

    try {
      for (const file of files) {
        const uploadedVideo = await compressAndUploadFile(file);
        if (uploadedVideo) {
          uploadedVideos.push(uploadedVideo);
        }
      }

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded and compressed ${uploadedVideos.length} video(s) to Cloudflare`,
      });

      return uploadedVideos;

    } catch (error) {
      console.error('Error uploading videos:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload videos to Cloudflare",
        variant: "destructive",
      });
      return [];
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    compressionProgress,
    uploadFiles,
    projectVideoQuality
  };
};
