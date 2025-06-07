
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Share2, Copy, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStorageLifecycle } from '@/hooks/useStorageLifecycle';
import StorageWarningBanner from '@/components/storage/StorageWarningBanner';
import { useNavigate } from 'react-router-dom';

interface VideoManagerProps {
  project: {
    id: string;
    name: string;
    edited_video_url?: string;
    local_video_path?: string;
  };
  onVideoDeleted: () => void;
}

const VideoManager = ({ project, onVideoDeleted }: VideoManagerProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { storageInfo, upgradeStorageTier } = useStorageLifecycle(project.id);

  // Use local video path if available, fallback to edited_video_url
  const videoUrl = project.local_video_path || project.edited_video_url;

  const handleExport = () => {
    if (!videoUrl) return;
    
    // Check if storage is expired
    if (storageInfo?.isExpired || storageInfo?.isArchived) {
      toast({
        title: "Download Unavailable",
        description: "This video has expired. Please upgrade your storage plan to access it.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a download link
    const link = document.createElement('a');
    link.href = videoUrl;
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
    if (!videoUrl) return;
    
    setIsDeleting(true);
    try {
      // Remove both the edited video URL and local video path from the project
      const { error } = await supabase
        .from('projects')
        .update({ 
          edited_video_url: null,
          local_video_path: null,
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
    if (!videoUrl) return;
    
    try {
      await navigator.clipboard.writeText(videoUrl);
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

  const handleUpgrade = () => {
    navigate(`/subscription?project=${project.id}`);
  };

  if (!videoUrl) {
    return null;
  }

  return (
    <div className="space-y-4">
      {storageInfo && (
        <StorageWarningBanner
          storageInfo={storageInfo}
          projectId={project.id}
          onUpgrade={handleUpgrade}
        />
      )}
      
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            AI-Edited Video Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Info */}
          {storageInfo && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Storage Information:</p>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Tier:</span> {storageInfo.storageTier.charAt(0).toUpperCase() + storageInfo.storageTier.slice(1)}</p>
                {storageInfo.expiresAt && (
                  <p><span className="font-medium">Expires:</span> {new Date(storageInfo.expiresAt).toLocaleDateString()}</p>
                )}
                {storageInfo.daysUntilExpiration !== null && (
                  <p className={storageInfo.daysUntilExpiration <= 7 ? 'text-orange-600 font-medium' : ''}>
                    <span className="font-medium">Days remaining:</span> {storageInfo.daysUntilExpiration}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Video Preview */}
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-2">Video Preview:</p>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-2">Video URL:</p>
            <p className="text-xs font-mono bg-gray-100 p-2 rounded truncate">
              {videoUrl}
            </p>
            {project.local_video_path && (
              <p className="text-xs text-green-600 mt-1">✓ Stored in Supabase Storage</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="flex-1 min-w-[120px] border-blue-200 text-blue-600 hover:bg-blue-50"
              disabled={storageInfo?.isExpired || storageInfo?.isArchived}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="flex-1 min-w-[120px] border-purple-200 text-purple-600 hover:bg-purple-50"
              disabled={storageInfo?.isExpired || storageInfo?.isArchived}
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

          {(storageInfo?.isExpired || storageInfo?.isArchived) && (
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Upgrade to Restore Access
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoManager;
