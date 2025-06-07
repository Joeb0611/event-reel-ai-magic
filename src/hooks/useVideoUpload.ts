
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VideoFile } from '@/hooks/useVideos';
import { sanitizeFileName } from '@/utils/security';
import { compressVideo } from '@/utils/videoCompression';
import { getCompressionSettingsFromQuality } from '@/utils/projectSettings';

export const useVideoUpload = (projectId: string, projectName: string) => {
  const [uploading, setUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<{ [key: string]: number }>({});
  const { user } = useAuth();
  const { toast } = useToast();

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

      // Create secure file path with user and project validation
      const sanitizedFileName = sanitizeFileName(compressedFile.name);
      const fileExt = sanitizedFileName.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${user!.id}/${projectId}/${timestamp}-${randomId}.${fileExt}`;
      
      // Upload compressed file to secure videos bucket
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      // Save video metadata with validation
      const { data: videoData, error: dbError } = await supabase
        .from('media_assets')
        .insert([
          {
            user_id: user!.id,
            project_id: projectId,
            file_name: sanitizedFileName,
            file_path: fileName,
            file_type: compressedFile.type,
            file_size: compressedFile.size,
            description: `Video uploaded for ${projectName} (compressed)`,
          },
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file
        await supabase.storage.from('videos').remove([fileName]);
        throw new Error(`Failed to save ${file.name}: ${dbError.message}`);
      }

      // Get signed URL for immediate display
      const { data: urlData } = await supabase.storage
        .from('videos')
        .createSignedUrl(fileName, 3600);

      // Transform to VideoFile format
      return {
        id: videoData.id,
        name: videoData.file_name,
        file_path: videoData.file_path,
        size: videoData.file_size || 0,
        uploaded_at: videoData.upload_date || new Date().toISOString(),
        created_at: videoData.upload_date || new Date().toISOString(),
        edited: false,
        project_id: projectId,
        user_id: user!.id,
        url: urlData?.signedUrl,
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
        description: `Successfully uploaded and compressed ${uploadedVideos.length} video(s)`,
      });

      return uploadedVideos;

    } catch (error) {
      console.error('Error uploading videos:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload videos",
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
