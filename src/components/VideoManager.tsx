
import React, { useState } from 'react';
import { Trash2, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoFile } from '@/hooks/useVideos';
import VideoDisplay from './VideoDisplay';
import VideoThumbnailWithLoading from '@/components/ui/VideoThumbnailWithLoading';

interface VideoManagerProps {
  videos: VideoFile[];
  onDeleteVideo: (videoId: string) => void;
  mustIncludeItems: Set<string>;
  onToggleMustInclude: (videoId: string) => void;
}

const VideoManager = ({ videos, onDeleteVideo, mustIncludeItems, onToggleMustInclude }: VideoManagerProps) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);

  const handleThumbnailClick = (video: VideoFile) => {
    setSelectedVideo(video);
  };

  const handleDownload = async (video: VideoFile) => {
    if (video.url) {
      try {
        const link = document.createElement('a');
        link.href = video.url;
        link.download = video.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">No videos uploaded yet.</p>
        <p className="text-sm mt-2">Upload some videos to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold truncate pr-4">{selectedVideo.name}</h3>
              <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                Close
              </Button>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-black rounded">
                <VideoDisplay
                  url={selectedVideo.url}
                  className="w-full h-full"
                  showControls={true}
                  autoPlay={false}
                />
              </div>
              {selectedVideo.guest_name && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    <strong>From:</strong> {selectedVideo.guest_name}
                  </p>
                  {selectedVideo.guest_message && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Message:</strong> {selectedVideo.guest_message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map((video) => {
          const isSelected = mustIncludeItems.has(video.id);
          
          return (
            <div key={video.id} className="relative group">
              <div 
                className={`relative bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all shadow-sm hover:shadow-md ${
                  isSelected ? 'border-blue-500 shadow-blue-100' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleThumbnailClick(video)}
              >
                {/* Thumbnail with loading states */}
                <div className="aspect-video">
                  <VideoThumbnailWithLoading
                    videoUrl={video.url}
                    filePath={video.file_path}
                    streamVideoId={video.stream_video_id}
                    alt={video.name}
                    className="w-full h-full"
                    size="lg"
                  />
                </div>
                
                {/* Must Include Badge */}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow">
                    Must Include
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Video Info & Actions */}
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-sm font-medium truncate" title={video.name}>
                    {video.name}
                  </p>
                  {video.guest_name && (
                    <p className="text-xs text-gray-500 truncate">
                      From: {video.guest_name}
                    </p>
                  )}
                </div>

                {/* Mobile-optimized action buttons */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMustInclude(video.id);
                    }}
                    className="flex-1 text-xs h-8 min-w-[44px]"
                  >
                    {isSelected ? 'Must Include' : 'Optional'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(video);
                    }}
                    className="h-8 px-3 min-w-[44px]"
                    title="Download"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteVideo(video.id);
                    }}
                    className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 min-w-[44px]"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoManager;
