
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Heart, Clock, Video, Image, MessageSquare, Trophy, Eye, EyeOff } from 'lucide-react';
import { VideoFile } from '@/hooks/useVideos';
import { useState } from 'react';

interface GuestContributionsProps {
  guestVideos: VideoFile[];
  totalContributors: number;
}

const GuestContributions = ({ guestVideos, totalContributors }: GuestContributionsProps) => {
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  // Guest leaderboard
  const guestStats = guestVideos.reduce((acc, video) => {
    if (!video.guest_name) return acc;
    
    if (!acc[video.guest_name]) {
      acc[video.guest_name] = { count: 0, totalSize: 0, messages: [] };
    }
    
    acc[video.guest_name].count++;
    acc[video.guest_name].totalSize += video.size;
    
    if (video.guest_message) {
      acc[video.guest_name].messages.push(video.guest_message);
    }
    
    return acc;
  }, {} as Record<string, { count: number; totalSize: number; messages: string[] }>);

  const sortedGuests = Object.entries(guestStats)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 10);

  const recentUploads = guestVideos
    .filter(video => !hiddenItems.has(video.id))
    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    .slice(0, 10);

  const toggleItemVisibility = (videoId: string) => {
    const newHidden = new Set(hiddenItems);
    if (newHidden.has(videoId)) {
      newHidden.delete(videoId);
    } else {
      newHidden.add(videoId);
    }
    setHiddenItems(newHidden);
  };

  const isVideo = (filename: string) => {
    return filename.toLowerCase().includes('.mp4') || filename.toLowerCase().includes('.mov');
  };

  if (guestVideos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Guest Contributions Yet</h3>
          <p className="text-gray-500">
            Share your QR code with wedding guests to start receiving photos and videos!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Uploads</p>
                <p className="text-3xl font-bold text-purple-600">{guestVideos.length}</p>
              </div>
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contributors</p>
                <p className="text-3xl font-bold text-blue-600">{totalContributors}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Messages</p>
                <p className="text-3xl font-bold text-green-600">
                  {guestVideos.filter(v => v.guest_message).length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guest Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedGuests.map(([guestName, stats], index) => (
              <div key={guestName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{guestName}</p>
                    <p className="text-sm text-gray-500">
                      {stats.count} upload{stats.count !== 1 ? 's' : ''} • {(stats.totalSize / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{stats.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Guest Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUploads.map((video) => (
              <div 
                key={video.id} 
                className={`flex items-start gap-4 p-4 border rounded-lg transition-opacity ${
                  hiddenItems.has(video.id) ? 'opacity-50 bg-gray-50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                    isVideo(video.name) ? (
                      <Video className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Image className="w-6 h-6 text-gray-400" />
                    )
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{video.name}</p>
                    {hiddenItems.has(video.id) && (
                      <Badge variant="secondary" className="text-xs">Hidden</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {video.guest_name && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {video.guest_name}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(video.uploaded_at).toLocaleString()}
                    </span>
                  </div>
                  
                  {video.guest_message && (
                    <div className="bg-blue-50 border-l-4 border-blue-200 p-3 mt-2">
                      <p className="text-sm text-blue-800 italic">"{video.guest_message}"</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleItemVisibility(video.id)}
                    className={hiddenItems.has(video.id) ? 'text-gray-400' : 'text-red-500'}
                  >
                    {hiddenItems.has(video.id) ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestContributions;
