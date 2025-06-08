import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter, Grid, List, Star, Video, Image, Clock, User, Trash2, MoreVertical, Play, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/dialog';
import VideoUpload from '@/components/VideoUpload';
import VideoThumbnailWithLoading from '@/components/ui/VideoThumbnailWithLoading';
import VideoDisplay from '@/components/VideoDisplay';
import { VideoFile } from '@/hooks/useVideos';
import { useIsMobile } from '@/hooks/use-mobile';
import { isCloudflareStream } from '@/utils/cloudflareHelpers';

interface MediaGalleryProps {
  projectVideos: VideoFile[];
  mustIncludeItems: Set<string>;
  onToggleMustInclude: (videoId: string) => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  onDeleteVideo: (videoId: string) => void;
  projectId: string;
  projectName: string;
}

const MediaGallery = ({ 
  projectVideos, 
  mustIncludeItems, 
  onToggleMustInclude,
  onVideosUploaded,
  onDeleteVideo,
  projectId,
  projectName 
}: MediaGalleryProps) => {
  const { isMobile } = useIsMobile();
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'grid');
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<VideoFile | null>(null);
  const [videoReadyStates, setVideoReadyStates] = useState<Map<string, boolean>>(new Map());

  const filteredVideos = projectVideos.filter(video => {
    switch (filter) {
      case 'couple': return !video.uploaded_by_guest;
      case 'guest': return video.uploaded_by_guest;
      case 'photos': return video.name.toLowerCase().includes('.jpg') || 
                           video.name.toLowerCase().includes('.png') || 
                           video.name.toLowerCase().includes('.jpeg');
      case 'videos': return video.name.toLowerCase().includes('.mp4') || 
                           video.name.toLowerCase().includes('.mov');
      case 'must-include': return mustIncludeItems.has(video.id);
      default: return true;
    }
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'size': return b.size - a.size;
      case 'guest': return (a.guest_name || '').localeCompare(b.guest_name || '');
      default: return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    }
  });

  const isVideo = (filename: string) => {
    return filename.toLowerCase().includes('.mp4') || filename.toLowerCase().includes('.mov');
  };

  const handleDeleteVideo = () => {
    if (deleteVideoId) {
      onDeleteVideo(deleteVideoId);
      setDeleteVideoId(null);
    }
  };

  const handleAddMediaClick = () => {
    setShowVideoUpload(true);
  };

  const handleMediaClick = (media: VideoFile) => {
    // For Cloudflare videos, only allow preview if video is ready
    const isCloudflareVideo = isCloudflareStream(media.file_path || '') || media.stream_video_id;
    const isVideoReady = videoReadyStates.get(media.id) || false;
    
    if (!isCloudflareVideo || isVideoReady) {
      setSelectedMedia(media);
    }
  };

  const handleVideoReadyChange = (mediaId: string, isReady: boolean) => {
    setVideoReadyStates(prev => new Map(prev.set(mediaId, isReady)));
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  const MediaPreview = ({ video }: { video: VideoFile }) => {
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
          onVideoReady={(isReady) => handleVideoReadyChange(video.id, isReady)}
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

  return (
    <div className="space-y-3">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base sm:text-lg">Media ({filteredVideos.length})</CardTitle>
            <Button
              onClick={handleAddMediaClick}
              size={isMobile ? "default" : "sm"}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto text-sm touch-target"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          </div>
        </CardHeader>
        
        {/* Filter and Sort Section - Mobile Optimized */}
        <CardContent className="pt-0 space-y-4">
          <div className="space-y-3 sm:space-y-0">
            {/* Filter Row */}
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className={`text-sm ${isMobile ? 'h-11 touch-target' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Media</SelectItem>
                  <SelectItem value="couple">Couple Uploads</SelectItem>
                  <SelectItem value="guest">Guest Uploads</SelectItem>
                  <SelectItem value="photos">Photos Only</SelectItem>
                  <SelectItem value="videos">Videos Only</SelectItem>
                  <SelectItem value="must-include">Must Include</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort and View Mode Row */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className={`text-sm ${isMobile ? 'h-11 touch-target' : ''}`}>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Toggle - Show on all devices but larger on mobile */}
              <div className="flex border rounded-lg bg-white">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size={isMobile ? "default" : "sm"}
                  onClick={() => setViewMode('grid')}
                  className={`${isMobile ? 'touch-target px-3' : ''} ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size={isMobile ? "default" : "sm"}
                  onClick={() => setViewMode('list')}
                  className={`${isMobile ? 'touch-target px-3' : ''} ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      {sortedVideos.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
            : 'space-y-2'
        }>
          {sortedVideos.map((video) => {
            const isCloudflareVideo = isCloudflareStream(video.file_path || '') || video.stream_video_id;
            const isVideoReady = videoReadyStates.get(video.id) || false;
            const canPreview = !isCloudflareVideo || isVideoReady;
            
            return (
              <Card 
                key={video.id} 
                className={`relative group hover:shadow-md transition-shadow ${
                  mustIncludeItems.has(video.id) ? 'ring-2 ring-yellow-400' : ''
                } ${
                  video.uploaded_by_guest ? 'border-purple-200 bg-purple-50/50' : 'border-gray-200'
                } ${
                  !canPreview ? 'opacity-75' : ''
                }`}
              >
                <CardContent className="p-3">
                  {viewMode === 'grid' ? (
                    <>
                      <div 
                        className={`aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden ${
                          canPreview ? 'cursor-pointer' : 'cursor-not-allowed'
                        }`}
                        onClick={() => canPreview && handleMediaClick(video)}
                      >
                        <MediaPreview video={video} />
                        
                        {/* Processing indicator for Cloudflare videos */}
                        {isCloudflareVideo && !isVideoReady && (
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
                            className={`h-7 w-7 p-0 ${mustIncludeItems.has(video.id) ? 'bg-yellow-500 text-white' : 'bg-white/80'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleMustInclude(video.id);
                            }}
                          >
                            <Star className={`w-3 h-3 ${mustIncludeItems.has(video.id) ? 'fill-current' : ''}`} />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-white/80">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => setDeleteVideoId(video.id)}
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
                    </>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div 
                        className={`${isMobile ? 'w-14 h-11' : 'w-12 h-9 sm:w-14 sm:h-10'} bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden relative ${
                          canPreview ? 'cursor-pointer' : 'cursor-not-allowed'
                        }`}
                        onClick={() => canPreview && handleMediaClick(video)}
                      >
                        <MediaPreview video={video} />
                        {isCloudflareVideo && !isVideoReady && (
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
                            {mustIncludeItems.has(video.id) && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <Button
                              variant="ghost"
                              size={isMobile ? "default" : "sm"}
                              onClick={() => onToggleMustInclude(video.id)}
                              className={`${isMobile ? 'h-9 w-9 touch-target' : 'h-7 w-7'} p-0`}
                            >
                              <Star className={`w-4 h-4 ${mustIncludeItems.has(video.id) ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
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
                                  onClick={() => setDeleteVideoId(video.id)}
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
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-gray-400 mb-3">
              {filter === 'all' ? (
                <Image className="w-10 h-10 mx-auto" />
              ) : (
                <Filter className="w-10 h-10 mx-auto" />
              )}
            </div>
            <p className="text-gray-500 mb-3 text-sm">
              {filter === 'all' ? 'No media uploaded yet' : 'No media matches your filter'}
            </p>
            {filter === 'all' && (
              <Button
                onClick={() => setShowVideoUpload(true)}
                variant="outline"
                size="sm"
              >
                Upload Your First Media
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Media Modal - Only show for ready videos */}
      <Dialog open={!!selectedMedia} onOpenChange={handleCloseModal}>
        <DialogPortal>
          <DialogOverlay 
            className="fixed inset-0 z-50 bg-black/80" 
            onClick={handleCloseModal}
          />
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <h2 className="text-lg font-semibold truncate pr-4">
                {selectedMedia?.name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4 bg-white min-h-[50vh]">
              {selectedMedia?.url ? (
                isVideo(selectedMedia.name) || isCloudflareStream(selectedMedia.file_path || '') ? (
                  <VideoDisplay
                    url={selectedMedia.url}
                    streamId={selectedMedia.stream_video_id}
                    className="max-w-full max-h-full"
                    showControls={true}
                    autoPlay={false}
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => console.error('Image error:', e)}
                  />
                )
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">📱</div>
                  <p>Media preview not available</p>
                </div>
              )}
            </div>
            
            {selectedMedia && (
              <div className="px-4 py-3 border-t bg-white">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{(selectedMedia.size / (1024 * 1024)).toFixed(1)} MB</span>
                  <span>{new Date(selectedMedia.uploaded_at).toLocaleString()}</span>
                </div>
                {selectedMedia.guest_name && (
                  <p className="text-sm text-purple-600 mt-1">
                    From: {selectedMedia.guest_name}
                  </p>
                )}
                {selectedMedia.guest_message && (
                  <p className="text-sm text-gray-600 italic mt-1">
                    "{selectedMedia.guest_message}"
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogPortal>
      </Dialog>

      {/* VideoUpload and Delete Dialog */}
      {showVideoUpload && (
        <VideoUpload
          isOpen={showVideoUpload}
          onClose={() => setShowVideoUpload(false)}
          onVideosUploaded={onVideosUploaded}
          projectId={projectId}
          projectName={projectName}
        />
      )}

      <AlertDialog open={!!deleteVideoId} onOpenChange={() => setDeleteVideoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteVideo}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MediaGallery;
