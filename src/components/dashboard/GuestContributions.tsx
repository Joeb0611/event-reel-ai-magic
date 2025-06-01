
import { useState } from 'react';
import { Play, Download, Trash2, User, MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: "Video deleted",
        description: "The video has been removed successfully.",
      });
      
      onVideoDeleted();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
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

  return (
    <div className="space-y-6">
      {/* Contributors Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Guest Contributors ({sortedContributors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedContributors.map((contributor, index) => (
              <div key={contributor.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{contributor.name}</p>
                    <p className="text-sm text-gray-600">
                      {contributor.count} upload{contributor.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Latest: {new Date(contributor.latestUpload).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {sortedContributors.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No guest contributions yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Guest Uploads ({guestVideos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guestVideos
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((video) => (
                <div key={video.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {video.name.toLowerCase().includes('.mp4') || 
                     video.name.toLowerCase().includes('.mov') || 
                     video.name.toLowerCase().includes('.avi') ? (
                      <Play className="w-8 h-8 text-blue-500" />
                    ) : (
                      <Download className="w-8 h-8 text-green-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{video.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {video.guest_name || 'Anonymous'}
                      </span>
                      <span>{formatFileSize(video.size || 0)}</span>
                      <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {video.guest_message && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        {video.guest_message}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => handleDeleteVideo(video.id)}
                      variant="outline"
                      size="sm"
                      disabled={deletingVideo === video.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            
            {guestVideos.length === 0 && (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No guest uploads yet
                </h3>
                <p className="text-gray-500">
                  Share your QR code to start receiving photos and videos from guests!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestContributions;
