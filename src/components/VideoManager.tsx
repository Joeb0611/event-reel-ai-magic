
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStorageLifecycle } from '@/hooks/useStorageLifecycle';
import StorageWarningBanner from '@/components/storage/StorageWarningBanner';
import VideoInfoSection from '@/components/video/VideoInfoSection';
import VideoPreviewSection from '@/components/video/VideoPreviewSection';
import VideoActionsSection from '@/components/video/VideoActionsSection';
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
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { storageInfo, upgradeStorageTier } = useStorageLifecycle(project.id);

  // Use local video path if available, fallback to edited_video_url
  const videoUrl = project.local_video_path || project.edited_video_url;

  // Check if video is ready when component mounts or URL changes
  useEffect(() => {
    if (videoUrl) {
      checkVideoReady();
    }
  }, [videoUrl]);

  const checkVideoReady = async () => {
    if (!videoUrl) return;

    setVideoError(false);
    setVideoReady(false);

    try {
      // For Cloudflare Stream videos, check if they're ready
      if (videoUrl.includes('videodelivery.net') || videoUrl.includes('iframe.videodelivery.net')) {
        // Extract video ID from URL
        const videoId = videoUrl.match(/([a-f0-9]{32})/)?.[1];
        if (videoId) {
          // Try to load the video metadata to check if it's ready
          const testUrl = `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
          const response = await fetch(testUrl, { method: 'HEAD' });
          setVideoReady(response.ok);
          if (!response.ok) {
            console.log('Video still processing on Cloudflare Stream');
          }
        } else {
          setVideoReady(true); // Assume ready if we can't parse ID
        }
      } else {
        // For other video URLs, assume they're ready
        setVideoReady(true);
      }
    } catch (error) {
      console.error('Error checking video status:', error);
      setVideoError(true);
    }
  };

  const handleExport = () => {
    if (!videoUrl || !videoReady) return;
    
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
    if (!videoUrl || !videoReady) return;
    
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

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleVideoLoad = () => {
    setVideoReady(true);
    setVideoError(false);
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
          <VideoInfoSection
            videoUrl={videoUrl}
            projectName={project.name}
            storageInfo={storageInfo}
            onUpgrade={handleUpgrade}
          />

          <VideoPreviewSection
            videoUrl={videoUrl}
            videoReady={videoReady}
            videoError={videoError}
            onVideoError={handleVideoError}
            onVideoLoad={handleVideoLoad}
            onCheckVideoReady={checkVideoReady}
          />
          
          <VideoActionsSection
            videoReady={videoReady}
            storageInfo={storageInfo}
            copied={copied}
            isDeleting={isDeleting}
            onExport={handleExport}
            onShare={handleShare}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoManager;
