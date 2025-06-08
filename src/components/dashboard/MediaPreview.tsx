
import { Image, Loader } from 'lucide-react';
import VideoThumbnailWithLoading from '@/components/ui/VideoThumbnailWithLoading';
import { VideoFile } from '@/hooks/useVideos';
import { isCloudflareStream } from '@/utils/cloudflareHelpers';

interface MediaPreviewProps {
  video: VideoFile;
  onVideoReady?: (mediaId: string, isReady: boolean) => void;
}

const MediaPreview = ({ video, onVideoReady }: MediaPreviewProps) => {
  const isVideo = (filename: string) => {
    return filename.toLowerCase().includes('.mp4') || filename.toLowerCase().includes('.mov');
  };

  const handleVideoReadyChange = (isReady: boolean) => {
    if (onVideoReady) {
      onVideoReady(video.id, isReady);
    }
  };

  if (isVideo(video.name) || isCloudflareStream(video.file_path || '')) {
    return (
      <VideoThumbnailWithLoading
        videoUrl={video.url}
        filePath={video.file_path}
        streamVideoId={video.stream_video_id}
        alt={video.name}
        className="w-full h-full cursor-pointer"
        size="lg"
        aspectRatio="video"
        onVideoReady={handleVideoReadyChange}
      />
    );
  } else {
    // For images, show thumbnail if available
    const previewUrl = video.thumbnail_url || video.url;
    
    if (previewUrl) {
      return (
        <img
          src={previewUrl}
          alt={video.name}
          className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onError={(e) => {
            console.error('Image error:', e);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <Image className="w-6 h-6 text-gray-400" />
        </div>
      );
    }
  }
};

export default MediaPreview;
