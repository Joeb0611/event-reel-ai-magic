
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VideoFile } from './types';

export const useVideoFetching = () => {
  const { toast } = useToast();

  const fetchProjectVideos = async (projectId: string): Promise<VideoFile[]> => {
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
            try {
              const { data: urlData } = await supabase.storage
                .from('videos')
                .createSignedUrl(video.file_path, 3600);
              
              return {
                ...video,
                url: urlData?.signedUrl
              };
            } catch (error) {
              console.error('Error generating signed URL for:', video.file_path, error);
              return video;
            }
          })
        );
        
        allVideos.push(...videosWithUrls);
      }

      // Process videos data (Cloudflare R2)
      if (videosResult.data) {
        const videoData = videosResult.data.map((video) => {
          let url: string | undefined;
          let thumbnail_url: string | undefined;
          
          if (video.file_path?.startsWith('r2://')) {
            // Cloudflare R2 file - construct public URL
            const objectKey = video.file_path.replace('r2://', '');
            url = `https://d067de0dad23153466dc9015deb5d9df.r2.cloudflarestorage.com/memorymixer/${objectKey}`;
            // For R2 images, use the same URL as thumbnail
            if (video.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
              thumbnail_url = url;
            }
          }

          return {
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
            url,
            thumbnail_url
          };
        });
        allVideos.push(...videoData);
      }

      console.log('Fetched videos with direct URLs:', allVideos.map(v => ({ 
        name: v.name, 
        url: v.url, 
        thumbnail_url: v.thumbnail_url,
        file_path: v.file_path 
      })));
      
      return allVideos;
    } catch (error) {
      console.error('Error fetching project videos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project videos",
        variant: "destructive",
      });
      return [];
    }
  };

  return { fetchProjectVideos };
};
