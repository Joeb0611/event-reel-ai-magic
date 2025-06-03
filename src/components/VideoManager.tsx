
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VideoManagerProps {
  project: {
    id: string;
    name: string;
    edited_video_url?: string;
  };
  onVideoDeleted: () => void;
}

const VideoManager = ({ project, onVideoDeleted }: VideoManagerProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    if (!project.edited_video_url) return;
    
    // Create a download link
    const link = document.createElement('a');
    link.href = project.edited_video_url;
    link.download = `${project.name}-highlight-reel.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Started",
      description: "Video download has started",
    });
  };

  const handleDelete = async () => {
    if (!project.edited_video_url) return;
    
    setIsDeleting(true);
    try {
      // Remove the edited video URL from the project using the correct column name
      const { error } = await supabase
        .from('projects')
        .update({ 
          edited_video_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      onVideoDeleted();
      toast({
        title: "Success",
        description: "AI-edited video has been deleted",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    if (!project.edited_video_url) return;
    
    try {
      await navigator.clipboard.writeText(project.edited_video_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link Copied",
        description: "Video link has been copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  if (!project.edited_video_url) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          AI-Edited Video Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-3">
          <p className="text-sm text-gray-600 mb-2">Video URL:</p>
          <p className="text-xs font-mono bg-gray-100 p-2 rounded truncate">
            {project.edited_video_url}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px] border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px] border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </>
            )}
          </Button>
          
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px] border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoManager;
