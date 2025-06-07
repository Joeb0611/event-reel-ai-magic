
import React, { useState } from 'react';
import { Trash2, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoFile } from '@/hooks/useVideos';
import { getCloudflareStreamThumbnail, extractStreamId, isCloudflareStream } from '@/utils/cloudflareHelpers';
import VideoDisplay from './VideoDisplay';

interface VideoManagerProps {
  videos: VideoFile[];
  onDeleteVideo: (videoId: string) => void;
  mustIncludeItems: Set<string>;
  onToggleMustInclude: (videoId: string) => void;
}

const VideoManager = ({ videos, onDeleteVideo, mustIncludeItems, onToggleMustInclude }: VideoManagerProps) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);

  const getThumbnailUrl = (video: VideoFile): string => {
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }

    // For Cloudflare Stream videos, generate thumbnail
    if (isCloudflareStream(video.file_path)) {
      const streamId = extractStreamId(video.file_path);
      if (streamId) {
        return getCloudflareStreamThumbnail(streamId, { width: 320, height: 180 });
      }
    }

    // For stream_video_id field
    if (video.stream_video_id) {
      return getCloudflareStreamThumbnail(video.stream_video_id, { width: 320, height: 180 });
    }

    // Fallback for other video types
    return video.url || '';
  };

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
      <div className="text-center py-8 text-gray-500">
        <p>No videos uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedVideo.name}</h3>
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map((video) => {
          const thumbnailUrl = getThumbnailUrl(video);
          const isSelected = mustIncludeItems.has(video.id);
          
          return (
            <div key={video.id} className="relative group">
              <div 
                className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => handleThumbnailClick(video)}
              >
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={video.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Thumbnail failed to load:', thumbnailUrl);
                      // Hide broken image
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-gray-400 text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">Preview</p>
                    </div>
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Must Include
                  </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate" title={video.name}>
                    {video.name}
                  </p>
                </div>

                {video.guest_name && (
                  <p className="text-xs text-gray-500 truncate">
                    From: {video.guest_name}
                  </p>
                )}

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMustInclude(video.id);
                    }}
                    className="flex-1 text-xs h-7"
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
                    className="h-7 px-2"
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
                    className="h-7 px-2 text-red-600 hover:text-red-700"
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
