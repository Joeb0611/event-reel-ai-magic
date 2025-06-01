
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter, Grid, List, Star, Video, Image, Clock, User } from 'lucide-react';
import VideoUpload from '@/components/VideoUpload';
import { VideoFile } from '@/hooks/useVideos';

interface MediaGalleryProps {
  projectVideos: VideoFile[];
  mustIncludeItems: Set<string>;
  onToggleMustInclude: (videoId: string) => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  projectId: string;
  projectName: string;
}

const MediaGallery = ({ 
  projectVideos, 
  mustIncludeItems, 
  onToggleMustInclude,
  onVideosUploaded,
  projectId,
  projectName 
}: MediaGalleryProps) => {
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');

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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Media Gallery ({filteredVideos.length})</CardTitle>
            <Button
              onClick={() => setShowVideoUpload(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
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
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Uploaded</SelectItem>
                <SelectItem value="name">File Name</SelectItem>
                <SelectItem value="size">File Size</SelectItem>
                <SelectItem value="guest">Guest Name</SelectItem>
              </SelectContent>
            </Select>

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
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      {sortedVideos.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2'
        }>
          {sortedVideos.map((video) => (
            <Card 
              key={video.id} 
              className={`relative group hover:shadow-lg transition-shadow ${
                mustIncludeItems.has(video.id) ? 'ring-2 ring-yellow-400' : ''
              } ${
                video.uploaded_by_guest ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-3'}>
                {viewMode === 'grid' ? (
                  // Grid View
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
                      
                      {/* Must Include Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                          mustIncludeItems.has(video.id) ? 'opacity-100 bg-yellow-500 text-white' : 'bg-white/80'
                        }`}
                        onClick={() => onToggleMustInclude(video.id)}
                      >
                        <Star className={`w-4 h-4 ${mustIncludeItems.has(video.id) ? 'fill-current' : ''}`} />
                      </Button>
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
                  // List View
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {isVideo(video.name) ? (
                        <Video className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{video.name}</p>
                        {mustIncludeItems.has(video.id) && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                        <span>{new Date(video.uploaded_at).toLocaleDateString()}</span>
                        {video.uploaded_by_guest && video.guest_name && (
                          <span className="text-purple-600">by {video.guest_name}</span>
                        )}
                      </div>
                      
                      {video.guest_message && (
                        <p className="text-xs text-gray-600 italic mt-1 truncate">"{video.guest_message}"</p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleMustInclude(video.id)}
                      className={mustIncludeItems.has(video.id) ? 'text-yellow-600' : 'text-gray-400'}
                    >
                      <Star className={`w-4 h-4 ${mustIncludeItems.has(video.id) ? 'fill-current' : ''}`} />
                    </Button>
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
    </div>
  );
};

export default MediaGallery;
