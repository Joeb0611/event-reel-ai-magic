import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VideoFile {
  id: string;
  name: string;
  file_path: string;
  size: number;
  uploaded_at: string;
  created_at: string;
  edited: boolean;
  project_id: string;
  user_id: string;
  url?: string;
  guest_name?: string;
  guest_message?: string;
  uploaded_by_guest?: boolean;
}

export const useVideos = (projectId: string | null) => {
  const { toast } = useToast();
  const [projectVideos, setProjectVideos] = useState<VideoFile[]>([]);

  useEffect(() => {
    if (projectId) {
      fetchProjectVideos(projectId);
    }
  }, [projectId]);

  const fetchProjectVideos = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const videosWithUrls = await Promise.all(
        (data || []).map(async (video) => {
          // Determine which bucket to use based on upload type
          const bucket = video.uploaded_by_guest ? 'guest-uploads' : 'videos';
          
          const { data: urlData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(video.file_path, 3600);
          
          return {
            ...video,
            created_at: video.uploaded_at, // Map uploaded_at to created_at for compatibility
            url: urlData?.signedUrl
          };
        })
      );

      setProjectVideos(videosWithUrls);
    } catch (error) {
      console.error('Error fetching project videos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project videos",
        variant: "destructive",
      });
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      // Get the video details first
      const { data: video, error: fetchError } = await supabase
        .from('videos')
        .select('file_path, uploaded_by_guest')
        .eq('id', videoId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const bucket = video.uploaded_by_guest ? 'guest-uploads' : 'videos';
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([video.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (dbError) throw dbError;

      // Update local state
      setProjectVideos(prev => prev.filter(v => v.id !== videoId));
      
      toast({
        title: "Media Deleted",
        description: "Media file has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete media file",
        variant: "destructive",
      });
    }
  };

  const handleVideosUploaded = (uploadedVideos: VideoFile[]) => {
    setProjectVideos([...uploadedVideos, ...projectVideos]);
    toast({
      title: "Success",
      description: `${uploadedVideos.length} video(s) uploaded successfully`,
    });
  };

  return {
    projectVideos,
    handleVideosUploaded,
    deleteVideo,
  };
};
