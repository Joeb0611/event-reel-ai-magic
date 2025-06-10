import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, User, Clock, Trash2, MoreVertical, Loader } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MediaPreview from './MediaPreview';
import { VideoFile } from '@/hooks/useVideos';
import { isCloudflareStream } from '@/utils/cloudflareHelpers';

interface MediaGridItemProps {
  video: VideoFile;
  mustInclude: boolean;
  canPreview: boolean;
  onToggleMustInclude: (videoId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onMediaClick: (media: VideoFile) => void;
  onVideoReady?: (mediaId: string, isReady: boolean) => void;
}

const MediaGridItem = ({
  video,
  mustInclude,
  canPreview,
  onToggleMustInclude,
  onDeleteVideo,
  onMediaClick,
  onVideoReady
}: MediaGridItemProps) => {
  const isCloudflareVideo = isCloudflareStream(video.file_path || '') || video.stream_video_id;

  return (
    <Card 
      className={`relative group hover:shadow-md transition-shadow ${
        mustInclude ? 'ring-2 ring-yellow-400' : ''
      } ${
        video.uploaded_by_guest ? 'border-purple-200 bg-purple-50/50' : 'border-gray-200'
      } ${
        !canPreview ? 'opacity-75' : ''
      }`}
    >
      <CardContent className="p-3">
        <div 
          className={`aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden ${
            canPreview ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          onClick={() => canPreview && onMediaClick(video)}
        >
          <MediaPreview video={video} onVideoReady={onVideoReady} />
          
          {/* Processing indicator for videos without URL */}
          {!video.url && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-1" />
                <p className="text-xs">Processing...</p>
              </div>
            </div>
          )}
          
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 ${mustInclude ? 'bg-yellow-500 text-white' : 'bg-white/80'}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMustInclude(video.id);
              }}
            >
              <Star className={`w-3 h-3 ${mustInclude ? 'fill-current' : ''}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-white/80">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onDeleteVideo(video.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="font-medium text-xs truncate">{video.name}</p>
          
          {video.uploaded_by_guest ? (
            <div className="space-y-1">
              {video.guest_name && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium truncate">{video.guest_name}</span>
                </div>
              )}
              {video.guest_message && (
                <p className="text-xs text-gray-600 italic line-clamp-2">"{video.guest_message}"</p>
              )}
            </div>
          ) : (
            <Badge variant="secondary" className="text-xs h-5">Your Upload</Badge>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{new Date(video.uploaded_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaGridItem;
