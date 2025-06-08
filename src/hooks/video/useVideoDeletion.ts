
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVideoDeletion = () => {
  const { toast } = useToast();

  const deleteVideo = async (videoId: string): Promise<boolean> => {
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

      toast({
        title: "Media Deleted",
        description: "Media file has been deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete media file",
        variant: "destructive",
      });
      return false;
    }
  };

  return { deleteVideo };
};
