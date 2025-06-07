
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
  stream_video_id?: string;
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
      // Query both media_assets and videos table for comprehensive results
      const [mediaAssetsResult, videosResult] = await Promise.all([
        supabase
          .from('media_assets')
          .select('*')
          .eq('project_id', projectId)
          .eq('file_type', 'video')
          .order('upload_date', { ascending: false }),
        
        supabase
          .from('videos')
          .select('*')
          .eq('project_id', projectId)
          .order('uploaded_at', { ascending: false })
      ]);

      const allVideos: VideoFile[] = [];

      // Process media_assets data (legacy Supabase storage)
      if (mediaAssetsResult.data) {
        const mediaVideos = mediaAssetsResult.data.map((asset) => ({
          id: asset.id,
          name: asset.file_name,
          file_path: asset.file_path,
          size: asset.file_size || 0,
          uploaded_at: asset.upload_date || new Date().toISOString(),
          created_at: asset.upload_date || new Date().toISOString(),
          edited: false,
          project_id: projectId,
          user_id: asset.user_id,
          uploaded_by_guest: false
        }));

        // Add signed URLs for Supabase storage files
        const videosWithUrls = await Promise.all(
          mediaVideos.map(async (video) => {
            const { data: urlData } = await supabase.storage
              .from('videos')
              .createSignedUrl(video.file_path, 3600);
            
            return {
              ...video,
              url: urlData?.signedUrl
            };
          })
        );
        
        allVideos.push(...videosWithUrls);
      }

      // Process videos data (Cloudflare Stream)
      if (videosResult.data) {
        const videoData = videosResult.data.map((video) => ({
          id: video.id,
          name: video.name,
          file_path: video.file_path,
          size: video.size,
          uploaded_at: video.uploaded_at,
          created_at: video.uploaded_at,
          edited: video.edited || false,
          project_id: video.project_id,
          user_id: video.user_id,
          guest_name: video.guest_name,
          guest_message: video.guest_message,
          uploaded_by_guest: video.uploaded_by_guest || false,
          stream_video_id: video.stream_video_id,
          // For Cloudflare Stream videos, construct the playback URL
          url: video.stream_video_id 
            ? `https://videodelivery.net/${video.stream_video_id}/manifest/video.m3u8`
            : video.stream_playback_url
        }));
        allVideos.push(...videoData);
      }

      setProjectVideos(allVideos);
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
      // Try to delete from videos table first, fallback to media_assets
      let deleteResult = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (deleteResult.error) {
        deleteResult = await supabase
          .from('media_assets')
          .delete()
          .eq('id', videoId);
      }

      if (deleteResult.error) {
        console.error('Delete error:', deleteResult.error);
        throw deleteResult.error;
      }

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
      description: `${uploadedVideos.length} video(s) uploaded successfully to Cloudflare`,
    });
  };

  return {
    projectVideos,
    handleVideosUploaded,
    deleteVideo,
  };
};
