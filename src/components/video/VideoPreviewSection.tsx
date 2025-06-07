
import React from 'react';
import VideoDisplay from '@/components/VideoDisplay';

interface VideoPreviewSectionProps {
  videoUrl: string;
  videoReady: boolean;
  videoError: boolean;
  onVideoError: () => void;
  onVideoLoad: () => void;
  onCheckVideoReady: () => void;
}

const VideoPreviewSection = ({
  videoUrl,
  videoReady,
  videoError,
  onVideoError,
  onVideoLoad,
  onCheckVideoReady
}: VideoPreviewSectionProps) => {
  return (
    <div className="bg-white rounded-lg p-3">
      <p className="text-sm text-gray-600 mb-2">Video Preview:</p>
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <VideoDisplay
          url={videoUrl}
          className="w-full h-full object-cover"
          showControls={true}
          autoPlay={false}
          muted={false}
          loop={false}
        />
      </div>
    </div>
  );
};

export default VideoPreviewSection;
