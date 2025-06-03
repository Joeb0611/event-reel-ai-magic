
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter, Grid, List, Star, Video, Image, Clock, User, Trash2, MoreVertical } from 'lucide-react';
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
import VideoUpload from '@/components/VideoUpload';
import { VideoFile } from '@/hooks/useVideos';
import { useIsMobile } from '@/hooks/use-mobile';

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

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Media ({filteredVideos.length})</CardTitle>
            <Button
              onClick={() => setShowVideoUpload(true)}
              size={isMobile ? "sm" : "default"}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Filter and Sort Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full">
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

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Uploaded</SelectItem>
                  <SelectItem value="name">File Name</SelectItem>
                  <SelectItem value="size">File Size</SelectItem>
                  <SelectItem value="guest">Guest Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            {!isMobile && (
              <div className="flex justify-end">
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      {sortedVideos.length > 0 ? (
        <div className={
          viewMode === 'grid' && !isMobile
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
        }>
          {sortedVideos.map((video) => (
            <Card 
              key={video.id} 
              className={`relative group hover:shadow-lg transition-shadow ${
                mustIncludeItems.has(video.id) ? 'ring-2 ring-yellow-400' : ''
              } ${
                video.uploaded_by_guest ? 'border-purple-200 bg-purple-50/50' : 'border-gray-200'
              }`}
            >
              <CardContent className={viewMode === 'grid' && !isMobile ? 'p-4' : 'p-3'}>
                {viewMode === 'grid' && !isMobile ? (
                  // Grid View (Desktop only)
                  <>
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      {video.url ? (
                        isVideo(video.name) ? (
                          <video
                            src={video.url}
                            className="w-full h-full object-cover rounded-lg"
                            muted
                          />
                        ) : (
                          <img
                            src={video.url}
                            alt={video.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )
                      ) : (
                        <div className="text-center">
                          {isVideo(video.name) ? (
                            <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          ) : (
                            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          )}
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={mustIncludeItems.has(video.id) ? 'bg-yellow-500 text-white' : 'bg-white/80'}
                          onClick={() => onToggleMustInclude(video.id)}
                        >
                          <Star className={`w-4 h-4 ${mustIncludeItems.has(video.id) ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="bg-white/80">
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
                    
                    <div className="space-y-2">
                      <p className="font-medium text-sm truncate">{video.name}</p>
                      
                      {video.uploaded_by_guest ? (
                        <div className="space-y-1">
                          {video.guest_name && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-purple-600" />
                              <span className="text-xs text-purple-600 font-medium">{video.guest_name}</span>
                            </div>
                          )}
                          {video.guest_message && (
                            <p className="text-xs text-gray-600 italic line-clamp-2">"{video.guest_message}"</p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Your Upload</Badge>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(video.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View (Mobile and Desktop list mode)
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {video.url ? (
                        isVideo(video.name) ? (
                          <video
                            src={video.url}
                            className="w-full h-full object-cover rounded"
                            muted
                          />
                        ) : (
                          <img
                            src={video.url}
                            alt={video.name}
                            className="w-full h-full object-cover rounded"
                          />
                        )
                      ) : (
                        isVideo(video.name) ? (
                          <Video className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Image className="w-5 h-5 text-gray-400" />
                        )
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{video.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                            <span>{new Date(video.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {mustIncludeItems.has(video.id) && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleMustInclude(video.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Star className={`w-4 h-4 ${mustIncludeItems.has(video.id) ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-400 mb-4">
              {filter === 'all' ? (
                <Image className="w-12 h-12 mx-auto" />
              ) : (
                <Filter className="w-12 h-12 mx-auto" />
              )}
            </div>
            <p className="text-gray-500 mb-4">
              {filter === 'all' ? 'No media uploaded yet' : 'No media matches your filter'}
            </p>
            {filter === 'all' && (
              <Button
                onClick={() => setShowVideoUpload(true)}
                variant="outline"
              >
                Upload Your First Media
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {showVideoUpload && (
        <VideoUpload
          isOpen={showVideoUpload}
          onClose={() => setShowVideoUpload(false)}
          onVideosUploaded={onVideosUploaded}
          projectId={projectId}
          projectName={projectName}
        />
      )}

      {/* Delete Confirmation Dialog */}
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
        </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MediaGallery;
