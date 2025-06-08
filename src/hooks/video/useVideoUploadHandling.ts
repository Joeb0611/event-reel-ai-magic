
import { useToast } from '@/hooks/use-toast';
import { VideoFile } from './types';

export const useVideoUploadHandling = () => {
  const { toast } = useToast();

  const handleVideosUploaded = (uploadedVideos: VideoFile[], onUpdate: (videos: VideoFile[]) => void) => {
    onUpdate(uploadedVideos);
    toast({
      title: "Success",
      description: `${uploadedVideos.length} video(s) uploaded successfully to Cloudflare`,
    });
  };

  return { handleVideosUploaded };
};
