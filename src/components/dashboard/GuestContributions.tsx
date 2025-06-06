
import { useState } from 'react';
import { Play, Download, Trash2, User, MessageSquare, Clock, Image, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoFile } from '@/hooks/useVideos';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GuestContributionsProps {
  guestVideos: VideoFile[];
  onVideoDeleted: () => void;
}

const GuestContributions = ({ guestVideos, onVideoDeleted }: GuestContributionsProps) => {
  const { toast } = useToast();
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);

  // Get unique contributors
  const contributors = guestVideos.reduce((acc, video) => {
    const name = video.guest_name || 'Anonymous';
    if (!acc[name]) {
      acc[name] = { name, count: 0, latestUpload: video.created_at };
    }
    acc[name].count++;
    if (video.created_at > acc[name].latestUpload) {
      acc[name].latestUpload = video.created_at;
    }
    return acc;
  }, {} as Record<string, { name: string; count: number; latestUpload: string }>);

  const sortedContributors = Object.values(contributors)
    .sort((a, b) => b.count - a.count);

  const handleDeleteVideo = async (videoId: string) => {
    setDeletingVideo(videoId);
    try {
      const deleteResult = await supabase
        .from('media_assets')
        .delete()
        .eq('id', videoId);

      if (deleteResult.error) {
        console.error('Delete error:', deleteResult.error);
        throw deleteResult.error;
      }

      toast({
        title: "Media deleted",
        description: "The file has been removed successfully.",
      });
      
      onVideoDeleted();
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingVideo(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isVideo = (fileName: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
    return videoExtensions.some(ext => fileName.toLowerCase().includes(ext));
  };

  const isImage = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.some(ext => fileName.toLowerCase().includes(ext));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const MediaPreview = ({ video }: { video: VideoFile }) => {
    if (!video.url) {
      return (
        <div className="flex items-center justify-center">
          {isVideo(video.name) ? (
            <Video className="w-4 h-4 text-gray-400" />
          ) : (
            <Image className="w-4 h-4 text-gray-400" />
          )}
        </div>
      );
    }

    if (isVideo(video.name)) {
      return (
        <div className="relative group">
          <video
            src={video.url}
            className="w-full h-full object-cover rounded"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
            <Play className="w-4 h-4 text-white" />
          </div>
        </div>
      );
    } else {
      return (
        <img
          src={video.url}
          alt={video.name}
          className="w-full h-full object-cover rounded"
          loading="lazy"
        />
      );
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Contributors Section - Mobile First */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <User className="w-5 h-5 text-purple-600" />
            Contributors ({sortedContributors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedContributors.length === 0 ? (
            <div className="text-center py-6">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No guest contributions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedContributors.map((contributor, index) => (
                <div key={contributor.name} className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-medium">
                      {getInitials(contributor.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                        #{index + 1}
                      </Badge>
                      <p className="font-medium text-sm truncate">{contributor.name}</p>
                    </div>
                    <p className="text-xs text-gray-600">
                      {contributor.count} upload{contributor.count !== 1 ? 's' : ''} • Latest: {new Date(contributor.latestUpload).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Uploads - List Mode */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Uploads ({guestVideos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {guestVideos.length === 0 ? (
            <div className="text-center py-8">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No guest uploads yet
              </h3>
              <p className="text-gray-500 text-sm">
                Share your QR code to start receiving photos and videos from guests!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {guestVideos
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((video) => (
                  <div key={video.id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-3 p-3">
                      {/* Thumbnail */}
                      <div className="w-16 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                        <MediaPreview video={video} />
                        
                        {/* File type indicator */}
                        <div className="absolute top-1 right-1 bg-black/60 text-white px-1 py-0.5 rounded text-xs flex items-center gap-0.5">
                          {isVideo(video.name) ? (
                            <Video className="w-2 h-2" />
                          ) : (
                            <Image className="w-2 h-2" />
                          )}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{video.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <span>{formatFileSize(video.size || 0)}</span>
                              <span>•</span>
                              <span>{new Date(video.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{new Date(video.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          
                          {/* Delete Button */}
                          <Button
                            onClick={() => handleDeleteVideo(video.id)}
                            variant="destructive"
                            size="sm"
                            disabled={deletingVideo === video.id}
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {/* Guest info */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="truncate">{video.guest_name || 'Anonymous'}</span>
                          </div>
                        </div>
                        
                        {/* Guest message */}
                        {video.guest_message && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                            <div className="flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-blue-700 line-clamp-2">{video.guest_message}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestContributions;
