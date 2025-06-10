import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, User, Trash2, MoreVertical, Loader } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MediaPreview from './MediaPreview';
import { VideoFile } from '@/hooks/useVideos';
import { useIsMobile } from '@/hooks/use-mobile';
import { isCloudflareStream } from '@/utils/cloudflareHelpers';

interface MediaListItemProps {
  video: VideoFile;
  mustInclude: boolean;
  canPreview: boolean;
  onToggleMustInclude: (videoId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onMediaClick: (media: VideoFile) => void;
  onVideoReady?: (mediaId: string, isReady: boolean) => void;
}

const MediaListItem = ({
  video,
  mustInclude,
  canPreview,
  onToggleMustInclude,
  onDeleteVideo,
  onMediaClick,
  onVideoReady
}: MediaListItemProps) => {
  const { isMobile } = useIsMobile();

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
        <div className="flex items-start gap-3">
          <div 
            className={`${isMobile ? 'w-14 h-11' : 'w-12 h-9 sm:w-14 sm:h-10'} bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden relative ${
              canPreview ? 'cursor-pointer' : 'cursor-not-allowed'
            }`}
            onClick={() => canPreview && onMediaClick(video)}
          >
            <MediaPreview video={video} onVideoReady={onVideoReady} />
            {!video.url && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Loader className="w-3 h-3 animate-spin text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isMobile ? 'text-sm' : 'text-sm'}`}>{video.name}</p>
                <div className={`flex items-center gap-2 text-gray-500 mt-0.5 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                  <span>•</span>
                  <span>{new Date(video.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {mustInclude && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
                <Button
                  variant="ghost"
                  size={isMobile ? "default" : "sm"}
                  onClick={() => onToggleMustInclude(video.id)}
                  className={`${isMobile ? 'h-9 w-9 touch-target' : 'h-7 w-7'} p-0`}
                >
                  <Star className={`w-4 h-4 ${mustInclude ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size={isMobile ? "default" : "sm"} 
                      className={`${isMobile ? 'h-9 w-9 touch-target' : 'h-7 w-7'} p-0`}
                    >
                      <MoreVertical className="w-4 h-4" />
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
            
            {video.uploaded_by_guest && (
              <div className="space-y-1">
                {video.guest_name && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-purple-600 flex-shrink-0" />
                    <span className="text-xs text-purple-600 font-medium truncate">{video.guest_name}</span>
                  </div>
                )}
                {video.guest_message && (
                  <p className="text-xs text-gray-600 italic line-clamp-1">"{video.guest_message}"</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaListItem;
